import hashlib
import importlib.util
import io
import os
from pathlib import Path
import socket
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
import uuid
import zipfile
from dataclasses import replace

import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from chromadb.config import Settings
from fastapi.testclient import TestClient


class TestEmbeddings(EmbeddingFunction[Documents]):
    def __init__(self):
        pass

    def __call__(self, input: Documents) -> Embeddings:
        vectors = []
        for text in input:
            vector = [0.0] * 16
            for word in text.lower().split():
                vector[hashlib.sha256(word.encode()).digest()[0] % len(vector)] += 1.0
            vectors.append(vector)
        return vectors

    @staticmethod
    def name():
        return "pocket-rag-test-embeddings"

    def get_config(self):
        return {}

    @staticmethod
    def build_from_config(config):
        return TestEmbeddings()


def docx_bytes(text: str) -> bytes:
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f"<w:body><w:p><w:r><w:t>{text}</w:t></w:r></w:p></w:body></w:document>"
    )
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr("word/document.xml", document)
    return output.getvalue()


class TestPocketRagBackend(unittest.TestCase):
    def setUp(self):
        real_socketpair = socket.socketpair
        real_connect = socket.socket.connect

        def local_socketpair(*args, **kwargs):
            with patch("socket.socket.connect", real_connect):
                return real_socketpair(*args, **kwargs)

        self.enterContext(patch("socket.socketpair", local_socketpair))
        for target in ("socket.socket.connect", "socket.socket.connect_ex", "socket.create_connection"):
            blocker = self.enterContext(patch(target, side_effect=AssertionError("Network disabled in tests")))
            self.addCleanup(blocker.assert_not_called)

        self.temp_directory = self.enterContext(tempfile.TemporaryDirectory(prefix="pocket-rag-test-"))
        self.data_path = Path(self.temp_directory) / "data"
        self.enterContext(
            patch.dict(
                os.environ,
                {
                    "APP_ENV": "test",
                    "DATA_DIR": str(self.data_path),
                    "CHROMA_DB_PATH": str(self.data_path / "chroma"),
                    "UPLOAD_DIR": str(self.data_path / "uploads"),
                    "METADATA_DB_PATH": str(self.data_path / "metadata.sqlite3"),
                    "AZURE_OPENAI_ENDPOINT": "",
                    "AZURE_OPENAI_DEPLOYMENT": "",
                    "AZURE_OPENAI_API_KEY": "",
                    "GENERATION_ENABLED": "true",
                    "MIN_RELEVANCE_SCORE": "0",
                },
            )
        )
        self.dotenv = self.enterContext(patch("dotenv.load_dotenv", return_value=False))
        spec = importlib.util.spec_from_file_location(
            f"pocket_rag_test_app_{uuid.uuid4().hex}", Path(__file__).with_name("main.py")
        )
        self.backend = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.backend)

        self.vector_client = chromadb.PersistentClient(
            path=str(self.data_path / "test-vectors"), settings=Settings(anonymized_telemetry=False)
        )
        self.addCleanup(self.vector_client.close)
        self.collection = self.vector_client.create_collection(
            name=f"test-{uuid.uuid4().hex}",
            embedding_function=TestEmbeddings(),
            metadata={"hnsw:space": "cosine"},
        )
        self.enterContext(patch.object(self.backend, "_get_chroma_collection", return_value=self.collection))
        self.llm = Mock()
        self.llm.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="PocketRAG is a local knowledge base. [1]"))],
            usage=SimpleNamespace(prompt_tokens=20, completion_tokens=10),
        )
        self.real_build_client = self.backend._build_client
        self.enterContext(patch.object(self.backend, "_build_client", return_value=self.llm))
        self.client = self.enterContext(TestClient(self.backend.app))

    def upload(self, name="knowledge.txt", content=b"PocketRAG is a local knowledge base with grounded retrieval."):
        return self.client.post("/api/documents/upload", files={"file": (name, content)})

    def test_health_is_minimal_and_import_does_not_load_credentials(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(response.json()), {"status", "app", "version"})
        self.dotenv.assert_called_once_with()
        self.assertIsNone(self.real_build_client())

    def test_upload_query_persist_and_delete_flow(self):
        upload = self.upload()
        self.assertEqual(upload.status_code, 201)
        document_id = upload.json()["document_id"]
        self.assertEqual(self.collection.count(), 1)
        records = self.backend.store.list_documents()
        self.assertEqual(records[0].id, document_id)
        stored = list((self.data_path / "uploads").iterdir())
        self.assertEqual(len(stored), 1)
        self.assertNotIn("knowledge", stored[0].name)

        restarted_store = self.backend.DocumentStore(
            self.data_path / "metadata.sqlite3", self.data_path / "uploads"
        )
        self.assertEqual(restarted_store.list_documents()[0].id, document_id)

        query = self.client.post("/api/query", json={"question": "What is PocketRAG?", "language": "en"})
        self.assertEqual(query.status_code, 200)
        self.assertEqual(query.json()["generation_status"], "generated")
        self.assertEqual(query.json()["tokens_used"]["total_tokens"], 30)
        self.assertEqual(query.json()["citations"][0]["chunk_index"], 0)
        system_prompt = self.llm.chat.completions.create.call_args.kwargs["messages"][0]["content"]
        self.assertIn("untrusted data", system_prompt)

        deleted = self.client.delete(f"/api/documents/{document_id}")
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(restarted_store.list_documents(), [])
        self.assertEqual(self.collection.count(), 0)
        self.assertEqual(list((self.data_path / "uploads").iterdir()), [])

    def test_docx_markdown_and_utf8_validation(self):
        docx = self.upload("guide.docx", docx_bytes("DOCX content is indexed safely."))
        self.assertEqual(docx.status_code, 201)
        markdown = self.upload("notes.md", b"# Notes\n\nMarkdown content.")
        self.assertEqual(markdown.status_code, 201)
        invalid_text = self.upload("bad.txt", b"\xff\xfe\x00")
        self.assertEqual(invalid_text.status_code, 422)
        invalid_pdf = self.upload("bad.pdf", b"not a pdf")
        self.assertEqual(invalid_pdf.status_code, 422)
        empty = self.upload("empty.txt", b"")
        self.assertEqual(empty.status_code, 422)

    def test_duplicate_and_index_failure_leave_no_orphans(self):
        first = self.upload()
        self.assertEqual(first.status_code, 201)
        duplicate = self.upload()
        self.assertEqual(duplicate.status_code, 409)

        self.collection.add = Mock(side_effect=RuntimeError("index unavailable"))
        failed = self.upload("different.txt", b"Different valid document content")
        self.assertEqual(failed.status_code, 503)
        self.assertEqual(len(self.backend.store.list_documents()), 1)
        self.assertEqual(len(list((self.data_path / "uploads").iterdir())), 1)

    def test_delete_failure_is_reported_and_original_is_restored(self):
        upload = self.upload()
        document_id = upload.json()["document_id"]
        with patch.object(self.collection, "delete", side_effect=RuntimeError("store unavailable")):
            response = self.client.delete(f"/api/documents/{document_id}")
        self.assertEqual(response.status_code, 503)
        self.assertIsNotNone(self.backend.store.get_record(document_id))
        self.assertEqual(len(list((self.data_path / "uploads").iterdir())), 1)

    def test_clear_only_removes_app_collection(self):
        other_collection = self.vector_client.create_collection(
            name=f"unrelated-{uuid.uuid4().hex}", embedding_function=TestEmbeddings()
        )
        other_collection.add(ids=["keep"], documents=["Unrelated document"])
        self.assertEqual(self.upload().status_code, 201)
        response = self.client.delete("/api/documents")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.collection.count(), 0)
        self.assertEqual(other_collection.get()["ids"], ["keep"])

    def test_examples_are_idempotent_scoped_and_preserved_by_clear(self):
        first = self.client.post("/api/examples/load")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(len(first.json()), 5)
        example_chunk_count = self.collection.count()

        second = self.client.post("/api/examples/load")
        self.assertEqual(second.status_code, 200)
        self.assertEqual(self.collection.count(), example_chunk_count)
        self.assertEqual(self.client.get("/api/documents?scope=uploads").json(), [])
        self.assertEqual(len(self.client.get("/api/documents?scope=examples").json()), 5)

        uploaded = self.upload("private.txt", b"SECRET private uploaded material")
        self.assertEqual(uploaded.status_code, 201)
        cleared = self.client.delete("/api/documents")
        self.assertEqual(cleared.status_code, 200)
        self.assertEqual(len(self.client.get("/api/documents?scope=examples").json()), 5)

        query = self.client.post(
            "/api/query",
            json={"question": "Wie hoch ist die Kaution?", "language": "de", "scope": "examples"},
        )
        self.assertEqual(query.status_code, 200)
        self.assertTrue(query.json()["retrieved_chunks"])
        self.assertTrue(all(chunk["source"] == "example" for chunk in query.json()["retrieved_chunks"]))

    def test_private_mode_requires_bearer_key(self):
        with patch.object(self.backend, "settings", replace(self.backend.settings, api_key="private-key")):
            denied = self.client.get("/api/documents")
            allowed = self.client.get(
                "/api/documents", headers={"Authorization": "Bearer private-key"}
            )
        self.assertEqual(denied.status_code, 401)
        self.assertEqual(denied.json()["error"]["code"], "unauthorized")
        self.assertTrue(denied.json()["error"]["request_id"])
        self.assertEqual(allowed.status_code, 200)

    def test_generation_kill_switch_uses_no_tokens_or_provider(self):
        self.assertEqual(self.upload().status_code, 201)
        self.llm.reset_mock()
        with patch.object(
            self.backend, "settings", replace(self.backend.settings, generation_enabled=False)
        ):
            response = self.client.post(
                "/api/query", json={"question": "What is PocketRAG?", "language": "en"}
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["generation_status"], "disabled")
        self.assertEqual(response.json()["tokens_used"]["total_tokens"], 0)
        self.assertEqual(response.json()["citations"], [])
        self.llm.chat.completions.create.assert_not_called()

    def test_shared_rate_limit_and_provider_error_are_sanitized(self):
        self.assertEqual(self.upload().status_code, 201)
        limited = replace(self.backend.settings, requests_per_minute=1, daily_generation_limit=1)
        with patch.object(self.backend, "settings", limited):
            first = self.client.post(
                "/api/query", json={"question": "What is PocketRAG?", "language": "en"}
            )
            second = self.client.post(
                "/api/query", json={"question": "What is it?", "language": "en"}
            )
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 429)
        self.assertIn("Retry-After", second.headers)
        self.assertNotIn("private", str(second.json()).lower())


if __name__ == "__main__":
    unittest.main()
