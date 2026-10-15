# App 06 — Agent Workspace

A streaming workspace assistant built with Next.js, Microsoft Foundry Agent Service, a Node.js MCP server, and optional Azure Cosmos DB persistence.

## Features

- Responsive chat workspace with conversation history and mobile navigation.
- Server-Sent Events for token and tool-status streaming.
- Microsoft Foundry prompt-agent adapter through the Azure AI Projects and OpenAI Responses APIs.
- Deterministic offline provider for local development and CI.
- MCP 2026 Streamable HTTP endpoint with legacy 2025 compatibility.
- Four typed tools: `list_tasks`, `search_notes`, and approval-gated `create_task` / `update_task`.
- In-memory development persistence and a Cosmos DB production adapter.
- Rate limiting, concurrency control, input validation, security headers, and a generation kill switch.
- Independent Docker images for the web and MCP services.

## Architecture

```text
Browser
  -> Next.js Route Handlers (SSE)
      -> Offline adapter -> MCP internal API
      -> Foundry Agent Service -> public MCP endpoint
      -> Memory or Cosmos DB conversation repository

MCP service
  -> list_tasks
  -> search_notes
  -> create_task / update_task (confirmed writes only)
```

## Local development

### Docker Compose

```bash
cd apps/06-agent-workspace
cp frontend/.env.example frontend/.env
# Set AGENT_PROVIDER=offline and distinct random secrets (32+ characters):
# CONVERSATION_SESSION_SECRET and INTERNAL_API_TOKEN.
# Compose supplies frontend/.env to both services for the shared internal token.
docker compose up --build
```

Open `http://localhost:3006`. With `AGENT_PROVIDER=offline`, Compose runs without Foundry and persists workspace
tasks in a local Docker volume. The production-built web image requires the two
secrets even in offline mode. Conversation history remains in memory unless Cosmos
is configured; the task volume does not persist conversations.

### Run services separately

```bash
cd apps/06-agent-workspace/mcp-server
npm install
npm run dev

cd ../frontend
cp .env.example .env.local
npm install
# Defaults: AGENT_PROVIDER=offline, MCP_SERVER_URL=http://localhost:8006
npm run dev
```

The frontend uses port `3006`; the MCP service uses `8006`.

## Validation

```bash
cd apps/06-agent-workspace/mcp-server
npm run typecheck
npm test
npm run build

cd ../frontend
npm run typecheck
npm test
npm run lint
npm run build
```

## Foundry setup

1. Deploy the MCP service at a public HTTPS endpoint.
2. Configure the values shown in `frontend/.env.example`.
3. Run `npm run provision:agent` from the frontend directory.
4. Set `AGENT_PROVIDER=foundry` and the printed `AZURE_AI_AGENT_NAME` in the web service.

Foundry is configured to request approval before every MCP call. The application surfaces the requested tool and arguments rather than exposing hidden reasoning or raw provider payloads.

## Deployment

See [COOLIFY.md](./COOLIFY.md) for the two-service Hetzner/Coolify setup, Foundry provisioning, Cosmos configuration, and final production checks.

## Privacy

Conversation messages are retained in process memory by default. Setting
`COSMOS_ENDPOINT` selects durable Cosmos DB storage partitioned by `ownerId`.
Signed anonymous browser cookies isolate conversation history; they are not user
accounts or cross-device identity. Clearing cookies loses access to that owner.

The MCP task/note store is shared across users and optionally persisted via
`WORKSPACE_DATA_FILE`; it has no per-owner partitioning. Write tools require
confirmation, but this is not tenant isolation. Use synthetic workspace data.
Foundry mode sends conversation/tool context to Azure; offline mode uses the local
adapter. Do not interpret the absence of prompt logging as absence of stored messages.

