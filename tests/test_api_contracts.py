"""Test OpenAPI contracts integrity and frontend proxy compatibility."""

from __future__ import annotations

import json
from pathlib import Path
import unittest

REPO_ROOT = Path(__file__).resolve().parent.parent
OPENAPI_DIR = REPO_ROOT / "contracts" / "openapi"

EXPECTED_BACKENDS = {
    "01-smart-inspector": {
        "required_paths": ["/health", "/analyze"],
        "proxy_path": "/api/analyze",
    },
    "02-support-bot": {
        "required_paths": ["/health", "/query"],
        "proxy_path": "/api/query",
    },
    "03-prompt-forge": {
        "required_paths": ["/health", "/generate"],
        "proxy_path": "/api/backend/generate",
    },
    "04-pocket-rag": {
        "required_paths": ["/health", "/api/query"],
        "proxy_path": "/api/backend/api/query",
    },
    "05-agentic-workflow": {
        "required_paths": ["/health", "/api/agent/run"],
        "proxy_path": "/api/backend/api/agent/run",
    },
}


class TestApiContracts(unittest.TestCase):
    def test_all_openapi_files_exist_and_valid_json(self) -> None:
        self.assertTrue(OPENAPI_DIR.is_dir(), f"Missing contracts dir: {OPENAPI_DIR}")
        for app_id, spec_meta in EXPECTED_BACKENDS.items():
            spec_file = OPENAPI_DIR / f"{app_id}.json"
            self.assertTrue(spec_file.is_file(), f"Missing OpenAPI spec: {spec_file}")

            data = json.loads(spec_file.read_text(encoding="utf-8"))
            self.assertIn("openapi", data)
            self.assertIn("paths", data)

            paths = data["paths"]
            for req_path in spec_meta["required_paths"]:
                self.assertIn(
                    req_path,
                    paths,
                    f"App {app_id} OpenAPI missing required path {req_path}",
                )

    def test_typescript_types_file_exists(self) -> None:
        types_file = REPO_ROOT / "contracts" / "types" / "index.ts"
        self.assertTrue(types_file.is_file(), "Missing contracts/types/index.ts")
        content = types_file.read_text(encoding="utf-8")
        self.assertIn("StandardApiError", content)
        self.assertIn("SmartInspectorAnalysisResult", content)
        self.assertIn("SupportBotQueryResponse", content)
        self.assertIn("PromptForgeGenerateResponse", content)
        self.assertIn("PocketRagQueryResponse", content)
        self.assertIn("AgentWorkflowRunResponse", content)


if __name__ == "__main__":
    unittest.main()
