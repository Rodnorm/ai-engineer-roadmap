# promptForge backend

FastAPI API for generating three marketing-content variations with Azure OpenAI.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Fill these values in `.env`:

```text
AZURE_OPENAI_ENDPOINT=https://<resource-name>.services.ai.azure.com/openai/v1
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_KEY=<api-key>
AZURE_CONTENT_SAFETY_ENDPOINT=https://<resource-name>.cognitiveservices.azure.com
AZURE_CONTENT_SAFETY_API_KEY=<api-key>
```

Do not commit `.env`. The server still starts without Azure credentials, but
`POST /generate` returns `503` until they are configured.

## Run

```powershell
python main.py
```

Direct routes are available at `http://localhost:8000`; the backend also accepts
the `/api/backend` proxy prefix. Interactive docs are available at `/docs` (or
`/api/backend/docs`) outside production.

## Endpoints

- `GET /health` reports service and Azure configuration status.
- `POST /generate` generates exactly three structured variations.
- `POST /generate/stream` streams generation progress using server-sent events.
- `POST /safety/check` analyzes text with Azure Content Safety when configured.
- `GET /prompts` returns the bundled prompt test harness.

### Generate content

```powershell
$body = @{
  brief = "Launch a simple project management tool for small software teams."
  audience = "small software teams"
  format = "linkedin"
  persona = "friendly"
  language = "en"
  temperature = 0.7
  topP = 0.9
  maxTokens = 700
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8000/api/backend/generate `
  -ContentType application/json `
  -Body $body
```

The response contains `data.variations` plus request ID, latency, token usage,
and estimated cost under `meta`.

The streaming endpoint accepts the same payload and emits `safety`, `start`, `delta`,
`variation`, `result`, or `error` SSE events. Each `variation` contains one
complete card as soon as its JSON object closes; the final `result` contains
the same validated response shape as `/generate`.

### Check safety

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8000/api/backend/safety/check `
  -ContentType application/json `
  -Body '{"text":"A product launch announcement"}'
```

## Notes

- The UI request list lives in browser component state; the backend has no `/log` route or durable history API.
- `/generate` checks the brief with Content Safety before calling the model.
- Without Content Safety credentials, development uses a small local blocked-term heuristic. Production fails closed with `503` when the remote check is needed.
- Production requires `RATE_LIMIT_HASH_KEY` (at least 32 characters); quota counters use SQLite.
- Application logs are JSON and every response includes an `x-request-id` header.

