# App 05 — Agentic Workflow

Autonomous agent execution loop with multi-tool calling, in-memory stateful session lifecycle, and Human-in-the-Loop authorization.

---

## 🚀 Features

- **ReAct Execution Loop:** Iterative reasoning (`Thought -> Action -> Observation -> Final Answer`) with a safety guard limit of 4 iterations.
- **Deterministic Tool Calling:**
  - `calculator(expression)`: Safe AST-based mathematical formula evaluation.
  - `knowledge_search(query)`: In-memory lookup of company policies, incident SLAs, on-call schedules, and infrastructure specs.
  - `send_alert(recipient, message)`: Simulated alert result with mandatory human authorization; no email, Slack or other delivery integration exists.
- **Human-in-the-Loop (HITL):** Sensitive actions pause the agent loop in `waiting_approval` state until explicitly authorized or rejected by the user in the UI.
- **Robust Security & Guardrails:**
  - SQLite-backed rate limiter (shared only by processes using the same database file) (per-minute, per-day per-IP, global daily limits).
  - Concurrency control semaphore.
  - Master kill-switch (`GENERATION_ENABLED=false`).
  - Sanitized health endpoint (`GET /health`).
- **Offline Mode:** A deterministic planner is used when Azure credentials are absent. It demonstrates a bounded set of tool workflows, not general LLM reasoning.
- **Sessions:** Bearer-token-protected in-memory state, default 30-minute TTL and 500-session cap; state is lost on restart.

---

## 🛠️ Local Development

### 1. Backend (FastAPI)
```bash
cd apps/05-agentic-workflow/backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
cp .env.example .env
# Leave Azure credentials empty to use the offline planner.
pip install -r requirements.txt
uvicorn main:app --reload --port 8005
```

### 2. Frontend (Next.js)
```bash
cd apps/05-agentic-workflow/frontend
cp .env.example .env.local
# Set BACKEND_URL=http://localhost:8005
npm install
npm run dev
```

Visit `http://localhost:3005`.

---

## 🧪 Testing

Run offline backend unit tests:
```bash
python -m unittest discover -s apps/05-agentic-workflow/backend -p "test_*.py"
```


## API and deployment

The Next.js `/api/backend/*` proxy forwards to FastAPI. Backend routes include
`POST /api/agent/run`, `POST /api/agent/approve`,
`GET /api/agent/session/{session_id}` and `GET /health`.
Session reads require `X-Session-Token`; run/approval payloads carry the session token.

`compose.coolify.yml` provides deployment configuration. Production requires a
`RATE_LIMIT_HASH_KEY` of at least 32 characters and a persistent counter volume.
`GENERATION_ENABLED` gates new runs; it is not checked by the approval endpoint.
Calculator and knowledge tools execute locally; `send_alert` only returns a string.
