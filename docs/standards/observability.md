# Observability and Operational Metrics Standards

This document establishes the observability architecture, OpenTelemetry conventions, correlation tracking, and operational alerting across the monorepo applications.

---

## 1. End-to-End Trace Correlation

Every incoming user request receives a unique, traceable correlation ID passed as `X-Request-ID` across all architectural tiers:

```
[Browser / Client] 
       │ (generates or forwards X-Request-ID)
       ▼
[Next.js App Router / Edge Proxy]
       │ (propagates X-Request-ID)
       ▼
[FastAPI Backend Middleware]
       │ (injects W3C traceparent: 00-{trace_id}-{span_id}-01)
       ▼
[Azure OpenAI / MCP Tool Providers]
```

### Invariant Rules
- If the client supplies a valid `X-Request-ID` (`[A-Za-z0-9._-]{8,100}`), it is adopted; otherwise a cryptographically secure UUID is generated.
- The `X-Request-ID` is stamped on all response headers and embedded in structured JSON logs.
- W3C `traceparent` headers are generated and forwarded to upstream LLM and MCP services for distributed trace linking.

---

## 2. OpenTelemetry GenAI Semantic Conventions

Spans wrapping external LLM, embedding, and MCP tool invocations follow the [OpenTelemetry Semantic Conventions for Generative AI](https://opentelemetry.io/docs/specs/semconv/gen-ai/):

| OpenTelemetry Attribute | Type | Description |
| :--- | :--- | :--- |
| `gen_ai.system` | string | Target provider (e.g. `azure_openai`, `anthropic`, `ollama`) |
| `gen_ai.request.model` | string | Model deployment name (e.g. `gpt-4o-mini`, `text-embedding-3-small`) |
| `gen_ai.operation.name` | string | Operation type (`chat`, `completion`, `embeddings`, `execute_tool`) |
| `correlation_id` | string | Correlation request ID matching `X-Request-ID` |
| `prompt_tokens` | integer | Tokens consumed by the input prompt |
| `completion_tokens` | integer | Tokens consumed by the generated response |
| `duration_ms` | float | Wall-clock latency of the call in milliseconds |
| `status` | string | Execution outcome (`ok`, `error`) |
| `error.type` | string | Exception class name if failed |
| `estimated_cost_usd` | float | Calculated operational cost based on provider tier |

### Strict Zero-Content & PII Exclusion Policy
Under **NO circumstances** are prompt texts, document contents, user question bodies, base64 images, or personal identifiable information (PII) captured in trace attributes, metrics, or error logs. Observability tracks execution metadata only.

---

## 3. Operational Metrics & Dashboards

Each backend service exposes operational telemetry via `/api/metrics`:

```json
{
  "total_requests": 1420,
  "error_count": 8,
  "error_rate": 0.0056,
  "p50_latency_ms": 182.4,
  "p95_latency_ms": 612.0,
  "prompt_tokens": 145020,
  "completion_tokens": 42100,
  "estimated_cost_usd": 0.04701
}
```

- **p50 / p95 Latency:** Rolling percentile window tracking typical vs tail latency.
- **Error Rate:** Ratio of 5xx / provider failures over total requests.
- **Token & Cost Budgets:** Live monitoring of consumed tokens against daily allocations.

---

## 4. Synthetic Health Monitoring & Alerting

### Uptime Kuma Configuration
All deployed frontend and backend instances are monitored synthetically every 60 seconds:
- **Liveness probe:** `GET /health` expects HTTP 200 within 5000ms.
- **Contract check:** Validates `status: healthy` in the JSON response payload.
- **Keyword verification:** Confirms service identifier presence.

### Alert Thresholds
| Condition | Trigger Threshold | Severity | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Error Spike** | Error rate > 5% over 5-minute window | High | Inspect backend logs filtered by recent `X-Request-ID` |
| **Quota Exhaustion** | 429 rate limit errors > 10 / minute | Medium | Rotate or review daily quota limits in SQLite store |
| **Provider Downtime** | 502 / 503 from Azure OpenAI for > 3 minutes | Critical | Switch fallback endpoint or verify Azure status |
| **Latency Degradation** | p95 latency > 8000ms for 3 consecutive intervals | Medium | Check model concurrency semaphore and queuing |
