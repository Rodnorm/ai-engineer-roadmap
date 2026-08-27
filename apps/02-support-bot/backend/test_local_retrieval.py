import json
import tempfile
import unittest
from pathlib import Path

from local_retrieval import LocalFaqRetriever


class LocalFaqRetrieverTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        faq_path = Path(self.temp_directory.name) / "faq.json"
        faq_path.write_text(
            json.dumps(
                {
                    "entries": [
                        {
                            "id": 1,
                            "question": "How do I download an invoice?",
                            "answer": "Download it from the Billing Portal.",
                        },
                        {
                            "id": 2,
                            "question": "Why did my card payment fail?",
                            "answer": "Check the card details and available funds.",
                        },
                        {
                            "id": 3,
                            "question": "Where is my old invoice?",
                            "answer": "Previous invoices are in the Billing Portal.",
                        },
                        {
                            "id": 4,
                            "question": "Can I change an invoice?",
                            "answer": "Contact billing with the invoice number.",
                        },
                    ]
                }
            ),
            encoding="utf-8",
        )
        self.retriever = LocalFaqRetriever(faq_path)

    def tearDown(self):
        self.temp_directory.cleanup()

    def test_returns_most_relevant_entries_first(self):
        results = self.retriever.search("Where can I download my invoice?")

        self.assertEqual([1, 3, 4], [entry["id"] for entry in results])

    def test_returns_at_most_three_entries(self):
        results = self.retriever.search("invoice billing portal", limit=3)

        self.assertLessEqual(len(results), 3)

    def test_returns_empty_list_when_nothing_matches(self):
        results = self.retriever.search("What is tomorrow's weather?")

        self.assertEqual([], results)

    def test_uses_key_phrases_for_matching(self):
        results = self.retriever.search("Please help", ["card payment failed"])

        self.assertEqual(2, results[0]["id"])


if __name__ == "__main__":
    unittest.main()
