# App 06 — Agent Workspace

A streaming workspace assistant built with Next.js, Microsoft Foundry Agent Service, a Node.js MCP server, and optional Azure Cosmos DB persistence.

## Features

- Responsive chat workspace with conversation history and mobile navigation.
- Server-Sent Events for token and tool-status streaming.
- Microsoft Foundry prompt-agent adapter through the Azure AI Projects and OpenAI Responses APIs.
- Deterministic offline provider for local development and CI.
- MCP 2026 Streamable HTTP endpoint with legacy 2025 compatibility.
- Three typed tools: `list_tasks`, `search_notes`, and approval-gated `create_task`.
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
  -> create_task (confirmed writes only)
```

## Local development

### Docker Compose

```bash
cd apps/06-agent-workspace
docker compose up --build
```

Open `http://localhost:3006`. Compose starts offline mode and persists workspace tasks in a local Docker volume.

### Run services separately

```bash
cd apps/06-agent-workspace/mcp-server
npm install
npm run dev

cd ../frontend
npm install
AGENT_PROVIDER=offline MCP_SERVER_URL=http://localhost:8006 npm run dev
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

Prompts are stored only when conversation persistence is enabled. The application does not log prompt contents by default. The bundled workspace data is synthetic and safe for a public demo.
