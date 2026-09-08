import hashlib
import importlib.util
import os
from pathlib import Path
import socket
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
import uuid

import chromadb
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from chromadb.config import Settings
from fastapi.testclient import TestClient


class TestEmbeddings(EmbeddingFunction[Documents]):
    """Deterministic local vectors; no model, credentials, or download required."""

    def __init__(self):
        pass

    def __call__(self, input: Documents) -> Embeddings:
        vectors = []
        for text in input:
            vector = [0.0] * 16
            for word in text.lower().split():
                bucket = hashlib.sha256(word.encode()).digest()[0] % len(vector)
                vector[bucket] += 1.0
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


class TestPocketRagBackend(unittest.TestCase):
    def setUp(self):
        # Register cleanups as resources are created, including when setup fails.
        # Windows implements asyncio's internal socketpair with loopback TCP.
        # Permit only that setup; all application socket connections stay blocked.
        real_socketpair = socket.socketpair
        real_connect = socket.socket.connect

        def local_socketpair(*args, **kwargs):
            with patch("socket.socket.connect", real_connect):
                return real_socketpair(*args, **kwargs)

        self.enterContext(patch("socket.socketpair", local_socketpair))
        for target in ("socket.socket.connect", "socket.socket.connect_ex", "socket.create_connection"):
            blocker = self.enterContext(patch(target, side_effect=AssertionError("Network disabled in tests")))
            self.addCleanup(blocker.assert_not_called)

        self.enterContext(patch.dict(os.environ, {
            "AZURE_OPENAI_ENDPOINT": "",
            "AZURE_OPENAI_DEPLOYMENT": "",
            "AZURE_OPENAI_API_KEY": "",
        }))
        self.dotenv = self.enterContext(patch("dotenv.load_dotenv", return_value=False))

        # A fresh module gives every test independent registries without touching
        # an already imported application or loading the developer's .env.
        spec = importlib.util.spec_from_file_location(
            "pocket_rag_test_app", Path(__file__).with_name("main.py")
        )
        self.backend = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.backend)

        self.temp_directory = self.enterContext(tempfile.TemporaryDirectory(prefix="pocket-rag-test-"))
        self.backend.CHROMA_DB_DIR = self.temp_directory
        self.vector_client = chromadb.PersistentClient(
            path=self.temp_directory, settings=Settings(anonymized_telemetry=False)
        )
        self.addCleanup(self.vector_client.close)
        self.collection = self.vector_client.create_collection(
            name=f"test-{uuid.uuid4().hex}",
            embedding_function=TestEmbeddings(),
            metadata={"hnsw:space": "cosine"},
        )
        self.enterContext(patch.object(self.backend, "_get_chroma_collection", return_value=self.collection))
        persistent_client = self.enterContext(patch.object(
            self.backend.chromadb, "PersistentClient",
            side_effect=AssertionError("Use the isolated test collection"),
        ))
        self.addCleanup(persistent_client.assert_not_called)

        self.llm = Mock()
        self.llm.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="PocketRAG is a local knowledge base. [1]"))],
            usage=SimpleNamespace(prompt_tokens=20, completion_tokens=10),
        )
        self.real_build_client = self.backend._build_client
        self.enterContext(patch.object(self.backend, "_build_client", return_value=self.llm))
        self.client = self.enterContext(TestClient(self.backend.app))

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["app"], "pocketRag")

    def test_import_does_not_load_credentials(self):
        self.dotenv.assert_called_once_with()
        self.assertEqual(self.backend.AZURE_OPENAI_ENDPOINT, "")
        self.assertEqual(self.backend.AZURE_OPENAI_API_KEY, "")
        self.assertIsNone(self.real_build_client())

    def test_stats_empty(self):
        response = self.client.get("/api/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_documents"], 0)
        self.assertEqual(data["total_chunks"], 0)

    def test_upload_query_and_delete_flow(self):
        file_content = b"PocketRAG is a cost-effective local retrieval augmented generation knowledge base built with ChromaDB and Next.js."
        files = {"file": ("test_rag_doc.txt", file_content, "text/plain")}
        
        upload_res = self.client.post("/api/documents/upload", files=files)
        self.assertEqual(upload_res.status_code, 200)
        upload_data = upload_res.json()
        self.assertEqual(upload_data["filename"], "test_rag_doc.txt")
        self.assertGreater(upload_data["chunks_created"], 0)
        self.assertEqual(self.collection.count(), upload_data["chunks_created"])
        doc_id = upload_data["document_id"]

        docs_res = self.client.get("/api/documents")
        self.assertEqual(docs_res.status_code, 200)
        docs = docs_res.json()
        self.assertEqual(len(docs), 1)
        self.assertEqual(docs[0]["id"], doc_id)

        # Require retrieval from ChromaDB rather than the in-memory fallback.
        self.backend.CHUNKS_DB.clear()
        query_res = self.client.post(
            "/api/query",
            json={"question": "What is PocketRAG?", "top_k": 2, "temperature": 0.2, "language": "en"}
        )
        self.assertEqual(query_res.status_code, 200)
        query_data = query_res.json()
        self.assertEqual(query_data["answer"], "PocketRAG is a local knowledge base. [1]")
        self.assertEqual(query_data["tokens_used"]["total_tokens"], 30)
        self.llm.chat.completions.create.assert_called_once()
        self.assertIn("PocketRAG is a cost-effective", self.llm.chat.completions.create.call_args.kwargs["messages"][1]["content"])
        self.assertGreater(len(query_data["citations"]), 0)
        self.assertEqual(query_data["citations"][0]["filename"], "test_rag_doc.txt")

        del_res = self.client.delete(f"/api/documents/{doc_id}")
        self.assertEqual(del_res.status_code, 200)

        docs_after_del = self.client.get("/api/documents").json()
        self.assertEqual(len(docs_after_del), 0)
        self.assertEqual(self.collection.count(), 0)

    def test_clear_documents_only_clears_app_collection(self):
        other_collection = self.vector_client.create_collection(
            name=f"unrelated-{uuid.uuid4().hex}", embedding_function=TestEmbeddings()
        )
        other_collection.add(ids=["keep"], documents=["Unrelated document"])
        upload = self.client.post(
            "/api/documents/upload",
            files={"file": ("temporary.txt", b"Test document content", "text/plain")},
        )
        self.assertEqual(upload.status_code, 200)
        self.assertGreater(self.collection.count(), 0)

        response = self.client.delete("/api/documents")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.collection.count(), 0)
        self.assertEqual(other_collection.get()["ids"], ["keep"])
        self.assertEqual(self.client.get("/api/documents").json(), [])
        self.llm.chat.completions.create.assert_not_called()

if __name__ == "__main__":
    unittest.main()
