import hashlib
import importlib.util
import io
import math
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
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient


def make_test_embedding(text: str) -> list[float]:
    vector = [0.0] * 16
    for word in text.lower().split():
        vector[hashlib.sha256(word.encode()).digest()[0] % len(vector)] += 1.0
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [x / norm for x in vector]
    return vector


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
                    "UPLOAD_DIR": str(self.data_path / "uploads"),
                    "METADATA_DB_PATH": str(self.data_path / "metadata.sqlite3"),
                    "AZURE_OPENAI_ENDPOINT": "",
                    "AZURE_OPENAI_DEPLOYMENT": "",
                    "AZURE_OPENAI_EMBEDDING_DEPLOYMENT": "text-embedding-test",
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

        self.llm = Mock()
        self.llm.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="PocketRAG is a local knowledge base. [1]"))],
            usage=SimpleNamespace(prompt_tokens=20, completion_tokens=10),
        )

        def mock_embeddings_create(model=None, input=None):
            texts = [input] if isinstance(input, str) else list(input)
            data = [SimpleNamespace(embedding=make_test_embedding(t)) for t in texts]
            return SimpleNamespace(data=data)

        self.llm.embeddings.create.side_effect = mock_embeddings_create
        self.real_build_client = self.backend._build_client
        self.enterContext(patch.object(self.backend, "_build_client", return_value=self.llm))
        self.owner_id = str(uuid.uuid4())
        self.client = self.enterContext(TestClient(self.backend.app))
        self.client.headers.update({"X-Owner-ID": self.owner_id})

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
        self.assertEqual(self.backend.store.count_chunks(), 1)
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
        self.assertEqual(self.backend.store.count_chunks(), 0)
        self.assertEqual(list((self.data_path / "uploads").iterdir()), [])

    def test_generates_questions_from_uploaded_context(self):
        self.assertEqual(self.upload().status_code, 201)
        self.llm.chat.completions.create.return_value = SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(
                        content='{"questions":["What is PocketRAG?","How does grounded retrieval work?"]}'
                    )
                )
            ],
            usage=SimpleNamespace(prompt_tokens=20, completion_tokens=10),
        )

        response = self.client.post("/api/suggestions", json={"language": "en"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["generation_status"], "generated")
        self.assertEqual(len(response.json()["questions"]), 2)
        messages = self.llm.chat.completions.create.call_args.kwargs["messages"]
        self.assertIn("untrusted data", messages[0]["content"])
        self.assertIn("PocketRAG is a local knowledge base", messages[1]["content"])

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

        with patch.object(self.backend, "_generate_embeddings", side_effect=RuntimeError("embeddings failed")):
            failed = self.upload("different.txt", b"Different valid document content")
        self.assertEqual(failed.status_code, 503)
        self.assertEqual(len(self.backend.store.list_documents()), 1)
        self.assertEqual(len(list((self.data_path / "uploads").iterdir())), 1)

    def test_delete_failure_is_reported_and_original_is_restored(self):
        upload = self.upload()
        document_id = upload.json()["document_id"]
        with patch.object(self.backend.store, "delete_metadata", side_effect=RuntimeError("store unavailable")):
            response = self.client.delete(f"/api/documents/{document_id}")
        self.assertEqual(response.status_code, 503)
        self.assertIsNotNone(self.backend.store.get_record(document_id))
        self.assertEqual(len(list((self.data_path / "uploads").iterdir())), 1)

    def test_expired_upload_cleanup_removes_file_vectors_and_metadata(self):
        upload = self.upload()
        document_id = upload.json()["document_id"]
        expired_at = datetime.now(timezone.utc) - timedelta(minutes=31)
        with self.backend.store.connection() as connection:
            connection.execute(
                "UPDATE documents SET created_at = ? WHERE id = ?",
                (expired_at.isoformat(), document_id),
            )

        deleted = self.backend._cleanup_expired_uploads(datetime.now(timezone.utc))

        self.assertEqual(deleted, 1)
        self.assertIsNone(self.backend.store.get_record(document_id))
        self.assertEqual(self.backend.store.count_chunks(), 0)
        self.assertEqual(list((self.data_path / "uploads").iterdir()), [])

    def test_clear_only_removes_upload_records_and_preserves_examples(self):
        self.client.post("/api/examples/load")
        example_count = self.backend.store.count_chunks("example")
        self.assertGreater(example_count, 0)
        self.assertEqual(self.upload().status_code, 201)
        self.assertGreater(self.backend.store.count_chunks("upload"), 0)

        response = self.client.delete("/api/documents")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.backend.store.count_chunks("upload"), 0)
        self.assertEqual(self.backend.store.count_chunks("example"), example_count)

    def test_examples_are_idempotent_scoped_and_preserved_by_clear(self):
        first = self.client.post("/api/examples/load")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(len(first.json()), 5)
        example_chunk_count = self.backend.store.count_chunks("example")

        second = self.client.post("/api/examples/load")
        self.assertEqual(second.status_code, 200)
        self.assertEqual(self.backend.store.count_chunks("example"), example_chunk_count)
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

    def test_deployment_document_limit_cannot_be_bypassed_with_new_owner(self):
        limited = replace(
            self.backend.settings,
            max_documents=1,
            max_documents_per_owner=10,
        )
        with patch.object(self.backend, "settings", limited):
            first = self.upload("owner-a.txt", b"Owner A document")
            second = self.client.post(
                "/api/documents/upload",
                headers={"X-Owner-ID": str(uuid.uuid4())},
                files={"file": ("owner-b.txt", b"Owner B document")},
            )

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 429)
        self.assertIn("Deployment document limit", second.json()["error"]["message"])

    def test_owner_document_limit_is_scoped_to_one_session(self):
        owner_b = str(uuid.uuid4())
        limited = replace(
            self.backend.settings,
            max_documents=10,
            max_documents_per_owner=1,
        )
        with patch.object(self.backend, "settings", limited):
            first = self.upload("first.txt", b"First owner document")
            same_owner = self.upload("second.txt", b"Second owner document")
            other_owner = self.client.post(
                "/api/documents/upload",
                headers={"X-Owner-ID": owner_b},
                files={"file": ("other.txt", b"Other owner document")},
            )

        self.assertEqual(first.status_code, 201)
        self.assertEqual(same_owner.status_code, 429)
        self.assertIn("Owner document limit", same_owner.json()["error"]["message"])
        self.assertEqual(other_owner.status_code, 201)

    def test_sessions_isolate_uploads_queries_and_deletes(self):
        upload = self.upload("private.txt", b"Owner A private knowledge")
        self.assertEqual(upload.status_code, 201)
        document_id = upload.json()["document_id"]
        owner_b = str(uuid.uuid4())
        owner_b_headers = {"X-Owner-ID": owner_b}

        self.assertEqual(
            self.client.get("/api/documents", headers=owner_b_headers).json(), []
        )
        query = self.client.post(
            "/api/query",
            headers=owner_b_headers,
            json={"question": "What is private?", "language": "en"},
        )
        self.assertEqual(query.status_code, 200)
        self.assertEqual(query.json()["generation_status"], "not_needed")
        denied_delete = self.client.delete(
            f"/api/documents/{document_id}", headers=owner_b_headers
        )
        self.assertEqual(denied_delete.status_code, 404)
        self.assertIsNotNone(
            self.backend.store.get_record(document_id, owner_id=self.owner_id)
        )

        owner_b_upload = self.client.post(
            "/api/documents/upload",
            headers=owner_b_headers,
            files={"file": ("private.txt", b"Owner A private knowledge")},
        )
        self.assertEqual(owner_b_upload.status_code, 201)

    def test_owner_session_header_is_required_and_validated(self):
        missing = self.client.get("/api/documents", headers={"X-Owner-ID": ""})
        invalid = self.client.get(
            "/api/documents", headers={"X-Owner-ID": "not-a-session"}
        )
        self.assertEqual(missing.status_code, 401)
        self.assertEqual(invalid.status_code, 401)

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

    def test_adversarial_encrypted_and_corrupted_pdf_rejections(self):
        mock_encrypted = Mock()
        mock_encrypted.is_encrypted = True
        with patch.object(self.backend, "PdfReader", return_value=mock_encrypted):
            response = self.upload("secret.pdf", b"%PDF-1.4 encrypted data")
        self.assertEqual(response.status_code, 422)
        self.assertIn("Encrypted PDFs are not supported", response.json()["error"]["message"])

        mock_empty_pdf = Mock()
        mock_empty_pdf.is_encrypted = False
        mock_page = Mock()
        mock_page.extract_text.return_value = "   "
        mock_empty_pdf.pages = [mock_page]
        with patch.object(self.backend, "PdfReader", return_value=mock_empty_pdf):
            response = self.upload("blank.pdf", b"%PDF-1.4 empty visual data")
        self.assertEqual(response.status_code, 422)
        self.assertIn("no extractable text", response.json()["error"]["message"])

    def test_document_parsing_timeout_enforced(self):
        import time

        def slow_parse(*args, **kwargs):
            time.sleep(0.05)
            return []

        limited = replace(self.backend.settings, parsing_timeout_seconds=0.01)
        with patch.object(self.backend, "settings", limited), patch.object(self.backend, "_parse", side_effect=slow_parse):
            response = self.upload("timeout.txt", b"Long text content")
        self.assertEqual(response.status_code, 422)
        self.assertIn("exceeded processing time limit", response.json()["error"]["message"])
        self.assertEqual(list((self.data_path / "uploads").iterdir()), [])

    def test_filename_sanitization_and_traversal_prevention(self):
        response = self.upload("../../../sneaky.txt", b"Safe payload content")
        self.assertEqual(response.status_code, 201)
        files = list((self.data_path / "uploads").iterdir())
        self.assertEqual(len(files), 1)
        self.assertTrue(files[0].resolve().is_relative_to((self.data_path / "uploads").resolve()))

    def test_orphan_and_dangling_uploading_cleanup(self):
        uploads_dir = self.data_path / "uploads"
        uploads_dir.mkdir(parents=True, exist_ok=True)
        stale_uploading = uploads_dir / "temp_id.pdf.uploading"
        stale_uploading.write_bytes(b"unfinished upload")
        stale_deleting = uploads_dir / "temp_id2.pdf.deleting"
        stale_deleting.write_bytes(b"unfinished delete")

        past_mtime = (datetime.now(timezone.utc) - timedelta(minutes=10)).timestamp()
        os.utime(stale_uploading, (past_mtime, past_mtime))
        os.utime(stale_deleting, (past_mtime, past_mtime))

        self.backend._cleanup_expired_uploads(datetime.now(timezone.utc))
        self.assertFalse(stale_uploading.exists())
        self.assertFalse(stale_deleting.exists())


if __name__ == "__main__":
    unittest.main()

