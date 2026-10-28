"""Export OpenAPI specifications for all FastAPI backends in the monorepo.

Can generate files or verify against committed files for drift prevention in CI.

Usage:
    python scripts/export_openapi.py [--check] [--output-dir contracts/openapi] [--app APP_ID]
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

BACKENDS = [
    {
        "id": "01-smart-inspector",
        "path": "apps/01-smart-inspector/backend",
        "module": "main",
        "app_attr": "app",
    },
    {
        "id": "02-support-bot",
        "path": "apps/02-support-bot/backend",
        "module": "main",
        "app_attr": "app",
    },
    {
        "id": "03-prompt-forge",
        "path": "apps/03-prompt-forge/backend",
        "module": "main",
        "app_attr": "app",
    },
    {
        "id": "04-pocket-rag",
        "path": "apps/04-pocket-rag/backend",
        "module": "main",
        "app_attr": "app",
    },
    {
        "id": "05-agentic-workflow",
        "path": "apps/05-agentic-workflow/backend",
        "module": "main",
        "app_attr": "app",
    },
]


def export_single_app(backend: dict) -> str:
    """Run in a child process to isolate imports and environments."""
    repo_root = Path(__file__).resolve().parent.parent
    backend_dir = repo_root / backend["path"]
    reqs_file = backend_dir / "requirements.lock"

    code = f"""
import sys, os, json
sys.path.insert(0, r"{backend_dir}")
os.environ["ENVIRONMENT"] = "development"
os.environ["GENERATION_ENABLED"] = "true"
os.environ["RATE_LIMIT_ENABLED"] = "true"
import {backend["module"]}
app = getattr({backend["module"]}, "{backend["app_attr"]}")
print("__OPENAPI_START__")
print(json.dumps(app.openapi(), indent=2, sort_keys=True))
print("__OPENAPI_END__")
"""

    cmd = [
        "uv",
        "run",
        "--with-requirements",
        str(reqs_file),
        "python",
        "-c",
        code,
    ]

    res = subprocess.run(cmd, cwd=repo_root, capture_output=True, text=True, check=False)
    if res.returncode != 0:
        print(f"Error running {backend['id']}:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}", file=sys.stderr)
        raise RuntimeError(f"Failed to export schema for {backend['id']}")

    stdout = res.stdout
    start_idx = stdout.find("__OPENAPI_START__\n")
    end_idx = stdout.find("\n__OPENAPI_END__")
    if start_idx == -1 or end_idx == -1:
        raise RuntimeError(f"Delimiter not found in output for {backend['id']}:\n{stdout}")

    return stdout[start_idx + len("__OPENAPI_START__\n") : end_idx].strip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Export or verify OpenAPI specs.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check for drift against committed files instead of overwriting.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("contracts/openapi"),
        help="Directory to write OpenAPI JSON files.",
    )
    parser.add_argument(
        "--app",
        type=str,
        default=None,
        help="Export only a single app (e.g. 01-smart-inspector).",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    target_dir = repo_root / args.output_dir
    target_dir.mkdir(parents=True, exist_ok=True)

    backends_to_run = [b for b in BACKENDS if args.app is None or b["id"] == args.app]
    if not backends_to_run:
        print(f"Unknown app: {args.app}", file=sys.stderr)
        return 1

    has_drift = False

    for backend in backends_to_run:
        app_id = backend["id"]
        out_file = target_dir / f"{app_id}.json"
        print(f"Generating OpenAPI schema for {app_id}...")

        spec_json = export_single_app(backend)

        if args.check:
            if not out_file.exists():
                print(f"[DRIFT] {out_file} does not exist!")
                has_drift = True
            else:
                current = out_file.read_text(encoding="utf-8")
                if current.replace("\r\n", "\n") != spec_json.replace("\r\n", "\n"):
                    print(f"[DRIFT] Contract drift detected for {app_id} in {out_file}!")
                    has_drift = True
                else:
                    print(f"[OK] {app_id} matches {out_file}")
        else:
            out_file.write_text(spec_json, encoding="utf-8")
            print(f"Wrote {out_file}")

    if has_drift:
        print("\nERROR: OpenAPI contract drift detected. Run without --check to regenerate.")
        return 1

    print("\nAll OpenAPI contracts in sync.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
