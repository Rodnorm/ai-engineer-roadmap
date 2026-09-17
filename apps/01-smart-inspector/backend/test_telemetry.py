"""Unit tests for OpenTelemetry GenAI tracing and operational metrics."""

from __future__ import annotations

import unittest
from fastapi.testclient import TestClient

from main import app
from telemetry import MetricsCollector, format_traceparent, trace_ai_call


class TestTelemetry(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_traceparent_format_is_w3c_compliant(self) -> None:
        traceparent = format_traceparent("req-12345-abcdef")
        parts = traceparent.split("-")
        self.assertEqual(len(parts), 4)
        self.assertEqual(parts[0], "00")
        self.assertEqual(len(parts[1]), 32)  # trace-id
        self.assertEqual(len(parts[2]), 16)  # span-id
        self.assertEqual(parts[3], "01")

    def test_trace_ai_call_records_otel_attributes_without_prompt_leakage(self) -> None:
        with trace_ai_call(
            operation_name="chat",
            system="azure_openai",
            model="gpt-4o-mini",
            request_id="req-test-999",
        ) as span:
            span["prompt_tokens"] = 120
            span["completion_tokens"] = 35

        self.assertEqual(span["gen_ai.system"], "azure_openai")
        self.assertEqual(span["gen_ai.request.model"], "gpt-4o-mini")
        self.assertEqual(span["status"], "ok")
        self.assertGreaterEqual(span["duration_ms"], 0)
        self.assertEqual(span["prompt_tokens"], 120)
        self.assertEqual(span["completion_tokens"], 35)
        self.assertGreater(span["estimated_cost_usd"], 0)

        # Assert no prompt, input, or PII keys are present
        forbidden_keys = {"prompt", "input", "image", "content", "user_prompt", "text"}
        self.assertTrue(forbidden_keys.isdisjoint(span.keys()))

    def test_metrics_collector_calculates_percentiles(self) -> None:
        collector = MetricsCollector()
        for latency in [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0]:
            collector.record_request(
                duration_ms=latency,
                is_error=False,
                prompt_tokens=10,
                completion_tokens=5,
                cost_usd=0.001,
            )

        summary = collector.get_summary()
        self.assertEqual(summary["total_requests"], 10)
        self.assertEqual(summary["error_count"], 0)
        self.assertEqual(summary["error_rate"], 0.0)
        self.assertAlmostEqual(summary["p50_latency_ms"], 60.0, places=1)
        self.assertAlmostEqual(summary["p95_latency_ms"], 100.0, places=1)
        self.assertEqual(summary["prompt_tokens"], 100)
        self.assertEqual(summary["completion_tokens"], 50)

    def test_metrics_endpoint_returns_json(self) -> None:
        response = self.client.get("/api/metrics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_requests", data)
        self.assertIn("p50_latency_ms", data)
        self.assertIn("p95_latency_ms", data)
        self.assertIn("error_rate", data)


if __name__ == "__main__":
    unittest.main()
