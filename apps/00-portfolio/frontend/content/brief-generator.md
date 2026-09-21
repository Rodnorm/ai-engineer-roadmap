# App 07 Case Study — Multi-Agent Brief Generator

## Problem

Technical leaders and enterprise architects often struggle to balance comprehensive engineering research with clear executive communication. Deep technical inquiries produce fragmented notes, benchmarks, and security trade-offs, while executive briefs require concise, risk-aware synthesis without technical hallucination. Monolithic single-prompt approaches either drown leadership in low-level logs or skip critical architectural trade-offs.

## Solution

Multi-Agent Brief Generator implements a heterogeneous two-stage agent pipeline that strictly separates research from synthesis:

1. **Researcher Agent:** Equipped with deterministic inquiry tools (`search_facts`, `verify_claim`, `extract_metrics`) and domain heuristics to gather evidence, verify claims, and uncover operational friction points.
2. **Orchestrator & Handoff Protocol:** Validates the structured research dossier against a strict schema, estimates token footprint, and injects verified findings into the downstream stage via a zero-tool context protocol.
3. **Writer Agent:** A zero-tool executive synthesis specialist instructed to produce a structured 5-section brief (Executive Summary, Key Insights & Evidence, Operational & Benchmark Metrics, Risks & Architectural Trade-offs, and Action Recommendations) grounded strictly on the dossier.

The interface provides real-time streaming telemetry via Server-Sent Events (SSE), an inspection drawer for runtime diagnostics, 12 quick-test scenarios, and browser session isolation.

## Architecture Decisions

- **Heterogeneous Specialization:** The Researcher Agent is tool-enabled and investigative; the Writer Agent is strictly zero-tool and communicative to eliminate tool-calling hallucinations during drafting.
- **Strict Data Contracts:** Agent boundaries communicate through typed schemas validated at runtime, ensuring complete trace isolation and reproducible handoffs.
- **Provider-Neutral Dual Engine:** Runs with live Azure OpenAI models in production or with deterministic offline engines for continuous integration and offline testing.
- **Streaming Telemetry Protocol:** SSE streams progress steps, token estimations, and phase transitions in real time without client polling.
- **Cryptographic Session Isolation:** Workspaces and brief histories are isolated in the browser via HMAC-SHA256 signed session cookies without mandatory account registration.

## Reliability, Safety, and Cost Controls

- Input length validation bounds topics and scopes to prevent prompt injection and resource exhaustion.
- Operator-configurable research round cap (`MAX_RESEARCH_ROUNDS`) limits tool exploration depth and API usage.
- Global concurrency semaphore and per-client rate limiting protect backend compute.
- Master kill-switch (`GENERATION_ENABLED`) enables immediate operational shutdown if needed.
- No sensitive user queries or generated content are logged in server telemetry.

## Validation

- Comprehensive test suites verify end-to-end multi-agent execution, rate limiting, kill-switch behavior, round bounding, and deterministic session token verification.
- Fully runnable offline with zero external API dependencies in CI.
- Passes TypeScript type checking and Next.js static production builds.

## What This Project Demonstrates

This project demonstrates advanced multi-agent orchestration patterns, typed agent handoffs, streaming telemetry, secure browser session management, and enterprise-grade cost/safety boundaries in fullstack TypeScript.
