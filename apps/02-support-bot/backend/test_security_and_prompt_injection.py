import unittest
from fastapi.testclient import TestClient

from main import app, _mask_pii


class SecurityAndPromptInjectionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_pii_masking_replaces_sensitive_value(self) -> None:
        masked_ssn = _mask_pii("123-45-6789", "SSN")
        self.assertEqual(masked_ssn, "[SSN_REDACTED]")

        masked_email = _mask_pii("john.doe@example.com", "Email")
        self.assertEqual(masked_email, "[EMAIL_REDACTED]")

    def test_rejects_blank_query(self) -> None:
        response = self.client.post("/query", json={"query": "   "})
        self.assertEqual(response.status_code, 422)

    def test_rejects_oversized_query(self) -> None:
        oversized = "a" * 2500
        response = self.client.post("/query", json={"query": oversized})
        self.assertEqual(response.status_code, 422)

    def test_health_endpoint_minimal_exposure(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("generation_enabled", data)
        self.assertNotIn("tenant_id", data)
        self.assertNotIn("client_secret", data)
        self.assertNotIn("azure_agent_endpoint", data)


if __name__ == "__main__":
    unittest.main()
