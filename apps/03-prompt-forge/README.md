# App 03 — promptForge

A Next.js content studio for marketers to turn a brief into three structured content variations using distinct personas.

The Next.js frontend is connected to a FastAPI backend with Azure OpenAI structured generation, native SSE streaming, Azure Content Safety, and request metadata displayed in browser memory.

## Frontend features

- Marketing brief, target audience, and content format inputs
- Friendly SaaS Marketer, Technical Blogger, and Skeptical CFO personas
- Temperature, Top P, and max-token controls
- Streaming generation with cancellable requests
- Structured `title`, `body`, and `seoKeywords` output
- Preview and JSON views, copy action, and JSON export
- Azure Content Safety blocked state
- Per-request token and estimated-cost log
- Responsive light and dark themes
- English, Portuguese, and German translations

## Structure

```text
03-prompt-forge/
├── backend/      # FastAPI service with Azure OpenAI & Content Safety
├── frontend/     # Interactive Next.js content studio
├── README.md
└── compose.coolify.yml
```

## Frontend setup

From `apps/03-prompt-forge/frontend`:

```powershell
Copy-Item .env.example .env.local
# Set BACKEND_URL=http://localhost:8000
npm install
npm run dev
```

Open `http://localhost:3003`.

## Backend setup

From `apps/03-prompt-forge/backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python main.py
```

Fill the `AZURE_OPENAI_*` values in `.env`. Direct FastAPI routes are rooted at
`http://localhost:8000`; `/api/backend` is also accepted as a proxy prefix.
Without Azure configuration, generation returns `503`. Production
(`APP_ENV=production`) also requires Content Safety credentials and a
`RATE_LIMIT_HASH_KEY` of at least 32 characters. Development can use the local
blocked-term heuristic when Content Safety is unconfigured.

Main endpoints:

- `GET /health`
- `POST /generate`
- `POST /generate/stream`
- `POST /safety/check`
- `GET /prompts`

## Request history and limits

The UI keeps recent request metadata in component state. There is no `GET /log`
endpoint or durable request-history store. Backend JSON logs include operational
metadata. Request quotas use SQLite; concurrency is process-local. Persistent
user-visible history remains unimplemented.

The frontend calls `/api/backend/generate/stream`, which proxies to FastAPI
`/generate/stream`, by default. The non-streaming `/generate` endpoint remains available as a fallback and for direct API clients.

