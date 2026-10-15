# App 06 Case Study — Agent Workspace

## Problem

LLM chat demos often hide the difficult integration work: tool discovery, approval boundaries, streaming, conversation continuity, and production deployment. Agent Workspace makes those boundaries explicit in one small application.

## Solution

The application combines a responsive Next.js chat with a dedicated Node MCP server. A provider seam allows the same interface to use a deterministic offline agent during development or Microsoft Foundry Agent Service in production.

The MCP server exposes exactly four tools:

- `list_tasks` for filtered task retrieval;
- `search_notes` for deterministic workspace search;
- `create_task` for a user-approved write operation;
- `update_task` for a user-approved task update operation.

The application streams agent and tool lifecycle events to the browser with Server-Sent Events. Conversations are kept in memory locally and can be stored in Azure Cosmos DB in production. Foundry conversation identifiers are stored with the local conversation so the remote context can continue across requests.

## Architecture decisions

- **Separate MCP service:** Foundry needs a public remote MCP endpoint, while the application also needs an internal low-latency tool path for offline mode.
- **Offline-first adapter:** CI and local learning do not require paid Azure calls.
- **Approval before writes:** The UI pauses before a tool mutation and displays the exact arguments.
- **Provider-neutral events:** The browser consumes a small internal event model instead of Azure SDK payloads.
- **Repository interface:** Cosmos DB is replaceable and tests do not need cloud credentials.
- **Two Coolify services:** Web and MCP can be deployed, monitored, and restarted independently.

## Security and cost controls

- Input length validation and sanitized client errors.
- Per-client request limiting and a concurrent-generation cap.
- `GENERATION_ENABLED` emergency kill switch.
- Server-only Azure and Cosmos credentials.
- Optional separate tokens for internal tool calls and the public MCP endpoint.
- Security headers and a same-origin browser API.
- Prompt contents are not written to logs by default.

## Validation

- MCP tool unit tests cover reads, searches, confirmation rejection, and confirmed writes.
- Offline agent tests cover tool selection and approval behavior.
- An end-to-end HTTP smoke test verifies conversation creation, SSE streaming, approval, tool execution, and stored message history.
- Both TypeScript projects pass type checking and production builds.

## What this project demonstrates

The project moves beyond a single prompt/response integration. It demonstrates agent tool protocols, remote agent state, approval workflows, event streaming, persistence adapters, secure configuration, and self-hosted deployment boundaries.
