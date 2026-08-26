# App 03 — promptForge

A Next.js content studio for marketers to turn a brief into three structured content variations using distinct personas.

The frontend is complete and runs with local preview data. The FastAPI backend now exposes Azure OpenAI structured generation, an in-memory request log, prompt-harness access, and a lightweight safety check. Connecting the frontend to these endpoints remains a later step.

## Frontend features

- Marketing brief, target audience, and content format inputs
- Friendly SaaS Marketer, Technical Blogger, and Skeptical CFO personas
- Temperature, Top P, and max-token controls
- Progressive preview of three generated variations
- Structured `title`, `body`, and `seoKeywords` output
- Preview and JSON views, copy action, and JSON export
- Local Content Safety blocked-state preview
- Per-request token and estimated-cost log
- Responsive light and dark themes
- English, Portuguese, and German translations

## Structure

```text
03-prompt-forge/
├── backend/      # API scaffold; integration pending
├── frontend/     # Complete interactive frontend preview
├── README.md
└── vercel.json
```

## Frontend setup

From `apps/03-prompt-forge/frontend`:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Backend setup

From `apps/03-prompt-forge/backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python main.py
```

Fill the three `AZURE_OPENAI_*` values in `.env`. The API is available at `http://localhost:8000/api/backend`; without Azure configuration, `/generate` returns `503` while the other endpoints remain available.

Main endpoints:

- `GET /health`
- `POST /generate`
- `GET /log?limit=20`
- `POST /safety/check`
- `GET /prompts`

## Pending integrations

- Vercel AI SDK streaming
- Azure AI Content Safety
- Frontend API calls
- Persistent request logging beyond process memory

The current frontend makes no API requests. Its local generation flow exists to demonstrate and validate the final user experience before those integrations are added.
