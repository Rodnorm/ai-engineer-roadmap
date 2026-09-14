# Case Study: App 05 — Agentic Workflow

## Overview

Agentic Workflow implements an autonomous execution loop leveraging the ReAct (`Thought -> Action -> Observation -> Final Answer`) reasoning paradigm with multi-tool calling, state machine persistence, and mandatory Human-in-the-Loop (HITL) authorization for high-risk actions.

## Architecture

```text
User Request / UI
      |
      v
FastAPI Orchestrator (/api/agent/run, /api/agent/approve)
      |
      +---> Concurrency Semaphore (MAX_CONCURRENT_REQUESTS = 2)
      +---> In-Memory Rate Limiter (per-minute, per-day per-IP, global daily)
      |
      v
ReAct Reasoning Loop (agent.py)
      |
      +---> Azure OpenAI / OpenAI (Tools Function Calling)
      |     or Offline Deterministic Planner
      |
      +---> Deterministic Tools (tools.py)
      |        ├── calculator(expression): Safe AST arithmetic
      |        ├── knowledge_search(query): Internal policy & infra specs
      |        └── send_alert(recipient, message): Operational alerts [SENSITIVE]
      |
      +---> Human-in-the-Loop Guard:
               If tool requires approval -> Pause in `waiting_approval`
               Operator inspects parameters in UI -> Approve / Reject
```

## Engineering Highlights

1. **ReAct Loop with Guardrails:** The agent reasons iteratively, selecting tools based on structured schemas. A hard limit of 4 iterations prevents infinite execution loops.
2. **Deterministic Safe Tooling:** The calculator parses arithmetic via abstract syntax trees (`ast.parse`), avoiding dangerous `eval()`. The internal knowledge base performs in-memory retrieval without external dependencies.
3. **Human-in-the-Loop (HITL) State Machine:** When an action is sensitive (e.g. `send_alert`), the session enters `waiting_approval` state. The agent suspends execution and persists its pending tool call until the human operator authorizes or rejects the action via the `/api/agent/approve` endpoint.
4. **Resilient Dual-Mode Execution:** The backend operates both online with Azure OpenAI function calling and 100% offline with a deterministic rule-based planner for local development, CI pipelines, and zero-cost unit testing.
5. **Security & Financial Controls:** Concurrency semaphores, triple-bucket IP rate limiters, master kill switch (`GENERATION_ENABLED`), sanitized error payloads, and non-root Docker containerization.

## Status

The implementation is complete with full frontend i18n (EN, PT, DE), theme support, automated unit tests, and accessible approval UI controls.
