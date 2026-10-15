# 01 — Smart Inspector

**Week 1 deliverable.** A small web app that inspects an image and tells you
what's in it. Upload any picture and the app returns a one-line caption, a few
descriptive tags, the objects it sees, the text it can read (OCR), and — when it
can identify a product — model-generated price and product-link fields. No shopping search or live price
verification is implemented, so these fields may be inaccurate or outdated.

Under the hood the frontend talks to a Python backend that forwards the image to
Azure OpenAI's multimodal model using the structured-output (Responses API) so
the UI always gets typed, predictable JSON back.

## Stack

- **Frontend** — Next.js 16 (App Router) + TypeScript + Tailwind CSS + React 19
- **Backend** — FastAPI + Uvicorn, OpenAI Python SDK pointing at Azure OpenAI (`/openai/v1`)
- **Infra** — Docker Compose deployment configured for Coolify and Hetzner

## Repo layout

```
apps/01-smart-inspector/
├── backend/            # FastAPI app exposing POST /analyze and GET /health
├── frontend/           # Next.js app (App Router)
└── compose.coolify.yml # Coolify Compose definition
```

## Prerequisites

- Node.js 20.9+
- Python 3.10+ (or [uv](https://docs.astral.sh/uv/))
- An Azure OpenAI resource with a deployed multimodal model (e.g. `gpt-4.1-mini`) and a valid API key

---

## Running the backend

The backend exposes `POST /analyze` (multipart form, field `image`) and
`GET /health`. It expects the image plus an optional `language` form field
(`en`, `de`, `pt-br`); default is `de`.

### 1. Configure environment

```bash
cd apps/01-smart-inspector/backend
cp .env.example .env
```

Open `.env` and fill in:

```env
AZURE_OPENAI_ENDPOINT=https://<your-resource>.services.ai.azure.com/openai/v1
AZURE_OPENAI_DEPLOYMENT=<your-deployment-name>
AZURE_OPENAI_API_KEY=<your-api-key>
PORT=8000

# Upload and Azure request guards
MAX_IMAGE_BYTES=5242880
AZURE_MAX_OUTPUT_TOKENS=800
AZURE_REQUEST_TIMEOUT_SECONDS=30

# Cost and abuse guards
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=5
RATE_LIMIT_REQUESTS_PER_DAY_PER_IP=30
RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY=300
TRUST_PROXY_HEADERS=false
```

### 2. Install dependencies and start

With `pip`:

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Or with `uv` (faster):

```bash
uv venv
uv pip install -r requirements.txt
uv run --no-project uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Quick sanity check:

```bash
curl http://localhost:8000/health
```

Run the dependency-free rate-limiter tests:

```bash
python -m unittest test_rate_limit.py
```

To test HTTP rate limiting without consuming many Azure calls, temporarily set
`RATE_LIMIT_REQUESTS_PER_MINUTE=1`, restart the backend, and send two valid
requests. The second request should return HTTP `429`.

---

## Running the frontend

The browser calls the same-origin `POST /api/analyze` Next.js route. That route
forwards the upload to `BACKEND_URL` (with `/analyze` appended when needed), or
`ANALYZE_SERVICE_URL` as a fallback. Start the backend first.

### 1. Configure environment

```bash
cd apps/01-smart-inspector/frontend
cp .env.example .env.local
```

The example points to the orchestrator backend on port 8001. For the standalone
backend command above, change `.env.local` to:

```env
ANALYZE_SERVICE_URL=http://localhost:8000/analyze
```

Adjust the URL if you run the backend on a different host or port.

### 2. Install dependencies and start

```bash
npm install
npm run dev
```

Open http://localhost:3001, pick an image, and click **Enviar**.

---

## Expected response shape

`POST /analyze` returns JSON matching this contract (also typed in the
frontend as `AnalysisResult`):

```ts
{
  caption: string,          // one-line description, in the requested language
  tags: string[],           // 3-8 short, lowercase keyword tags
  objects: string[],        // distinct detected objects
  ocr: string,              // extracted text (preserves line breaks)
  averagePrice: string,     // "" when no reliable price can be identified
  lowestPriceLink: string   // "" when no product link is available
}
```

## Security, cost, and abuse guards

The backend enables conservative limits by default:

- 5 MB maximum image size, read in bounded chunks
- GIF, JPEG, PNG, and WebP content types only
- 800 maximum output tokens
- 30-second Azure OpenAI timeout
- No automatic Azure OpenAI retries
- 5 requests per minute per IP
- 30 requests per day per IP
- 300 requests per day across processes using the same rate-limit database
- Generic client-facing Azure errors, with internal details kept in server logs
- Restricted CORS methods and headers

Rejected rate-limited requests return HTTP `429` with a `Retry-After` header.
Oversized uploads return HTTP `413`, and unsupported media types return HTTP
`415`. These requests are rejected before an Azure OpenAI call is made.

The limiter persists counters in SQLite (`RATE_LIMIT_DB_PATH`). Processes sharing
that file share counters; isolated replicas do not. Retain its volume across
restarts. In production, `RATE_LIMIT_HASH_KEY` must contain at least 32 characters.
This is a request quota, not a hard monetary spending cap.

Proxy headers are disabled by default. To trust `X-Forwarded-For`, enable
`TRUST_PROXY_HEADERS` and configure `TRUSTED_PROXY_CIDRS` for the actual trusted
proxy addresses; enabling the flag alone is insufficient.

## Notes / known limits

- The app accepts GIF, JPEG, PNG, and WebP uploads and rejects empty files.
- Unknown language codes from the client fall back to German (`de`).
- `averagePrice` and `lowestPriceLink` are only returned when the model can
  identify a product — empty strings are expected for generic/scene images.
  These are model assertions and are not verified against retailer inventory.

## AI-103 mapping

This app exercises the **Plan and manage an Azure AI solution** and
**Implement computer-vision solutions** skill areas, end-to-end: resource
provisioning, multimodal invocation, structured outputs, and a clean separation
between client (Next.js) and model-serving (FastAPI) layers.

