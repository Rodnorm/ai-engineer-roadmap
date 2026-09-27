# App 08 — Production AI Deployment & Operations Studio

Capstone of the AI Engineering Roadmap: a full-featured AIOps platform for managing generative AI in mission-critical production environments.

## Features

- **Canary & Blue/Green Traffic Router:** Dynamic weighted splitting (e.g. 90% Blue / 10% Green), atomic zero-downtime Blue/Green switching, and asynchronous shadow mirroring.
- **SLO Observability & Error Budget:** Real-time percentile distributions (P50, P90, P95, P99), TTFT (Time-to-First-Token), and Error Budget burn rate tracking.
- **Circuit Breaker & Automated Rollback:** Immediate circuit opening on consecutive upstream failures and automatic atomic rollback to baseline upon SLO violation.
- **Chaos Engineering & Resilience Injection:** Built-in fault injection (artificial latency spikes, Azure 429 quota exhaustion, OWASP LLM01 prompt injection, and schema corruption).
- **12 Production Quick Scenarios:** 1-click execution of real-world operational challenges.
- **Trilingual Interface:** English, Portuguese, and German with browser locale autodetection and preference persistence.
- **Dual Operating Modes:** Online (Azure OpenAI `gpt-4o` & `gpt-4o-mini`) or completely Offline (deterministic simulation engine for testing and CI/CD).

## Local Development

```bash
# Run from repository root
npm run dev:08

# Or run directly inside apps/08-ai-ops-deployment
npm run dev
```

The application will be available at `http://localhost:3008`.

## Testing & Quality

```bash
npm run typecheck
npm run test
npm run build
```
