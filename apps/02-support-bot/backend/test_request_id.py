"""Tests for request ID propagation and API backend prefix routing."""

from __future__ import annotations

import unittest
from fastapi.testclient import TestClient

from main import app


class TestRequestIdAndRouting(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_health_echoes_provided_request_id(self) -> None:
        response = self.client.get("/health", headers={"X-Request-ID": "test-req-456"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("x-request-id"), "test-req-456")

    def test_health_generates_request_id_when_missing(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers.get("x-request-id"))

    def test_api_backend_prefix_is_handled(self) -> None:
        response = self.client.get("/api/backend/health")
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
