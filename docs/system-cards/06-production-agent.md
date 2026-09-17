# AI System Card: 06 Production Agent

## 1. System Overview
- **Application:** Production Agent (Autonomous Tool-Calling Agent with Model Context Protocol)
- **Primary Model Deployment:** Azure OpenAI `gpt-4o-mini`
- **Protocol:** Model Context Protocol (MCP) for tool discovery and execution.

## 2. Model & Provider Details
- **Provider:** Azure OpenAI Service
- **Tool Calling:** Native function calling with strict JSON schema definitions.
- **Context Management:** Dynamic system prompt construction with tool catalog and conversation history.

## 3. Sandboxing & Security Boundaries
- **Container Isolation:** Backend container runs with `no-new-privileges: true` and all Linux capabilities dropped (`cap_drop: [ALL]`).
- **Conversation Isolation:** Session and conversation records are strictly partitioned by tenant ID; cross-tenant message access is rejected at the database layer.
- **MCP Boundary Protection:** MCP server processes run within restricted sub-environments with explicit tool authorization tokens.

## 4. Human-in-the-Loop Policy
- Read-only tools (e.g. read file, search catalog) execute autonomously.
- State-mutating tools (e.g. file modification, code execution, webhook dispatch) require affirmative operator confirmation before execution proceeds.

## 5. Performance & Economics
- **Tool Selection Latency:** ~450ms
- **End-to-End Task Execution:** ~2,800ms (multi-turn reasoning + tool execution)
- **Cost Profile:** ~$0.0025 per multi-tool task
