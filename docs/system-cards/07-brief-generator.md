# AI System Card: 07 Multi-Agent Brief Generator

## 1. System Overview
- **Application:** Multi-Agent Brief Generator (Heterogeneous Multi-Agent Orchestration & Executive Synthesis)
- **Primary Model Deployment:** Azure OpenAI `gpt-4o` / `gpt-4o-mini`
- **Architecture:** 2-Tier Heterogeneous Sequential Pipeline:
  - **Stage 1 (Researcher Agent):** Tool-calling investigation agent (`search_facts`, `verify_claim`, `extract_metrics`) with strictly bounded research rounds (1-5 rounds).
  - **Stage 2 (Handoff Protocol):** Zod schema validation (`ResearchDossierSchema`), telemetry recording, and state transfer.
  - **Stage 3 (Writer Agent):** Zero-tool synthesis agent crafting high-impact executive summaries (McKinsey / Amazon PR-FAQ framework).

## 2. Model & Provider Details
- **Provider:** Azure OpenAI Service / Azure AI Foundry Hub.
- **Protocol:** Real-time Server-Sent Events (SSE) streaming of agent trace steps, telemetry, and structured markdown.
- **Offline Resilience:** Deterministic local mock engine (`APP_MODE=offline`) enabling instant execution and zero-token local testing / CI evaluation.

## 3. Sandboxing & Security Boundaries
- **Zero-Tool Isolation on Writer Agent:** The Writer agent is strictly zero-tool and has no access to network APIs or execution environments, neutralizing indirect prompt injection vectors.
- **Rate Limiting:** Enforced via in-memory sliding window (`10 req/min` per IP by default, configurable via `RATE_LIMIT_REQUESTS_PER_MINUTE`).
- **Emergency Kill-Switch:** Master toggle `GENERATION_ENABLED=false` halts LLM execution immediately.
- **Concurrency Control:** Semaphore limiting concurrent active pipeline executions to 2.
- **Session Privacy & Multi-Tenancy:** User sessions isolated via HMAC-SHA256 signed browser cookies (`app07-owner`), volatile memory storage with no permanent retention of sensitive user topics.

## 4. Human-in-the-Loop & Auditability
- **Inspectable Audit Trail:** Full handoff trace visualizer displays each agent's execution phase, tools called, input arguments, latency, and status.
- **Raw Dossier Inspection:** The user can toggle between the finalized executive brief and the unedited research dossier to audit source claims, confidence scores, and friction points.

## 5. Performance & Economics
- **Researcher Latency:** ~800ms - 2,500ms (online) / ~15ms (deterministic offline).
- **Writer Latency:** ~1,200ms - 3,000ms (online) / ~20ms (deterministic offline).
- **Total Pipeline Latency:** ~2.5s - 6s (online) / ~50ms (deterministic offline).
- **Cost Profile:** ~$0.005 - $0.015 per generated executive brief using Azure OpenAI `gpt-4o`.
