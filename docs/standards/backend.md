# Backend Architecture & Security Standard

This document defines the mandatory backend standard for all applications in `ai-engineer-roadmap`.

---

## 1. Directory Structure

Every FastAPI backend must adhere to the following layout:

```text
backend/
├── app/
│   ├── main.py                # FastAPI initialization & route handlers
│   ├── config.py              # Typed environment variables validation
│   ├── api/                   # API endpoint sub-routers
│   ├── models/                # Pydantic schemas (requests & responses)
│   ├── services/              # External SDK integrations (Azure, OpenAI, etc.)
│   ├── security/              # Rate limiting, PII masking, Content Safety
│   │   ├── rate_limit.py
│   │   ├── client_context.py
│   │   └── content_policy.py
│   └── observability/
│       └── logging.py         # JSON structured logger without sensitive data
├── tests/                     # Unit & integration tests
├── .env.example               # Mandatory placeholder environment template
├── requirements.txt           # Locked production dependencies
└── README.md
```

---

## 2. Environment & Configuration

All environment variables must be validated at application startup via `config.py` or Pydantic `BaseSettings`.

### Standard Environment Variables

```env
APP_ENV=development
LOG_LEVEL=INFO
PORT=8000

GENERATION_ENABLED=true
MAX_CONCURRENT_REQUESTS=2
AZURE_MAX_OUTPUT_TOKENS=800
AZURE_REQUEST_TIMEOUT_SECONDS=30.0

RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=3
RATE_LIMIT_REQUESTS_PER_DAY_PER_IP=20
RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY=100

TRUST_PROXY_HEADERS=true
```

---

## 3. Mandatory Security & Cost Guards

1. **Master Kill Switch:** `GENERATION_ENABLED` boolean flag. Returns HTTP 503 when set to `false`.
2. **Concurrency Limits:** `asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)` restricts simultaneous expensive Azure AI invocations.
3. **Pre-flight Rate Limiting:** Rate limit checks MUST be evaluated **before** invoking external paid APIs.
4. **Input Length Bounds:** All request bodies MUST enforce strict Pydantic character and byte size validation.

---

## 4. Standard Error Contract

All public errors returned by API endpoints must be sanitized and conform to the following contract:

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Request limit reached. Try again later.",
    "requestId": "a1b2c3d4e5f6",
    "retryAfter": 60
  }
}
```

Never return raw Python stack traces, internal SDK exception strings, or Azure deployment names in production API responses.

---

## 5. Observability & Logging

- Operational logs must use structured JSON format.
- Logs must record: `request_id`, `method`, `path`, `status_code`, `latency_ms`, `token_count`, and `cost`.
- Logs must **NEVER** record raw user prompt inputs, image base64 strings, or unmasked PII.
