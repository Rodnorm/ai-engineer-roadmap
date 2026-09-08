# Case Study: App 03 — Prompt Forge

## 1. Overview
Prompt Forge is a structured content generation workbench. It allows marketing teams to craft tailored content variations across different personas (e.g. Friendly, Technical, CFO) and formats (LinkedIn, Email, Landing Page).

## 2. Learning & Technical Goals
- Implement pre-generation safety filtering with Azure Content Safety API.
- Support real-time Server-Sent Events (SSE) streaming with structured JSON parsing.
- Eliminate server-side prompt logging vulnerabilities by shifting history storage to client `localStorage`.

## 3. Architecture & Tech Stack
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Azure OpenAI, Azure Content Safety SDK.

## 4. Key Security & Cost Control Decisions
- **Content Safety:** Automated inspection for hate speech, self-harm, and violence before initiating LLM calls.
- **No Pseudo-Identity:** Removed `X-Client-ID` headers and server log endpoints (`/log`), preventing unauthorized log access.
- **Streaming Hardening:** SSE streams pass `Cache-Control: no-store` headers and do not log individual text deltas.

## 5. Outcome
Prompt Forge delivers fast, streaming content variations with strict safety bounds and zero prompt exposure on the backend.
