# Monorepo & Public Demo Threat Model

## 1. Context & Objectives

The `ai-engineer-roadmap` repository hosts a collection of AI-powered web applications demonstrating multi-modal inspection, RAG, agentic assistants, and prompt engineering.

Because these applications interact with paid cloud infrastructure (e.g. Azure OpenAI, Azure AI Language, Azure Content Safety), public exposure presents specific threat vectors that must be mitigated by design.

---

## 2. Key Assets & Protection Goals

| Asset | Threat | Defense Strategy |
| --- | --- | --- |
| **Azure Credentials & API Keys** | Secret leakage, key theft, financial exploitation | Server-only key handling, `.env` git-ignoring, Gitleaks scanning in CI, Coolify environment variable separation |
| **Cloud Budget / Tokens** | Denial of Wallet (DoW), rate limit exhaustion | Distributed rate limiting, global daily request caps, concurrency controls, timeout limits, kill-switches |
| **System Prompts & LLM Behavior** | Prompt injection, jailbreaking, context leakage | Strict context isolation, instructions/data separation, defensive prompt design, Content Safety API |
| **User Data & Privacy** | PII leakage, confidential image logging | No raw prompt/upload logging, PII masking, client-side history storage, explicit user disclaimers |
| **Application Integrity** | Supply chain attacks, unsafe dependencies | Action SHA pinning, Dependabot security updates, Dependency Review, CodeQL static analysis |

---

## 3. Threat Vectors & Mitigations

### 3.1 Financial & Abuse Threats (Denial of Wallet)
- **Vector:** Automated bots or malicious users spamming backend endpoints to consume Azure OpenAI quota.
- **Mitigation:**
  - Per-IP rate limiting (requests per minute and per day).
  - Global daily request limits across all instances.
  - Concurrency caps (`MAX_CONCURRENT_REQUESTS`).
  - Server-enforced output token limits (`max_output_tokens`).
  - Global kill-switch (`GENERATION_ENABLED=false`).

### 3.2 Information Disclosure & Secrets Leakage
- **Vector:** Accidental commit of `.env` files, exposing credentials in frontend client bundles, or returning system secrets in `/health` endpoints.
- **Mitigation:**
  - Frontend components communicate exclusively through backend proxy endpoints.
  - Pre-commit and CI secret scanning via Gitleaks.
  - Reduced `/health` output in production (no deployment names, resource names, or account IDs).
  - Interactive Swagger/ReDoc docs disabled in production.

### 3.3 Prompt Injection & Context Leakage
- **Vector:** Malicious user prompt inputs attempting to override system instructions or extract confidential system prompts.
- **Mitigation:**
  - Clear structural separation of prompt instructions, knowledge base context, and untrusted user input.
  - Strict grounding validation in backend handlers.
  - Content Safety inspection prior to model invocation.

### 3.4 Supply Chain & CI Security
- **Vector:** Compromised third-party GitHub Actions or vulnerable npm/pip dependencies.
- **Mitigation:**
  - GitHub Actions pinned to full 40-character commit SHAs.
  - Dependency Review enabled for all Pull Requests.
  - CodeQL automated code scanning for Python and JS/TS.
  - Standardized dependency lockfiles (`package-lock.json`).

---

## 4. Operational Security Lifecycle

1. **Development:** Local testing with `.env` ignored.
2. **Pull Request:** Automated lint, build, unit test, Gitleaks, Dependency Review, CodeQL.
3. **Production Deployment:** Restricted exclusively to the `main` branch.
