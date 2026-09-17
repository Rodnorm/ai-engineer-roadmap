# App 05 — Agentic Workflow

Autonomous agent execution loop with multi-tool calling, in-memory stateful session lifecycle, and Human-in-the-Loop authorization.

---

## 🚀 Features

- **ReAct Execution Loop:** Iterative reasoning (`Thought -> Action -> Observation -> Final Answer`) with a safety guard limit of 4 iterations.
- **Deterministic Tool Calling:**
  - `calculator(expression)`: Safe AST-based mathematical formula evaluation.
  - `knowledge_search(query)`: In-memory lookup of company policies, incident SLAs, on-call schedules, and infrastructure specs.
  - `send_alert(recipient, message)`: Operational alert dispatch with mandatory human authorization.
- **Human-in-the-Loop (HITL):** Sensitive actions pause the agent loop in `waiting_approval` state until explicitly authorized or rejected by the user in the UI.
- **Robust Security & Guardrails:**
  - In-memory distributed rate limiter (per-minute, per-day per-IP, global daily limits).
  - Concurrency control semaphore.
  - Master kill-switch (`GENERATION_ENABLED=false`).
  - Sanitized health endpoint (`GET /health`).
- **Offline Mode:** 100% testable and runnable offline without paid cloud API keys.

---

## 🛠️ Local Development

### 1. Backend (FastAPI)
```bash
cd apps/05-agentic-workflow/backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8005
```

### 2. Frontend (Next.js)
```bash
cd apps/05-agentic-workflow/frontend
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
