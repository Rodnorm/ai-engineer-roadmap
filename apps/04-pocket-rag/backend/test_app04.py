import unittest
from fastapi.testclient import TestClient
from main import app

class TestPocketRagBackend(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.client.delete("/api/documents")

    def tearDown(self):
        self.client.delete("/api/documents")

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["app"], "pocketRag")

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
        doc_id = upload_data["document_id"]

        docs_res = self.client.get("/api/documents")
        self.assertEqual(docs_res.status_code, 200)
        docs = docs_res.json()
        self.assertEqual(len(docs), 1)
        self.assertEqual(docs[0]["id"], doc_id)

        query_res = self.client.post(
            "/api/query",
            json={"question": "What is PocketRAG?", "top_k": 2, "temperature": 0.2, "language": "en"}
        )
        self.assertEqual(query_res.status_code, 200)
        query_data = query_res.json()
        self.assertNotEqual(query_data["answer"], "")
        self.assertGreater(len(query_data["citations"]), 0)
        self.assertEqual(query_data["citations"][0]["filename"], "test_rag_doc.txt")

        del_res = self.client.delete(f"/api/documents/{doc_id}")
        self.assertEqual(del_res.status_code, 200)

        docs_after_del = self.client.get("/api/documents").json()
        self.assertEqual(len(docs_after_del), 0)

if __name__ == "__main__":
    unittest.main()
