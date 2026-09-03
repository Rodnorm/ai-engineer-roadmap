# Monorepo Security Standard

This document outlines the security baseline enforced across all projects in `ai-engineer-roadmap`.

---

## 1. Secrets Management

- Zero secrets allowed in Git tracking or code history.
- Root `.gitignore` automatically blocks `.env`, `.env.*`, certificates, databases, and logs.
- Secrets scanning is executed locally and in CI via Gitleaks.

---

## 2. Abuse & Financial Controls

Every public demo consuming paid cloud APIs must implement 4 layers of protection:

1. **Input Limit:** Byte size, image dimensions, and string character length limits.
2. **Rate Limit:** Per-minute, per-day per-client IP, and global daily request limits.
3. **Concurrency Cap:** `MAX_CONCURRENT_REQUESTS` semaphore limiting parallel cloud API invocations.
4. **Kill Switch:** `GENERATION_ENABLED` flag allowing instant maintenance shutdown.

---

## 3. Grounding & Prompt Safety

- LLM prompt inputs must strictly isolate system instructions from untrusted user input using data delimiters (e.g. `<user_input>`).
- Content Safety inspections must run prior to LLM generation.
- Production backends must suppress detailed vendor error traces.
