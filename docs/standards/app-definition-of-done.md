# Application Definition of Done (DoD)

This document establishes the mandatory quality, security, and operational standards required before any application (Apps 01–03 existing or Apps 04+ new) can be considered **Production Ready** and marked as active in `ai-engineer-roadmap`.

---

## Checklist

### 1. Security & Configuration
- [ ] No API keys, credentials, or private keys are committed or exposed to the client bundle.
- [ ] `.env.example` file is complete with placeholder values.
- [ ] Production environment disables Swagger/ReDoc docs and detailed debug traces.
- [ ] Reduced `/health` endpoint exposes no sensitive infrastructure metadata.
- [ ] Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`) are configured.

### 2. Abuse Guardrails & Cost Protections
- [ ] Backend input validation (size limits, MIME checks, schema validation) is enforced before calling paid APIs.
- [ ] Distributed rate limiting is configured for requests per minute and per client IP.
- [ ] Global daily request limits and concurrency limits are enforced.
- [ ] Maximum output token limits are defined server-side.
- [ ] Master kill-switch (`GENERATION_ENABLED=false`) is implemented.

### 3. Privacy & Observability
- [ ] Operational logs record request metadata (request ID, duration, status, size) without full raw prompts, images, or PII.
- [ ] Explicit user privacy disclaimers explain AI processing and data handling.
- [ ] Public sanitized error response schema (`requestId`, `code`, `message`) is returned on failures.

### 4. Code Quality & CI Validation
- [ ] Frontend builds without TypeScript or ESLint errors (`npm run lint && npm run build`).
- [ ] Backend passes syntax check and unit tests (`python -m compileall -q . && python -m unittest discover`).
- [ ] Monorepo CI checks pass cleanly on Pull Requests to `main`.

### 5. Deployment
- [ ] Vercel/hosting deployment is restricted exclusively to the `main` branch.
- [ ] Production credentials are isolated from preview deployments.
