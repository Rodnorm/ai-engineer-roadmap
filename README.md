# AI Engineer Roadmap & Production Monorepo

A hands-on collection of production-hardened AI applications built as part of a structured learning roadmap.

This repository documents the transition from senior frontend engineering toward AI engineering through incremental, production-oriented projects. Each application focuses on a specific AI capability (Vision & Multi-modal, Conversational RAG, Content Safety, Prompt Engineering) while adhering to strict security baselines, financial abuse controls, and monorepo standards.

---

## 🏛️ Application Catalog

| App | Focus & Capabilities | Technologies | Status |
| --- | --- | --- | --- |
| [00 — Portfolio](./apps/00-portfolio) | Central showcase, interactive catalog, visual roadmap timeline & case studies | Next.js 14, Tailwind CSS, TypeScript | Live |
| [01 — Smart Inspector](./apps/01-smart-inspector) | Multi-modal vision analysis, image tags, captions, object detection, and OCR transcription | Next.js 14, FastAPI, Azure OpenAI, Pillow | Live |
| [02 — Support Bot](./apps/02-support-bot) | Healthcare billing assistant with Azure AI Language NLP, PII data masking, and grounded retrieval | Next.js 16, FastAPI, Azure AI Language, Azure AI Agents | Live |
| [03 — Prompt Forge](./apps/03-prompt-forge) | Structured content generation workbench with Azure Content Safety filtering and SSE streaming | Next.js 16, FastAPI, Azure OpenAI, Azure Content Safety | Live |

---

## 📐 Architecture & Monorepo Layout

```text
.
├── apps/
│   ├── 00-portfolio/          # Central showcase and case studies UI
│   ├── 01-smart-inspector/    # Vision & OCR multi-modal service
│   ├── 02-support-bot/        # Healthcare NLP & grounded RAG assistant
│   └── 03-prompt-forge/       # Structured content & Content Safety studio
├── catalog/                   # Monorepo catalog registry (apps.json, schema.json)
├── templates/                 # Reusable starter application template (templates/ai-app)
├── docs/                      # Architectural, security, testing, and deployment standards
│   ├── security/              # Threat model, public release checklist
│   └── standards/             # Backend, Frontend, Security, Testing, Deployment, Selective Builds
├── .github/workflows/         # Path-aware CI, Gitleaks, CodeQL, Dependency Review
├── SECURITY.md                # Vulnerability disclosure policy
├── CONTRIBUTING.md            # Git branching and conventional commit guidelines
└── LICENSE                    # MIT License
```

---

## 🔒 Security & Financial Abuse Controls

Every public demo backend enforces a 4-layer defense model to guarantee data privacy and cloud cost protection:

1. **Input Size Validation:** Strict character, byte, and image dimension limits (`MAX_IMAGE_PIXELS`, Pydantic min/max bounds).
2. **Pre-flight Rate Limiting:** `InMemoryRateLimiter` enforces minute-level, per-client IP daily, and global daily limits **before** calling Azure AI services.
3. **Concurrency Semaphore:** `MAX_CONCURRENT_REQUESTS=2` via `asyncio.Semaphore` restricts parallel expensive cloud API calls.
4. **Master Kill Switch:** `GENERATION_ENABLED=true/false` flag allowing immediate service maintenance shutdown.
5. **PII & Privacy Protections:** EXIF camera metadata stripping, raw entity PII masking (`[REDACTED_SSN]`), zero input prompt logging, and Next.js security headers.

---

## 🌐 Public Demo Quotas & Privacy Notice

> [!IMPORTANT]  
> **Demo Quotas:** Public demo deployments operate under daily request quotas and concurrency limits. If a quota limit is reached, backends safely return HTTP `429 Too Many Requests` or `503 Service Unavailable` with sanitized retry instructions.
>
> **Privacy Notice:** Demos do NOT persist user prompt Briefs or uploaded images on backend disk storage. Do NOT submit real medical, financial, or sensitive personal identification numbers.

---

## 🚀 Running Applications Locally

All applications are self-contained and run without real Azure credentials by default using local fallback modes or fixtures.

### 1. Backend Setup

```bash
cd apps/<app-folder>/backend
python -m venv .venv

# Activate environment
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd apps/<app-folder>/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## 📄 License

This repository is licensed under the [MIT License](./LICENSE).
