# AI System Card: App 08 — Production AI Deployment & Operations Studio

## 1. System Overview
- **System Name:** Production AI Deployment & Operations Studio (App 08)
- **Role:** AI Platform Engineering, SRE & Operations Capstone
- **Primary Function:** Continuous evaluation, canary rollout, blue/green switching, automated rollback, and chaos testing for generative AI workloads.
- **Port:** `3008`
- **Application Type:** Next.js 15 Fullstack Standalone Container

## 2. Model Deployments
| Target | Model | Architecture | Primary Use Case |
|---|---|---|---|
| **Baseline (Blue)** | `gpt-4o` | Multimodal Flagship LLM | Production baseline standard with verified high reasoning fidelity. |
| **Canary (Green)** | `gpt-4o-mini` (or new prompt version) | Distilled Low-Latency LLM | Candidate deployment evaluated for lower cost and faster TTFT. |
| **Offline Simulator** | Deterministic Engine | In-Memory TypeScript Engine | Zero-cost development, integration testing, CI/CD, and chaos fault simulation. |

## 3. Service Level Objectives (SLOs) & Guardrails
- **Availability Target:** 99.0% availability measured over sliding window.
- **Max P95 Latency Target:** `< 2500ms`.
- **Max Error Rate:** `< 2.0%`.
- **Circuit Breaker:** Trips to `OPEN` after 3 consecutive failures or >30% failure rate; 8-second cooldown before `HALF-OPEN` probing.
- **Automated Rollback:** Atomic reversion to 100% Blue if Canary P95 exceeds 2500ms or error rate exceeds 2.0%.

## 4. Security & Governance Controls
1. **Prompt Shield (OWASP LLM01):** Inspects incoming prompts for jailbreak patterns and halts processing prior to model inference.
2. **Session Isolation:** Signed HTTP-only cookies using HMAC-SHA256 (`app08-owner`).
3. **Concurrency Semaphore:** Global limiter restricting concurrent executions to prevent cloud quota throttling.
4. **IP Sliding Window Rate Limiter:** 30 requests/minute per client IP.
5. **Master Kill-Switch:** `DEPLOY_ENABLED=false` immediately drops incoming traffic with HTTP 503 Service Unavailable.

## 5. Failure Modes & Mitigations
| Failure Mode | Impact | Automated Mitigation |
|---|---|---|
| Latency Spike on Canary | Degradation of user experience | Automated Rollback Trigger shifts 100% traffic to Blue in <100ms. |
| Azure 429 Quota Exhaustion | Cascading application errors | Circuit Breaker opens, protecting upstream APIs and failing fast. |
| Broken Output JSON Schema | Downstream parser crashes | Strict schema validation records failures and logs telemetry incident. |
| Prompt Injection Attack | Unauthorized system disclosure | Prompt Shield rejects payload with HTTP 400 Bad Request. |
