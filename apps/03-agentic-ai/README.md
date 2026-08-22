# App 03 — Agentic AI Application

An agentic AI application with a Next.js frontend and a FastAPI backend.

## Structure

```text
03-agentic-ai/
├── backend/
│   ├── .env.example
│   ├── agent.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── .env.example
│   └── package.json
├── README.md
└── vercel.json
```

## Backend setup

From `apps/03-agentic-ai/backend`:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload --port 8000
```

The health endpoint is available at `http://localhost:8000/health`.

## Frontend setup

From `apps/03-agentic-ai/frontend`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. During local development, Next.js rewrites `/api/backend/*` to FastAPI on port 8000.

## Environment

Backend settings use `PORT` and `LOG_LEVEL`. The frontend API base path defaults to `/api/backend`, and its local rewrite target defaults to `http://localhost:8000`.
