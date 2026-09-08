import unittest
from unittest.mock import patch

import main
from models import QueryRequest


class ExampleDocumentsTests(unittest.TestCase):
    def setUp(self):
        main.DOCUMENTS_DB.clear()
        main.CHUNKS_DB.clear()

    def test_loading_examples_is_idempotent_and_preserves_page_numbers(self):
        first = main.load_example_documents()
        first_chunk_count = len(main.CHUNKS_DB)
        second = main.load_example_documents()

        self.assertEqual(len(first), 5)
        self.assertEqual(len(second), 5)
        self.assertEqual(len(main.CHUNKS_DB), first_chunk_count)
        self.assertTrue(all(chunk["source"] == "example" for chunk in main.CHUNKS_DB))
        self.assertTrue(all(chunk["page_number"] >= 1 for chunk in main.CHUNKS_DB))

    def test_clear_documents_does_not_remove_examples(self):
        main.load_example_documents()
        main._store_document(
            doc_id="uploaded-doc",
            filename="notes.txt",
            file_size=10,
            pages=["A private uploaded note."],
            source="upload",
        )

        main.clear_documents()

        self.assertNotIn("uploaded-doc", main.DOCUMENTS_DB)
        self.assertEqual(len(main.list_documents("examples")), 5)

    @patch("main._build_client", return_value=None)
    def test_example_query_does_not_retrieve_uploaded_chunks(self, _client):
        main.load_example_documents()
        main._store_document(
            doc_id="uploaded-doc",
            filename="private.txt",
            file_size=20,
            pages=["SECRET-ONLY-UPLOAD private content"],
            source="upload",
        )

        response = main.query_rag(
            QueryRequest(question="SECRET-ONLY-UPLOAD", scope="examples", language="en")
        )

        self.assertTrue(response.retrieved_chunks)
        self.assertTrue(all(chunk.document_id.startswith("example-") for chunk in response.retrieved_chunks))


if __name__ == "__main__":
    unittest.main()
