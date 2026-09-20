# App 07 — Multi-Agent Brief Generator

Multi-Agent Brief Generator demonstrates heterogeneous multi-agent collaboration by decoupling information discovery and executive synthesis into two specialized, cooperating agents:
1. **Researcher Agent**: Equipped with specialized tools (`search_facts`, `verify_claim`, `extract_metrics`) to gather facts and build a structured `ResearchDossier`.
2. **Writer Agent**: Zero-tool agent dedicated to crafting high-impact executive summaries following McKinsey / PR-FAQ structure based strictly on the curated dossier.

## Architecture

- **Framework**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **AI Engine**: Azure OpenAI Service (`gpt-4o` / `gpt-4o-mini`) or deterministic Offline Mock Engine.
- **Handoff Protocol**: Real-time SSE streaming of agent trace steps, telemetry, dossier extraction, and finalized markdown brief.
- **User Session Isolation**: HMAC-SHA256 signed browser cookies (`app07-owner`), session-isolated brief history storage, and instant historical retrieval (padrão App 06).
- **Interactive Scenarios**: 12 pre-configured architectural, security, and FinOps scenarios for immediate evaluation.
- **Security & Reliability**: In-memory rate limiting (10 req/min), concurrency semaphore, master kill-switch (`GENERATION_ENABLED`), and security headers.

## Getting Started

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3007](http://localhost:3007) in your browser.

4. Run tests:
   ```bash
   npm run test
   ```
