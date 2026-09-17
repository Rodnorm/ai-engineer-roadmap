# Technical Hardening Roadmap

> Living execution plan for improving the AI Engineer Roadmap monorepo.
>
> Baseline reviewed: `main@6a1f03a` — 2026-09-17.

## Purpose

This document turns the repository check-up into small, reviewable implementation stages. It covers application security, AI-specific safeguards, dependency integrity, testing, observability, deployment reliability, and portfolio differentiation.

The goal is not to implement every possible platform feature. Each stage should produce a concrete improvement that can be validated independently.

## How to use this document

- Complete work in priority order unless a dependency requires otherwise.
- Use one branch and pull request per stage or coherent substage.
- Keep pull requests small enough to review safely.
- Mark a checkbox only after its acceptance criteria pass.
- Record material architectural decisions in the decision log.
- Update the baseline commit after each completed phase.
- Do not include secrets, production data, prompts, uploaded documents, or PII in logs or test fixtures.

### Status legend

- [ ] Not started
- [x] Completed
- **P0** — address before treating the application as a safe public demo
- **P1** — high-priority reliability or security work
- **P2** — quality and maintainability improvement
- **Differentiator** — work intended to demonstrate senior AI engineering capability

## Current baseline

### Existing strengths

- [x] Applications are separated by responsibility inside a clear monorepo structure.
- [x] Docker images run with non-root users.
- [x] Expensive AI operations generally have input limits, concurrency controls, rate limiting, and kill switches.
- [x] App 04 protects its API with a bearer secret and applies upload retention.
- [x] Apps 02 and 03 include prompt-injection or security-focused tests.
- [x] App 05 demonstrates Human-in-the-Loop approval.
- [x] Gitleaks scans the full Git history.
- [x] CI builds and validates the current applications.
- [x] The repository contains a threat model, security policy, and engineering standards.

### Known gaps

- [x] App 06 conversations are not isolated by user or tenant.
- [x] App 06 internal tokens are optional and local Compose has a predictable fallback token.
- [x] App 05 sessions have no owner binding, TTL, or bounded storage.
- [x] Several services trust client-controlled forwarded-IP headers by default.
- [x] AI request quotas are stored in process memory and reset with deployments.
- [x] CodeQL and Dependency Review are skipped while the repository is private.
- [x] GitHub Actions use version tags although the security policy claims SHA pinning.
- [x] Dependabot does not cover every maintained package manifest.
- [x] Most Python dependency sets are not reproducibly locked.
- [ ] Frontend-to-backend flows are not covered by browser E2E tests.
- [ ] Security headers are inconsistent across applications.
- [ ] Documentation contains statements that no longer match implementation.

---

## Phase 1 — Public API safety

### 1.1 App 06 conversation isolation — P0

Suggested branch: `security/06-conversation-isolation`

- [x] Choose the initial identity model:
  - authenticated user identity; or
  - signed anonymous browser session for the public demo.
- [x] Add an immutable `ownerId` or `tenantId` to every conversation.
- [x] Scope list, read, update, delete, message, and approval operations to the owner.
- [x] Prevent cross-owner access even when a valid conversation UUID is known.
- [x] Update Cosmos DB partitioning/query strategy to include the owner boundary.
- [x] Add a migration or explicit disposable-demo-data strategy.
- [x] Add tests for allowed same-owner access.
- [x] Add tests for rejected cross-owner read, delete, message, and approval operations.
- [x] Ensure API errors do not reveal whether another owner's conversation exists.

Acceptance criteria:

- User A cannot list, fetch, modify, approve, or delete User B's data.
- Isolation is enforced in the repository/data layer, not only in UI code.
- Tests exercise both memory and Cosmos-compatible repository behavior.

### 1.2 App 06 MCP boundary — P0

Suggested branch: `security/06-mcp-boundary`

- [x] Make `INTERNAL_API_TOKEN` mandatory in production.
- [x] Make `MCP_API_KEY` mandatory whenever the public MCP endpoint is enabled.
- [x] Remove `local-development-token` from production-capable Compose configuration.
- [x] Keep development defaults in a clearly local-only override or example.
- [x] Compare secrets using a timing-safe implementation.
- [x] Confirm the MCP container is not routed publicly by Coolify.
- [x] Restrict allowed hosts to the actual internal service names.
- [x] Add startup validation that fails closed on invalid production configuration.
- [x] Add authentication and missing-configuration tests.
- [x] Document key generation and rotation without committing values.

Acceptance criteria:

- Production startup fails when required tokens are absent.
- Internal tool calls fail without the correct token.
- The MCP service has no public route unless explicitly enabled.

### 1.3 App 05 session lifecycle — P0

Suggested branch: `security/05-session-lifecycle`

- [x] Bind each session to an owner/session secret.
- [x] Require that binding for session read and approval operations.
- [x] Add session TTL.
- [x] Add a maximum session count and deterministic eviction policy.
- [x] Remove completed/expired sessions safely.
- [x] Restrict CORS methods, headers, origins, and credential usage.
- [x] Add tests for expiry, unauthorized access, eviction, and approval ownership.

Acceptance criteria:

- A leaked or guessed session ID alone is insufficient for access.
- Session memory remains bounded during sustained usage.
- Browser clients continue to complete the run/approval flow.

---

## Phase 2 — Abuse and cost protection

### 2.1 Trusted client identity — P1

Suggested branch: `security/trusted-client-addresses`

- [x] Document the exact Coolify/Traefik forwarded-header behavior.
- [x] Stop trusting arbitrary first-hop `X-Forwarded-For` values.
- [x] Accept proxy headers only from trusted proxy addresses or use a sanitized edge header.
- [x] Share one tested client-address helper across equivalent backends where practical.
- [x] Add tests for forged and multi-hop forwarded headers.
- [x] Apply the same policy to Next.js App 06 routes.

Acceptance criteria:

- Supplying a forged `X-Forwarded-For` value does not create a new rate-limit identity.
- Local development still resolves a usable client identity.

### 2.2 Persistent AI quotas — P1

Suggested branch: `security/persistent-ai-quotas`

- [x] Select SQLite for the single-node deployment or Redis for multi-instance deployment.
- [x] Persist per-minute, per-client daily, and global daily counters.
- [x] Make counter updates atomic.
- [x] Define behavior when the quota store is unavailable.
- [x] Record token usage and estimated cost without recording request content.
- [x] Add per-app and global daily cost ceilings.
- [x] Add an automatic circuit breaker.
- [x] Preserve the manual `GENERATION_ENABLED` kill switch.
- [x] Add tests covering restart persistence and concurrent updates.
- [x] Document matching Azure budgets, quotas, and alerts.

Acceptance criteria:

- Restarting a container does not reset daily protection.
- Multiple workers cannot independently exceed the global budget.
- Metrics contain no prompts, images, document text, or PII.

---

## Phase 3 — Supply-chain and CI hardening

### 3.1 Private-repository security scans — P1

Suggested branch: `ci/private-security-scans`

- [x] Pin every third-party GitHub Action to a full commit SHA.
- [x] Keep the human-readable release version in a comment.
- [x] Add OSV-Scanner or Trivy filesystem dependency scanning.
- [x] Add `pip-audit` for every Python backend.
- [x] Add Bandit or a focused Semgrep ruleset for Python.
- [x] Scan Docker images for OS and application vulnerabilities.
- [x] Define severity thresholds and documented exception handling.
- [x] Upload machine-readable reports as CI artifacts.
- [x] Correct `SECURITY.md` so its claims match active controls.
- [x] Keep CodeQL and Dependency Review ready for public-repository activation.

Acceptance criteria:

- Security checks run on the private repository.
- A deliberately vulnerable fixture or controlled test proves that blocking works.
- Findings include the affected app and dependency path.

### 3.2 Dependabot coverage — P1

Suggested branch: `ci/complete-dependabot-coverage`

- [x] Add App 00 frontend.
- [x] Add App 05 frontend and backend.
- [x] Add App 06 frontend and MCP server.
- [x] Review whether root workspace and template manifests should be monitored.
- [x] Keep updates grouped by application to avoid oversized PRs.
- [x] Preserve explicit manual review for major updates.
- [x] Document the expected validation before merging dependency PRs.

Acceptance criteria:

- Every deployed package manifest is either monitored or explicitly documented as excluded.
- Dependency PRs trigger only the relevant CI jobs.

### 3.3 Reproducible Python environments — P1

Suggested branch: `build/reproducible-python-dependencies`

- [x] Choose `uv` or `pip-tools` as the repository standard.
- [x] Lock direct and transitive dependencies for Apps 01–05.
- [x] Include hashes where the chosen workflow supports them.
- [x] Align the supported Python version across CI and containers.
- [x] Update Docker and CI installation commands.
- [x] Configure dependency update automation for lock files.
- [x] Document the update procedure.

Acceptance criteria:

- Two clean builds from the same commit install identical Python dependency versions.
- CI validates lock consistency.

### 3.4 Container hardening — P1

Suggested branch: `security/container-hardening`

- [x] Pin base images to immutable digests.
- [x] Add missing App 06 Dockerfile healthchecks.
- [x] Drop unnecessary Linux capabilities.
- [x] Enable `no-new-privileges`.
- [x] Use read-only root filesystems where application behavior permits.
- [x] Define explicit writable temporary/data mounts.
- [x] Add sensible CPU and memory limits in deployment documentation.
- [x] Generate a CycloneDX or SPDX SBOM for each deployed image.
- [x] Define a base-image update process.

Acceptance criteria:

- Every image continues to start and pass its healthcheck with the hardened configuration.
- Required writable paths are explicit.
- Every released image has an attached SBOM.

---

## Phase 4 — Contracts, tests, and deployment confidence

### 4.1 API contract consistency — P1

Suggested branch: `test/openapi-contracts`

- [x] Standardize environment-variable naming for server-side backend endpoints.
- [x] Fail builds or startup when required production endpoints are missing.
- [x] Store or generate an OpenAPI contract for every FastAPI backend.
- [x] Generate TypeScript API types or clients from those contracts.
- [x] Add contract drift checks to CI.
- [x] Test proxy paths and backend endpoint paths together.
- [x] Define a consistent error envelope and request ID.

Acceptance criteria:

- A backend route or schema change that breaks a frontend contract fails CI.
- Frontends do not maintain hand-written duplicate response types without justification.

### 4.2 End-to-end smoke tests — P1

Suggested branch: `test/e2e-smoke-baseline`

- [x] Add Playwright infrastructure.
- [x] Cover one critical user journey per app.
- [x] Exercise browser → Next.js proxy → backend.
- [x] Use deterministic/offline provider modes in CI.
- [x] Test successful responses and representative 400, 413, 429, and 503 responses.
- [x] Test streaming cancellation and interrupted requests where applicable.
- [x] Add `axe-core` accessibility checks.
- [x] Capture useful artifacts only on failure.

Acceptance criteria:

- Environment/proxy regressions like the recent frontend API URL issues fail before merge.
- Tests do not require paid Azure calls.

### 4.3 Coverage and static quality — P2

Suggested branch: `test/quality-gates`

- [x] Add Ruff formatting/linting for Python.
- [x] Add Python type checking incrementally.
- [x] Add backend coverage reports.
- [x] Add focused component tests for complex frontend interactions.
- [x] Define realistic initial thresholds per app.
- [x] Raise thresholds gradually instead of enforcing an artificial global target.

Acceptance criteria:

- New critical backend and API route code is covered.
- Quality checks remain fast enough for normal pull requests.

### 4.4 Selective CI and Coolify deployment — P2

Suggested branch: `ci/selective-main-builds`

- [x] Keep path-aware jobs for pull requests.
- [x] Make normal `main` pushes path-aware.
- [x] Add a scheduled full validation run.
- [x] Preserve manual `run_all`.
- [x] Configure a Watch Path for every separate Coolify resource.
- [x] Document frontends and backends as independent resources.
- [x] Verify that changing App 01 does not redeploy Apps 02–06.

Acceptance criteria:

- Normal merges validate and deploy only affected services.
- A scheduled full build still detects cross-project drift.

---

## Phase 5 — Runtime security and observability

### 5.1 Browser and edge security — P2

Suggested branch: `security/browser-edge-headers`

- [x] Inspect actual production response headers through the Coolify proxy.
- [x] Decide whether HSTS is owned by Next.js or Traefik.
- [x] Standardize CSP across applications.
- [x] Move report-only policies to enforcement after resolving violations.
- [x] Remove `unsafe-inline` where practical.
- [x] Standardize frame, referrer, MIME-sniffing, and permissions policies.
- [x] Add automated header checks.

Acceptance criteria:

- Every deployed frontend passes the agreed header policy.
- CSP enforcement does not break Next.js hydration or required API connections.

### 5.2 Untrusted document processing — P1

Suggested branch: `security/04-document-processing`

- [x] Add CPU/time limits around PDF parsing and embedding.
- [x] Reject encrypted, malformed, or pathological PDFs safely.
- [x] Consider a separate worker/process for untrusted parsing.
- [x] Ensure temporary files cannot escape configured directories.
- [x] Verify cleanup after parsing failure and process interruption.
- [x] Add adversarial PDF fixtures with safe synthetic content.

Acceptance criteria:

- A malformed or expensive PDF cannot indefinitely block the API process.
- Partial uploads and generated data are cleaned up predictably.

### 5.3 OpenTelemetry and operational metrics — P2

Suggested branch: `observability/otel-ai-tracing`

- [x] Propagate a correlation ID from browser to Next.js, backend, Azure, and MCP.
- [x] Add OpenTelemetry traces to external model/tool calls.
- [x] Record latency, status, retry count, tokens, and estimated cost.
- [x] Explicitly exclude prompt/document content and PII.
- [x] Add p50/p95 latency and error-rate dashboards.
- [x] Add Uptime Kuma or an equivalent synthetic health monitor.
- [x] Define alerts for error spikes, quota exhaustion, and unavailable providers.

Acceptance criteria:

- A failed request can be followed across services by correlation ID.
- Operational dashboards reveal no user content.

---

## Phase 6 — AI engineering differentiators

### 6.1 Versioned AI evaluation corpus — Differentiator

Suggested branch: `evals/cross-app-regression-suite`

- [x] Create versioned, synthetic evaluation datasets.
- [x] Add prompt-injection cases.
- [x] Add PII leakage cases.
- [x] Add malformed structured-output cases.
- [x] Add RAG answerability, citation validity, and abstention cases.
- [x] Add agent tool-authorization and approval-bypass cases.
- [x] Store expected behavior and scoring rules.
- [x] Run deterministic tests on every relevant PR.
- [x] Run provider-backed evaluations on a controlled schedule.
- [x] Define thresholds that block meaningful regressions.

Acceptance criteria:

- Model, prompt, retrieval, or tool changes produce comparable before/after results.
- Evaluation data contains no real user information.

### 6.2 AI Reliability & Safety Scorecard — Differentiator

Suggested branch: `feat/portfolio-ai-scorecard`

- [ ] Define a shared metrics schema.
- [ ] Display groundedness/citation quality where applicable.
- [ ] Display prompt-injection resistance results.
- [ ] Display PII leakage test results.
- [ ] Display tool approval/bypass results.
- [ ] Display latency and cost per representative task.
- [ ] Display last evaluation and security-scan dates.
- [ ] Link every metric to its methodology and commit.
- [ ] Clearly distinguish measured results from design claims.

Acceptance criteria:

- The portfolio shows reproducible engineering evidence rather than unsupported badges.
- A reviewer can trace each score to a test, dataset, and commit.

### 6.3 AI Bill of Materials and system cards — Differentiator

Suggested branch: `docs/ai-system-cards`

- [ ] Document models, providers, regions, and deployment names without secrets.
- [ ] Document input/output data classes.
- [ ] Document retention and deletion behavior.
- [ ] Document model and application limitations.
- [ ] Document prompt-injection and tool-use boundaries.
- [ ] Document human-approval requirements.
- [ ] Document evaluation datasets and known gaps.
- [ ] Document estimated cost characteristics.
- [ ] Publish one concise system card per AI application.

Acceptance criteria:

- Every AI application has a current, reviewable risk and behavior summary.
- System-card claims match the implementation and automated evaluations.

---

## Phase 7 — Documentation and repository presentation

Suggested branch: `docs/align-repository-claims`

- [ ] Remove the App 04 ChromaDB claim unless ChromaDB is reintroduced.
- [ ] Describe App 05 sessions as in-memory until durable persistence exists.
- [ ] Correct the privacy notice for Apps 04 and 06.
- [ ] Replace absolute guarantees with verifiable statements.
- [ ] Update Live, Ready, and In Development status values.
- [ ] Update App 00 catalog content from the same source of truth.
- [ ] Add small architecture and data-flow diagrams.
- [ ] Add repository description, homepage, topics, and social preview.
- [ ] Prepare and complete the public-release checklist.
- [ ] Review the personal security contact before making the repository public.

Acceptance criteria:

- README, application docs, portfolio, and runtime behavior agree.
- Every security or reliability claim points to code, tests, or operational evidence.

---

## Recommended execution order

1. App 06 conversation isolation.
2. App 06 MCP boundary.
3. App 05 session lifecycle.
4. Trusted client identity and persistent quotas.
5. Private-repository security scans.
6. Reproducible Python dependencies.
7. Complete Dependabot coverage and container hardening.
8. API contracts and E2E smoke tests.
9. Selective CI/Coolify deployment.
10. Runtime headers and document-processing isolation.
11. OpenTelemetry and operational dashboards.
12. AI evaluation suite.
13. Portfolio scorecard and AI system cards.
14. Documentation alignment and public release.

## Definition of done for each pull request

- [ ] The branch starts from the latest `main`.
- [ ] The pull request addresses one coherent concern.
- [ ] Tests cover the security or behavioral change.
- [ ] The smallest relevant builds and tests pass.
- [ ] No secrets, generated output, caches, or unrelated formatting are included.
- [ ] Environment examples and documentation are updated when behavior changes.
- [ ] The PR explains risk, implementation, validation, and rollback considerations.
- [ ] This roadmap is updated when the stage is completed.

## Decision log

| Date | Decision | Reason | Follow-up |
| --- | --- | --- | --- |
| 2026-09-16 | Use this document as the execution backlog for repository hardening. | Keep security, reliability, and portfolio improvements visible and reviewable. | Start with App 06 conversation isolation. |
| 2026-09-16 | Complete Phase 1: Conversation isolation, MCP token enforcement, App 05 session lifecycle. | Block cross-tenant access, unauthorized MCP tool calls, and session starvation. | Proceed to Phase 2 client identity and quotas. |
| 2026-09-17 | Complete Phase 2: Trusted client IP resolution and SQLite persistent request quotas. | Prevent rate limit evasion and cost spikes across container restarts. | Proceed to Phase 3 security scans and supply chain. |
| 2026-09-17 | Complete Phase 3.1 & 3.2: Private CI security scans, pinned action SHAs, complete Dependabot coverage. | Establish automated vulnerability detection and dependency monitoring. | Lock Python environments in Phase 3.3. |
| 2026-09-17 | Complete Phase 3.3: Use `uv` with reproducible SHA-256 hashes for Apps 01–05, align Python to 3.12. | Ensure deterministic builds across local dev, CI, and production containers. | Proceed to Phase 3.4 container hardening. |
| 2026-09-17 | Complete Phase 3.4: Pin base images to SHA-256 digests, add App 06 healthcheck, enable no-new-privileges and cap_drop. | Harden container boundaries, prevent privilege escalation, and ensure health observability. | Proceed to Phase 4 contracts and tests. |
| 2026-09-17 | Complete Phase 4.1: Store OpenAPI schemas, add CI drift check, TypeScript contracts, standard backend URL and X-Request-ID. | Prevent contract drift and align API schemas across frontend and backend services. | Proceed to Phase 4.2 E2E smoke tests. |
| 2026-09-17 | Complete Phase 4.2: Add Playwright E2E smoke suite with offline mocking, axe-core a11y, resilience and failure artifact capture. | Guarantee critical journeys and resilience against 400, 413, 429, 503 and streaming aborts. | Proceed to Phase 4.3 quality gates. |
| 2026-09-17 | Complete Phase 4.3: Add Ruff formatting and linting, incremental Mypy type-checking, backend test coverage, and frontend component tests. | Enforce static code quality, prevent runtime regressions, and ensure measurable test coverage. | Proceed to Phase 4.4 selective CI. |
| 2026-09-17 | Complete Phase 4.4: Path-aware main builds, daily scheduled full runs, and Coolify watch path documentation. | Prevent redundant image rebuilds and deployment churn across monorepo applications. | Proceed to Phase 5 runtime security and observability. |
| 2026-09-17 | Complete Phase 5.1: Enforce standard CSP, 2-year HSTS preload, frame-ancestors, and automated security header checks. | Protect clients from XSS, clickjacking, MIME-sniffing, and protocol downgrades across all Next.js apps. | Proceed to Phase 5.2 document processing. |
| 2026-09-17 | Complete Phase 5.2: Timeout/character guards, encrypted/empty PDF rejections, directory containment, and orphan cleanup. | Prevent resource exhaustion, DoS, and orphaned files during untrusted document ingestion. | Proceed to Phase 5.3 OpenTelemetry. |
| 2026-09-17 | Complete Phase 5.3: OpenTelemetry GenAI tracing, W3C traceparent propagation, zero-PII metrics, and synthetic monitoring standard. | Enable cross-service trace correlation, p50/p95 latency and token monitoring without data leakage. | Proceed to Phase 6.1 AI evaluation corpus. |
| 2026-09-17 | Complete Phase 6.1: Versioned evaluation corpus, regression runner, and CI quality gates. | Prevent AI regressions in prompt injection, PII masking, RAG groundedness, and agent authorization. | Proceed to Phase 6.2 AI scorecard. |
