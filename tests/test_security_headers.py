"""Automated checks ensuring all Next.js frontend apps configure complete security headers."""

from __future__ import annotations

from pathlib import Path
import unittest

REPO_ROOT = Path(__file__).resolve().parent.parent

FRONTEND_CONFIGS = [
    REPO_ROOT / "apps" / "00-portfolio" / "frontend" / "next.config.mjs",
    REPO_ROOT / "apps" / "01-smart-inspector" / "frontend" / "next.config.mjs",
    REPO_ROOT / "apps" / "02-support-bot" / "frontend" / "next.config.mjs",
    REPO_ROOT / "apps" / "03-prompt-forge" / "frontend" / "next.config.mjs",
    REPO_ROOT / "apps" / "04-pocket-rag" / "frontend" / "next.config.mjs",
    REPO_ROOT / "apps" / "05-agentic-workflow" / "frontend" / "next.config.mjs",
    REPO_ROOT / "apps" / "06-agent-workspace" / "frontend" / "next.config.mjs",
]

REQUIRED_HEADERS = [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
    "Content-Security-Policy",
]


class TestSecurityHeaders(unittest.TestCase):
    def test_all_frontend_configs_exist(self) -> None:
        for config_path in FRONTEND_CONFIGS:
            self.assertTrue(
                config_path.is_file(),
                f"Missing frontend configuration file: {config_path}",
            )

    def test_required_security_headers_configured(self) -> None:
        for config_path in FRONTEND_CONFIGS:
            app_name = config_path.parent.parent.name
            content = config_path.read_text(encoding="utf-8")

            # Must not contain Report-Only CSP
            self.assertNotIn(
                "Content-Security-Policy-Report-Only",
                content,
                f"{app_name} has Report-Only CSP; enforcement is required",
            )

            for header in REQUIRED_HEADERS:
                self.assertIn(
                    f'"{header}"',
                    content,
                    f"{app_name} next.config.mjs missing required security header: {header}",
                )

            # Specific critical values
            self.assertIn('"nosniff"', content, f"{app_name} missing nosniff")
            self.assertIn('"DENY"', content, f"{app_name} missing DENY")
            self.assertIn("max-age=63072000", content, f"{app_name} missing HSTS max-age")


if __name__ == "__main__":
    unittest.main()
