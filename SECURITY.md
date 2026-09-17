# Security Policy

## Reporting Security Issues

We take the security of `ai-engineer-roadmap` seriously. If you discover a security vulnerability or potential secret leak, please do **NOT** open a public issue.

Instead, please report it privately:

1. **Email:** Send details to the repository maintainer at `rodrigo.normando.silva@gmail.com`.
2. **Details to include:**
   - Description of the vulnerability or risk.
   - Affected component or application (e.g. `apps/01-smart-inspector`).
   - Steps to reproduce or proof-of-concept.
   - Any suggested mitigation or remediation.

## Security Practices & Defaults

This monorepo enforces the following security standards:

- **No Secrets in Source:** All API keys, tokens, and credentials are read from environment variables and must never be committed to Git.
- **Cost & Abuse Protection:** Every public demo consuming Azure AI services implements rate limiting, request size limits, concurrency caps, and kill-switches.
- **Privacy by Design:** Prompt contents, document uploads, and PII are omitted from operational logs.
- **CI Hardening:** GitHub Actions run with minimal permissions and pinned action SHAs, with full-history secret scanning via Gitleaks, private-compatible dependency and configuration scans via Trivy and `pip-audit`, Python static analysis via Bandit, and CodeQL when GitHub code scanning is available.
- **Deployment Control:** Automated deployments are strictly limited to the `main` branch.

## Supported Versions

Only the latest code on the `main` branch is actively supported and maintained.
