# AI Engineer Roadmap

A hands-on monorepo documenting the transition from senior frontend engineering to AI engineering. Apps 00–08 contain working implementations, with cloud integrations, offline demonstrations, and operational limitations described below.

This README describes repository capabilities, not verified deployment uptime or production readiness. The original weekly roadmap is a learning plan; the app READMEs and linked implementation files describe what exists today.

## Application catalog

| App | Implemented capability | Stack | Execution and limits |
| --- | --- | --- | --- |
| [00 — Portfolio](apps/00-portfolio/README.md) | Catalog, case studies, roadmap, safety scorecard, EN/PT/DE UI | Next.js 16, React 19, TypeScript | Reads metadata and Markdown; does not run the other apps |
| [01 — Smart Inspector](apps/01-smart-inspector/README.md) | Image caption, tags, objects, OCR and optional product fields in structured JSON | Next.js 16, FastAPI, Azure OpenAI, Pillow | Requires Azure; product prices/links are model output, not live shopping search |
| [02 — Support Bot](apps/02-support-bot/README.md) | Healthcare-billing FAQ keyword retrieval, NLP analysis, Foundry agent answers | Next.js 16, FastAPI, Azure AI Language/Projects | Requires Azure; no vector search or Azure AI Search integration |
| [03 — Prompt Forge](apps/03-prompt-forge/README.md) | Three structured marketing variations, personas, SSE, safety checks and request metadata | Next.js 16, FastAPI, Azure OpenAI, Content Safety | Requires Azure for generation; Content Safety required in production |
| [04 — Pocket RAG](apps/04-pocket-rag/README.md) | Document ingestion, owner-scoped retrieval, citations, example PDFs and suggested questions | Next.js 15, FastAPI, SQLite, NumPy, Azure OpenAI | Local storage, cloud embeddings/generation; uploads expire after 30 minutes by default |
| [05 — Agentic Workflow](apps/05-agentic-workflow/README.md) | Bounded tool-calling loop, session tokens and human approval | Next.js 15, FastAPI, Azure OpenAI | Offline planner or Azure; alert delivery is simulated |
| [06 — Agent Workspace](apps/06-agent-workspace/README.md) | Streaming conversations, Foundry adapter and four MCP tools | Next.js 15, Node.js MCP, optional Cosmos DB | Offline or Foundry; conversations are owner-scoped, tool workspace is shared |
| [07 — Brief Generator](apps/07-brief-generator/README.md) | Researcher-to-writer handoff, structured dossier, Markdown brief and SSE trace | Next.js 15, Azure OpenAI | Offline fixtures or online generation; no live research or independent fact verification |
| [08 — AI Ops & Deployment Studio](apps/08-ai-ops-deployment/README.md) | Canary/blue-green routing experiments, metrics, circuit breaker, rollback and chaos scenarios | Next.js 15, Azure OpenAI | In-process learning lab; does not deploy infrastructure or control external production traffic |

Package manifests and lockfiles are the version references. An implemented cloud adapter does not establish that its deployment or credentialed evaluation has been validated.

## Architecture and source map

| Apps | Request path | Primary implementation |
| --- | --- | --- |
| 00 | Browser → Next.js pages → catalog and Markdown | [Portfolio](apps/00-portfolio/frontend) |
| 01–03 | Browser → Next.js server proxy → FastAPI → Azure | App `frontend/app/api` and `backend/main.py` |
| 04 | Browser → signed owner cookie → Next.js BFF → FastAPI → SQLite/Azure | [RAG backend](apps/04-pocket-rag/backend/main.py) |
| 05 | Browser → Next.js proxy → FastAPI agent loop → registered tools | [Agent](apps/05-agentic-workflow/backend/agent.py), [tools](apps/05-agentic-workflow/backend/tools.py) |
| 06 | Browser → Next.js routes → offline/Foundry adapter → MCP | [Agent adapters](apps/06-agent-workspace/frontend/lib/agent), [MCP tools](apps/06-agent-workspace/mcp-server/src/tools.ts) |
| 07–08 | Browser → Next.js routes → application services → optional Azure | App `app/api` and `lib` directories; no separate FastAPI service |

Shared resources include [API contracts](contracts), [synthetic evaluations](evals), [standards](docs/standards), [system cards for Apps 01–07](docs/system-cards), the [App 08 system card](apps/08-ai-ops-deployment/ai-system-card.md), and an [application template](templates/ai-app).

## Data, safety and operating limits

Controls differ by app; there is no single guardrail pipeline shared by every service.

- Apps 01, 02, 03 and 05 use SQLite-backed request counters. Counters are shared only by processes using the same database file; separate hosts/volumes do not share a deployment-wide budget. Concurrency limits are process-local.
- App 01 validates/re-encodes uploads and removes image metadata before calling Azure. App 02 masks the PII entity values returned in NLP results, but still sends the original question to Azure Language and the agent.
- App 03 requires Content Safety in production; its development fallback is a limited local heuristic. The visible request log is browser state, not a backend history API.
- App 04 stores originals, chunks and embeddings locally with configurable expiry. Document chunks and questions leave the server for Azure embeddings; excerpts also leave for suggestions and generated answers. This is not an offline-only RAG system.
- App 05 keeps token-protected sessions in memory (default 30-minute TTL). App 06 stores conversations in memory or Cosmos DB; its MCP tasks/notes share a workspace store and are not isolated per conversation owner.
- Apps 07 and 08 keep owner-scoped results in process memory. App 08 telemetry includes prompts and responses; it is not content-free operational telemetry. These histories reset on restart and are not shared across replicas.
- Generation flags, quotas, validation and approval gates are learning-project controls, not guarantees of security, factual accuracy, regulatory compliance or a hard cloud-spending cap. Use synthetic data for demos.

## Local development

Use Node.js 20.9+ (or a newer version supported by the app dependencies) and Python 3.12 for the FastAPI apps, matching the Python CI environment.

Install dependencies and copy the relevant `.env.example` files before running the orchestrator. It starts processes; it does not provision Azure, install packages, or provision Python virtual environments. Install root npm workspaces with `npm ci`, install App 06's MCP dependencies separately, and follow each Python app's setup instructions. The orchestrator resolves each backend’s `.venv` executable when present; otherwise `uvicorn` must be available on PATH.

| App | Root command | Frontend port | Other service port |
| --- | --- | --- | --- |
| 00 | `npm run dev:00` | 3000 | — |
| 01 | `npm run dev:01` | 3001 | FastAPI 8001 |
| 02 | `npm run dev:02` | 3002 | FastAPI 8002 |
| 03 | `npm run dev:03` | 3003 | FastAPI 8003 |
| 04 | `npm run dev:04` | 3000 (current package script; registry declares 3004) | FastAPI 8004 |
| 05 | `npm run dev:05` | 3005 | FastAPI 8005 |
| 06 | `npm run dev:06` | 3006 | MCP 8006 |
| 07 | `npm run dev:07` | 3007 | Next.js API routes |
| 08 | `npm run dev:08` | 3008 | Next.js API routes |

`npm run dev` starts all registered apps; `Ctrl+C` stops child processes. The current configuration needs the following manual adjustments before running everything together:

- App 02: set server-side `BACKEND_URL=http://localhost:8002` in `frontend/.env.local`. The registry's `BACKEND_INTERNAL_URL` is not consumed by the current proxy.
- App 04: set server-side `BACKEND_URL=http://localhost:8004`, plus the API key/session secret from its README. The registry's `NEXT_PUBLIC_API_BASE_URL` is not consumed by the BFF. Its package script fixes port 3000, so it conflicts with App 00: run it separately with `npx next dev --port 3004` instead of starting it through `--all`.
- The orchestrator forces App 06 to `AGENT_PROVIDER=offline` and Apps 07/08 to `APP_MODE=offline`. For online mode, run their services directly with the documented environment.

The actual startup definitions are [scripts/dev/apps.json](scripts/dev/apps.json), [scripts/dev/run.mjs](scripts/dev/run.mjs) and each app's `package.json`. Register future apps in those files and the root `package.json`.

The portfolio accepts `NEXT_PUBLIC_APP_01_URL` through `NEXT_PUBLIC_APP_08_URL` overrides; otherwise it uses the catalog's URLs. A catalog URL/status is metadata, not a health check.

## Validation

Run checks from the app directories as documented in their READMEs. Root commands include:

```bash
npm test             # development orchestrator tests
npm run test:evals   # synthetic cross-app evaluation runner
```

[CI](.github/workflows/ci.yml) has path-aware app checks through App 07, Python quality/contract checks and an App 06 MCP job. App 08 has local test/typecheck/build scripts but is not included in the app-specific CI matrix. Synthetic/offline tests do not replace credentialed cloud integration tests or measured RAG evaluation results.

## Deployment

Apps 00–05 provide `compose.coolify.yml`; App 06 provides `docker-compose.yml` and its own [deployment guide](apps/06-agent-workspace/COOLIFY.md). Apps [07](apps/07-brief-generator/COOLIFY.md) and [08](apps/08-ai-ops-deployment/COOLIFY.md) provide single-service Dockerfiles and guides. See the shared [Coolify Compose guide](docs/deployment/COOLIFY_COMPOSE.md) for Apps 00–05.

Configure credentials, persistent volumes where applicable, proxy trust and Watch Paths on the actual host. Repository configuration alone does not prove deployment status.

## License

[MIT](LICENSE).
