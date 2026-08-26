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
```

Do not commit `.env`. The server still starts without Azure credentials, but
`POST /generate` returns `503` until they are configured.

## Run

```powershell
python main.py
```

The API is available at `http://localhost:8000/api/backend`. Interactive API
documentation is available at `/api/backend/docs`.

## Endpoints

- `GET /health` reports service and Azure configuration status.
- `POST /generate` generates exactly three structured variations.
- `GET /log?limit=20` returns recent process-local generation entries.
- `POST /safety/check` runs the current lightweight blocked-term check.
- `GET /prompts` returns the bundled prompt test harness.

### Generate content

```powershell
$body = @{
  brief = "Launch a simple project management tool for small software teams."
  audience = "small software teams"
  format = "linkedin"
  persona = "friendly"
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

### Check safety

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8000/api/backend/safety/check `
  -ContentType application/json `
  -Body '{"text":"A product launch announcement"}'
```

## Notes

- Request logs are intentionally kept in memory and reset with the process.
- Safety is currently a small heuristic, not Azure AI Content Safety.
- Application logs are JSON and every response includes an `x-request-id` header.
