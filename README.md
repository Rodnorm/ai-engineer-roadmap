# AI Engineer Roadmap & Production Monorepo

A hands-on collection of production-hardened AI applications built as part of a structured learning roadmap.

This repository documents the transition from senior frontend engineering toward AI engineering through incremental, production-oriented projects. Each application focuses on a specific AI capability (Vision & Multi-modal, Conversational RAG, Content Safety, Prompt Engineering) while adhering to strict security baselines, financial abuse controls, and monorepo standards.

---

## 🏛️ Application Catalog

| App | Focus & Capabilities | Technologies | Status |
| --- | --- | --- | --- |
| [00 — Portfolio](./apps/00-portfolio) | Central showcase, interactive catalog, visual roadmap timeline & AI safety scorecard | Next.js 14, Tailwind CSS, TypeScript | Live |
| [01 — Smart Inspector](./apps/01-smart-inspector) | Multi-modal vision analysis, image tags, captions, object detection, and OCR transcription | Next.js 14, FastAPI, Azure OpenAI, Pillow | Live |
| [02 — Support Bot](./apps/02-support-bot) | Healthcare billing assistant with Azure AI Language NLP, PII data masking, and grounded retrieval | Next.js 16, FastAPI, Azure AI Language, Azure AI Agents | Live |
| [03 — Prompt Forge](./apps/03-prompt-forge) | Structured content generation workbench with Azure Content Safety filtering and SSE streaming | Next.js 16, FastAPI, Azure OpenAI, Azure Content Safety | Live |
| [04 — pocketRag](./apps/04-pocket-rag) | Local-first personal RAG with persistent documents, multilingual retrieval, citations, and evaluation tooling | Next.js 15, FastAPI, SQLite Vector, Azure OpenAI | Ready |
| [05 — Agentic Workflow](./apps/05-agentic-workflow) | Autonomous agent execution loop with multi-tool calling, in-memory stateful session lifecycle, and Human-in-the-Loop authorization | Next.js 15, FastAPI, Azure OpenAI, ReAct Loop | Ready |
| [06 — Agent Workspace](./apps/06-agent-workspace) | Streaming agent workspace with Foundry, typed MCP tools, approval gates, and durable conversations | Next.js 15, Azure AI Foundry, MCP, Cosmos DB | Ready |

---

## 📐 Architecture & Monorepo Layout

```mermaid
flowchart TD
    subgraph Client["Client Tier"]
        Browser["Modern Browser / Web Client"]
    end

    subgraph Edge["Frontend & Edge Proxy Tier (Next.js)"]
        HSTS["HSTS Preload & Security Headers"]
        ReqID["X-Request-ID Stamping"]
        Catalog["Catalog & Interactive Demos"]
    end

    subgraph Backend["API & Guardrail Tier (FastAPI)"]
        RateLimit["Persistent SQLite Rate Limiter & Client IP"]
        Sanitizer["Payload Validation & PII Sanitizer"]
        Otel["OpenTelemetry GenAI Tracing & Metrics"]
        Safety["Human-in-the-Loop Approval Gates"]
    end

    subgraph AI["External AI & Tool Tier"]
        AzureAI["Azure OpenAI (gpt-4o-mini, text-embedding-3-small)"]
        MCP["Model Context Protocol (MCP) Tool Servers"]
        VectorDB["SQLite Vector Embeddings Store"]
    end

    Browser -->|HTTPS / W3C Traceparent| HSTS
    HSTS --> ReqID
    ReqID --> Catalog
    Catalog -->|Internal Proxy / Rewrite| RateLimit
    RateLimit --> Sanitizer
    Sanitizer --> Otel
    Otel --> Safety
    Safety -->|Filtered Prompts| AzureAI
    Safety -->|Authorized Calls| MCP
    Otel --> VectorDB
```

```text
.
├── apps/
│   ├── 00-portfolio/          # Central showcase and case studies UI
│   ├── 01-smart-inspector/    # Vision & OCR multi-modal service
│   ├── 02-support-bot/        # Healthcare NLP & grounded RAG assistant
│   ├── 03-prompt-forge/       # Structured content & Content Safety studio
│   ├── 04-pocket-rag/          # Local-first personal RAG knowledge base
│   ├── 05-agentic-workflow/   # Autonomous agent loop & HITL approval
│   └── 06-agent-workspace/    # Foundry agent, MCP tools & durable chat
├── catalog/                   # Monorepo catalog registry (apps.json, schema.json)
├── contracts/                 # Shared OpenAPI specs and TypeScript contracts
├── evals/                     # Cross-app synthetic AI evaluation suite & regression runner
├── templates/                 # Reusable starter application template (templates/ai-app)
├── docs/                      # Architectural, security, testing, and deployment standards
│   ├── security/              # Threat model, public release checklist
│   ├── standards/             # Observability, quality gates, security headers, watch paths
│   └── system-cards/          # Formal AI System Cards and AIBOM across Apps 01-06
├── .github/workflows/         # Path-aware CI, Gitleaks, CodeQL, Dependency Review
├── SECURITY.md                # Vulnerability disclosure policy
├── CONTRIBUTING.md            # Git branching and conventional commit guidelines
└── LICENSE                    # MIT License
```

---

## 🔒 Security & Financial Abuse Controls

Every public demo backend enforces multi-layer defense controls to protect user data and prevent financial exhaustion:

1. **Input Size Validation:** Strict character, byte, and image dimension limits (`MAX_IMAGE_PIXELS`, Pydantic min/max bounds).
2. **Pre-flight Rate Limiting:** Persistent SQLite token buckets enforce minute-level, per-client IP daily, and global daily limits **before** calling Azure AI services.
3. **Concurrency Semaphore:** `MAX_CONCURRENT_REQUESTS=2` via `asyncio.Semaphore` restricts parallel expensive cloud API calls.
4. **Master Kill Switch:** `GENERATION_ENABLED=true/false` flag allowing immediate service maintenance shutdown.
5. **PII & Privacy Protections:** EXIF camera metadata stripping, raw entity PII masking (`[REDACTED_SSN]`), zero input prompt logging, and Next.js security headers.

---

## 🌐 Public Demo Quotas & Privacy Notice

> [!IMPORTANT]  
> **Demo Quotas:** Public demo deployments operate under daily request quotas and concurrency limits. If a quota limit is reached, backends safely return HTTP `429 Too Many Requests` or `503 Service Unavailable` with sanitized retry instructions.
>
> **Privacy Notice:**
> - **Apps 01, 02, 03, 05:** Process requests in-memory without persistent disk retention of prompt texts, user messages, or uploaded images.
> - **App 04 (Pocket RAG):** Uploaded user documents and vector embeddings are stored in a quarantined local directory with an automatic 30-minute expiration TTL and background garbage collection.
> - **App 06 (Agent Workspace):** Workspace sessions and conversations are strictly isolated per tenant.
> - **Operational Telemetry:** OpenTelemetry spans and metrics record latency, token counts, and cost, while **strictly omitting** prompt content, document bodies, and user PII.
> - **Sensitive Data Warning:** Do NOT submit real medical, financial, or sensitive personal identification numbers.

---

## 🚀 Local Development & Orchestration

The monorepo includes a cross-platform Node.js development orchestrator (`scripts/dev/run.mjs`) that can run all applications simultaneously or individually with unified logging, port conflict detection, and clean process lifecycle management.

### 📋 Prerequisites

- **Node.js:** >= 20.x recommended (supports native test runner)
- **Python:** >= 3.11 or 3.12 (for FastAPI backends)

### 🔌 Port Assignment Table

| Application | Service | Local Port | Directory | Dev Command |
| :--- | :--- | :---: | :--- | :--- |
| **App 00** (Portfolio & Catalog) | Frontend | `3000` | `apps/00-portfolio/frontend` | `npm run dev:00` |
| **App 01** (Smart Inspector) | Frontend | `3001` | `apps/01-smart-inspector/frontend` | `npm run dev:01` |
| | Backend | `8001` | `apps/01-smart-inspector/backend` | |
| **App 02** (Support Bot) | Frontend | `3002` | `apps/02-support-bot/frontend` | `npm run dev:02` |
| | Backend | `8002` | `apps/02-support-bot/backend` | |
| **App 03** (Prompt Forge) | Frontend | `3003` | `apps/03-prompt-forge/frontend` | `npm run dev:03` |
| | Backend | `8003` | `apps/03-prompt-forge/backend` | |
| **App 04** (pocketRag) | Frontend | `3004` | `apps/04-pocket-rag/frontend` | `npm run dev:04` |
| | Backend | `8004` | `apps/04-pocket-rag/backend` | |
| **App 05** (Agentic Workflow) | Frontend | `3005` | `apps/05-agentic-workflow/frontend` | `npm run dev:05` |
| | Backend | `8005` | `apps/05-agentic-workflow/backend` | |
| **App 06** (Agent Workspace) | Frontend | `3006` | `apps/06-agent-workspace/frontend` | `npm run dev:06` |
| | MCP server | `8006` | `apps/06-agent-workspace/mcp-server` | |

### 🛠️ One-Command Local Startup

From the monorepo root:

```bash
# 1. Start all applications simultaneously (frontends + backends)
npm run dev

# 2. Or start a single application (frontend and backend together)
npm run dev:01    # Smart Inspector (3001 & 8001)
npm run dev:02    # Support Bot (3002 & 8002)
npm run dev:03    # Prompt Forge (3003 & 8003)
npm run dev:04    # pocketRag (3004 & 8004)
npm run dev:05    # Agentic Workflow (3005 & 8005)
npm run dev:06    # Agent Workspace (3006 & 8006)
npm run dev:00    # Portfolio Catalog (3000)
```

Press `Ctrl+C` to gracefully terminate all child processes at once without orphaned processes.

### ⚙️ Environment Variables & Overrides

App 00's catalog automatically overrides production demo URLs when local URLs are provided in environment variables:

```dotenv
# apps/00-portfolio/frontend/.env.local
NEXT_PUBLIC_APP_01_URL=http://localhost:3001
NEXT_PUBLIC_APP_02_URL=http://localhost:3002
NEXT_PUBLIC_APP_03_URL=http://localhost:3003
NEXT_PUBLIC_APP_06_URL=http://localhost:3006
```

- When unset (such as on production builds), App 00 safely falls back to published live deployment URLs.
- Never commit `.env` or `.env.local` files containing secrets. Use `.env.example` as reference.

### ➕ Registering New Applications (App 04+)

To add subsequent roadmap apps (e.g. App 04 Pocket RAG, App 05 Agents) to the local orchestrator:

1. Open `scripts/dev/apps.json`.
2. Add a new application entry with `id`, `name`, `frontend`, and optional `backend` configuration.
3. Add corresponding script `"dev:04": "node scripts/dev/run.mjs --app 04"` in root `package.json`.

---

## 🧪 Testing & CI Pipeline

Run backend unit tests locally without real cloud credentials:

```bash
python -m unittest discover -s apps/01-smart-inspector/backend -p "test_*.py"
python -m unittest discover -s apps/02-support-bot/backend -p "test_*.py"
python -m unittest discover -s apps/03-prompt-forge/backend -p "test_*.py"
```

The monorepo uses path-aware GitHub Actions workflows (`.github/workflows/ci.yml`) to execute tests only for affected applications on Pull Requests.

---

## 🐳 Coolify deployment

Each roadmap app has a Git-based Docker Compose definition that groups its
frontend and backend in one Coolify resource while retaining app-level Watch
Paths. See [the Coolify Compose deployment guide](./docs/deployment/COOLIFY_COMPOSE.md).


---

## 📄 License

This repository is licensed under the [MIT License](./LICENSE).
