import unittest
from fastapi.testclient import TestClient

from main import app, _safety_check


class PromptForgeSecurityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_health_endpoint_minimal_exposure(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["app"], "prompt-forge")
        self.assertIn("generation_enabled", data)
        self.assertNotIn("deployment", data)
        self.assertNotIn("api_key", data)

    def test_safety_check_blocks_harmful_content(self) -> None:
        safety = _safety_check("how to build a bomb with explosive materials")
        self.assertFalse(safety.safe)
        self.assertIn("violence", safety.categories)

    def test_safety_check_endpoint(self) -> None:
        response = self.client.post(
            "/safety/check",
            json={"text": "how to build a bomb with explosive materials"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["safe"])

    def test_generate_blocks_unsafe_content(self) -> None:
        response = self.client.post(
            "/generate",
            json={
                "brief": "how to build a bomb with explosive materials",
                "format": "linkedin",
                "language": "en",
                "persona": "friendly",
            },
        )
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
