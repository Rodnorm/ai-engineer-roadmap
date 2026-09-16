# App 06 — Agent Workspace

A focused learning project for building an end-to-end AI agent with Azure AI Foundry Agent Service, a local Node.js MCP server, durable conversations, and a streaming Next.js interface.

## Product goal

Build a small workspace assistant that can answer questions about local workspace data and perform a limited task action through MCP tools.

The main learning objective is the integration path:

```text
Next.js chat UI -> application API -> Foundry Agent Service -> MCP server -> workspace tools
                                      |
                                      -> durable thread storage
```

## MVP user flow

1. The user opens or creates a conversation.
2. The user asks a question such as "Which tasks are still open?"
3. The application sends the message to the Foundry agent.
4. The agent selects and calls an MCP tool when needed.
5. The UI streams the answer and shows which tool was used.
6. The conversation can be reopened after a restart.

## MVP scope

### Frontend

- Next.js App Router with TypeScript and the visual conventions used by the other roadmap apps.
- One responsive chat screen.
- Conversation list with create, open, and rename actions.
- Streaming assistant responses.
- Clear loading, empty, error, reconnect, and retry states.
- Compact tool-call status such as `Searching notes...`.
- Keyboard-accessible controls and mobile support.

### Application API

- A thin Node.js API layer between the browser, Foundry Agent Service, and persistence.
- Endpoints for conversations and messages.
- Server-Sent Events or an equivalent simple streaming response.
- Input validation, sanitized errors, request limits, and a health endpoint.
- No secrets exposed to the browser.

### MCP server

Start with three small tools backed by deterministic sample data:

1. `list_tasks(status?)` — list workspace tasks, optionally filtered by status.
2. `search_notes(query)` — search titles and content in workspace notes.
3. `create_task(title, description?)` — add a task after explicit user confirmation in the UI.

Keep the tools narrow, typed, independently testable, and free of external integrations in the MVP.

### Persistence

- Use an in-memory or file-backed adapter during the first local milestone.
- Add Cosmos DB as the production adapter for durable conversation and thread metadata.
- Keep provider-specific persistence behind a small repository interface.
- Do not store secrets, raw credentials, or unnecessary personal data.

## Out of scope for the MVP

- Multi-agent orchestration; that belongs to App 07.
- RAG, embeddings, or a vector database.
- Authentication and multi-user workspaces.
- Third-party integrations such as Slack, Gmail, or calendars.
- Arbitrary code execution.
- A large dashboard or administration area.
- More than the initial three MCP tools.

## Proposed structure

```text
apps/06-agent-workspace/
├── README.md
├── frontend/                 # Next.js UI and application API
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── tests/
├── mcp-server/               # Node.js MCP server and tool tests
│   ├── src/
│   │   ├── tools/
│   │   └── index.ts
│   └── tests/
├── sample-data/              # Safe deterministic tasks and notes
├── Dockerfile
└── docker-compose.yml
```

The final structure should remain small. Create extra layers only when the implementation needs them.

## Implementation plan

### Phase 1 — Scaffold and offline vertical slice

- Create the Next.js app and Node.js MCP server.
- Add shared formatting, environment examples, health checks, and sample workspace data.
- Implement an offline fake-agent adapter so the complete request flow works without Azure credentials.
- Add the App 06 commands to the monorepo development orchestrator using ports `3006` and `8006`.

**Done when:** one command starts the app, the UI sends a message, and a deterministic local answer is streamed back.

### Phase 2 — MCP tools

- Implement the three typed MCP tools.
- Validate tool inputs and return small structured results.
- Add unit tests for success, empty results, invalid input, and write confirmation.
- Connect the offline adapter to the real local MCP server.

**Done when:** the local assistant can list tasks, search notes, and create a confirmed task through MCP.

### Phase 3 — Foundry agent integration

- Create the Foundry agent configuration and a small server-side client adapter.
- Connect the Foundry agent to the MCP server.
- Map Foundry events and errors to the application's internal response model.
- Retain the offline adapter for development and tests.

**Done when:** changing one environment setting switches between offline and Foundry modes without changing UI code.

### Phase 4 — Streaming chat experience

- Stream text deltas and tool-call lifecycle events to the browser.
- Show tool activity without exposing hidden reasoning or raw provider payloads.
- Add cancel, retry, and accessible status announcements.
- Handle timeouts, interrupted streams, and recoverable errors.

**Done when:** responses render progressively and failures leave the conversation in a usable state.

### Phase 5 — Durable conversations

- Define a small conversation repository interface.
- Persist conversation metadata and the Foundry thread identifier in Cosmos DB.
- Restore a previous conversation after an application restart.
- Add retention and deletion operations for stored conversations.
- Test the repository with an in-memory implementation and mock the Cosmos client in CI.

**Done when:** a stored conversation can be reopened and continued using the same remote thread.

### Phase 6 — Safety and production baseline

- Add request-size limits, rate limiting, concurrency limits, and a generation kill switch.
- Require confirmation before `create_task`.
- Sanitize logs and error responses; never log prompt contents by default.
- Add CSP/CORS settings for the final frontend and API domains.
- Document environment variables and the privacy model.

**Done when:** the app follows the same security and cost-control baseline as Apps 01–05.

### Phase 7 — Tests, documentation, and deployment

- Add focused unit tests for tools, adapters, persistence, and event mapping.
- Add one end-to-end happy-path test in offline mode.
- Create the App 06 case study and architecture notes.
- Register App 06 in the root catalog and Portfolio only after the app is usable.
- Add Docker configuration for deployment through Coolify on the Hetzner server.
- Verify health checks and streaming through the production reverse proxy.

**Done when:** lint, tests, build, Docker health checks, and the offline end-to-end flow pass.

## Environment variables to introduce gradually

```dotenv
AGENT_PROVIDER=offline

AZURE_AI_PROJECT_ENDPOINT=
AZURE_AI_AGENT_ID=
AZURE_AI_CREDENTIAL_MODE=default

COSMOS_ENDPOINT=
COSMOS_DATABASE_NAME=
COSMOS_CONTAINER_NAME=

MCP_SERVER_URL=http://localhost:8006
GENERATION_ENABLED=true
```

Exact Azure SDK variable names should be confirmed against the selected SDK version during implementation. Real credentials must never be committed.

## Suggested commit sequence

1. `docs: plan app 06 agent workspace`
2. `feat: scaffold app 06 services`
3. `feat: add workspace MCP tools`
4. `feat: connect Foundry agent adapter`
5. `feat: stream agent responses`
6. `feat: persist agent conversations`
7. `test: cover app 06 core flows`
8. `docs: add app 06 deployment and case study`

Each commit should remain runnable and avoid unrelated changes.

## Definition of done

- The Next.js chat works on desktop and mobile.
- At least three local MCP tools are available.
- Foundry Agent Service can call the MCP tools.
- Responses and tool activity stream to the UI.
- Conversation metadata and thread IDs persist in Cosmos DB.
- Offline mode supports development and CI without paid services.
- Write actions require explicit confirmation.
- Lint, unit tests, production build, and the offline end-to-end test pass.
- Docker deployment works through Coolify.
- README, environment example, case study, catalog, and Portfolio entries are updated.
