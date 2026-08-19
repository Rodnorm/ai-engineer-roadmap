# 01 — Smart Inspector

**Week 1 deliverable.** A small web app that inspects an image and tells you
what's in it. Upload any picture and the app returns a one-line caption, a few
descriptive tags, the objects it sees, the text it can read (OCR), and — when it
can identify a product — the average price and a link to buy it at the lowest
price online.

Under the hood the frontend talks to a Python backend that forwards the image to
Azure OpenAI's multimodal model using the structured-output (Responses API) so
the UI always gets typed, predictable JSON back.

## Stack

- **Frontend** — Next.js 14 (App Router) + TypeScript + Tailwind CSS + React 18
- **Backend** — FastAPI + Uvicorn, OpenAI Python SDK pointing at Azure OpenAI (`/openai/v1`)
- **Infra** — Configured to deploy on Vercel (`vercel.json` routes `/api/backend/*` to the FastAPI service)

## Repo layout

```
apps/01-smart-inspector/
├── backend/        # FastAPI app exposing POST /analyze and GET /health
├── frontend/       # Next.js app (App Router)
└── vercel.json     # routes /api/backend/* → backend, everything else → frontend
```

## Prerequisites

- Node.js 20+
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
uv sync
uv run uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Quick sanity check:

```bash
curl http://localhost:8000/health
```

---

## Running the frontend

The frontend is a Next.js 14 app. In dev it talks to the backend directly at
`http://localhost:8000/analyze`, so start the backend first.

### 1. Configure environment

```bash
cd apps/01-smart-inspector/frontend
cp .env.example .env.local
```

`.env.example` already points at the local backend:

```env
ANALYZE_SERVICE_URL=http://localhost:8000/analyze
```

Adjust the URL if you run the backend on a different host or port.

### 2. Install dependencies and start

```bash
npm install
npm run dev
```

Open http://localhost:3000, pick an image, and click **Enviar**.

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

## Notes / known limits

- The app only accepts `image/*` content types and rejects empty uploads.
- Unknown language codes from the client fall back to German (`de`).
- `averagePrice` and `lowestPriceLink` are only returned when the model can
  confidently identify a real product — empty strings are expected for
  generic/scene images.

## AI-103 mapping

This app exercises the **Plan and manage an Azure AI solution** and
**Implement computer-vision solutions** skill areas, end-to-end: resource
provisioning, multimodal invocation, structured outputs, and a clean separation
between client (Next.js) and model-serving (FastAPI) layers.
