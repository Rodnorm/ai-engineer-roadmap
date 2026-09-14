"""Unit tests for App 05 Agentic Workflow Backend (100% offline, zero external calls)."""

from __future__ import annotations

import unittest
from fastapi.testclient import TestClient

import main
from agent import SESSIONS


class TestApp05AgenticWorkflow(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(main.app)
        SESSIONS.clear()
        # Reset limiter
        main.rate_limiter._ip_minute.clear()
        main.rate_limiter._ip_day.clear()
        main.rate_limiter._global_day.clear()
        main.GENERATION_ENABLED = True

    def test_health_check(self) -> None:
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "05-agentic-workflow")

    def test_run_calculation_tool(self) -> None:
        payload = {"prompt": "Calcule quanto é (25 * 40) + 150"}
        res = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "completed")
        self.assertIsNotNone(data["final_answer"])
        # Check tool execution in steps
        step_types = [s["type"] for s in data["steps"]]
        self.assertIn("thought", step_types)
        self.assertIn("tool_call", step_types)
        self.assertIn("tool_result", step_types)
        self.assertIn("answer", step_types)

        calc_result_step = next(s for s in data["steps"] if s["type"] == "tool_result")
        self.assertIn("1150", calc_result_step["tool_result"])

    def test_run_knowledge_search(self) -> None:
        payload = {"prompt": "Qual é a política de reembolso (refund policy)?"}
        res = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "completed")
        step_types = [s["type"] for s in data["steps"]]
        self.assertIn("tool_call", step_types)
        tool_call_step = next(s for s in data["steps"] if s["type"] == "tool_call")
        self.assertEqual(tool_call_step["tool_name"], "knowledge_search")

    def test_human_in_the_loop_approval_flow(self) -> None:
        # Step 1: Request an alert, which is marked sensitive
        payload = {"prompt": "Envie um alerta urgente para @ops-team sobre queda no servidor"}
        res = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "waiting_approval")
        self.assertIsNotNone(data["pending_approval"])
        self.assertEqual(data["pending_approval"]["tool_name"], "send_alert")
        session_id = data["session_id"]

        # Step 2: Approve the action
        approve_payload = {"session_id": session_id, "approved": True}
        res_app = self.client.post("/api/agent/approve", json=approve_payload)
        self.assertEqual(res_app.status_code, 200)
        data_app = res_app.json()
        self.assertEqual(data_app["status"], "completed")
        self.assertIn("ALERT DISPATCHED", data_app["final_answer"])

    def test_human_in_the_loop_rejection_flow(self) -> None:
        payload = {"prompt": "Envie um alerta para @diretoria cancelando o deploy"}
        res = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "waiting_approval")
        session_id = data["session_id"]

        # User rejects execution
        reject_payload = {"session_id": session_id, "approved": False, "reason": "Deploy foi normalizado."}
        res_rej = self.client.post("/api/agent/approve", json=reject_payload)
        self.assertEqual(res_rej.status_code, 200)
        data_rej = res_rej.json()
        self.assertEqual(data_rej["status"], "rejected")
        self.assertIn("Action cancelled", data_rej["final_answer"])

    def test_kill_switch_blocks_execution(self) -> None:
        main.GENERATION_ENABLED = False
        payload = {"prompt": "Calcule 10 + 20"}
        res = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(res.status_code, 503)
        data = res.json()
        self.assertEqual(data["detail"]["code"], "SERVICE_DISABLED")

    def test_rate_limiting(self) -> None:
        # Set limit to 2
        main.rate_limiter.requests_per_minute = 2
        payload = {"prompt": "Calcule 2 * 2"}

        r1 = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(r1.status_code, 200)

        r2 = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(r2.status_code, 200)

        r3 = self.client.post("/api/agent/run", json=payload)
        self.assertEqual(r3.status_code, 429)
        self.assertEqual(r3.json()["detail"]["code"], "RATE_LIMITED")


if __name__ == "__main__":
    unittest.main()
