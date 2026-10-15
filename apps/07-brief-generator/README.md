# App 07 — Multi-Agent Brief Generator

A Next.js 15 / React 19 learning app demonstrating a sequential researcher-to-writer
pipeline. It produces a structured `ResearchDossier`, an executive Markdown brief,
and an SSE trace of the handoff. The interface includes EN/PT/DE translations,
quick scenarios, and owner-scoped brief history.

## What the two modes actually do

| Mode | Researcher | Writer |
| --- | --- | --- |
| `APP_MODE=offline` (default) | Calls local fixture functions for facts, claim verification and metrics | Builds a brief from templates and the dossier |
| `APP_MODE=online` with Azure credentials | Makes a JSON-mode Azure OpenAI request and validates the dossier with Zod | Makes a second JSON-mode request using the dossier; has no external tools |

The online researcher does not register or execute model-selected search tools.
There is no web search, document ingestion, retrieval service or independent source
verification. The local `verify_claim` function always returns `verified: true` and
confidence `0.92`; fixture metrics and source labels are demonstration data.
Online source labels and claims are model-generated, not checked citations.
Treat “verified” fields and executive approval wording in outputs as demo labels,
not proof of factual validation or human approval.

Both stages can fall back to the offline implementation after provider errors.
`MAX_RESEARCH_ROUNDS` bounds the offline stages and the online prompt's requested
scope; it does not run a multi-round online tool-calling loop. SSE streams trace
steps and the final result, rather than provider token deltas. Token totals are
character-based estimates, not metered provider usage.

Implementation references: [researcher](lib/agents/researcher.ts),
[writer](lib/agents/writer.ts), [fixture tools](lib/tools/research-tools.ts),
[pipeline](lib/orchestrator/pipeline.ts).

## Local setup

Run inside `apps/07-brief-generator`:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3007. Leave `APP_MODE=offline` for a zero-provider-call demo.
For online generation, set `APP_MODE=online` and the `AZURE_OPENAI_*` variables
from `.env.example`. Use a private random `CONVERSATION_SESSION_SECRET` of at least
32 characters instead of the example value.

From the repository root, `npm run dev:07` starts this app with offline mode forced
by `scripts/dev/apps.json`. Use the app-local command to test online configuration.

## API, state and limits

- `POST /api/generate-brief`: run the pipeline and stream SSE events.
- `GET /api/briefs`: list the current owner's briefs.
- `DELETE /api/briefs?id=<id>`: delete one brief; omit `id` to clear that owner's history.
- `GET /api/session` and `GET /api/health`: session and service information.

An HMAC-signed `app07-owner` cookie identifies an anonymous browser owner. The
in-memory repository keeps up to 20 briefs per owner, including input, dossier,
output and trace. It is not durable, has no automatic retention TTL, and is not
shared across server replicas. Clearing the cookie does not delete server history.

Generation has an environment kill switch, process-local rate limiting (10 requests
per minute by default) and a concurrency semaphore. These are not a distributed
quota or account-based access control. In online mode, input and dossier content
are sent to Azure OpenAI.

## Validation and deployment

Run from this app directory:

```bash
npm run typecheck
npm test
npm run build
```

`npm run lint` currently invokes TypeScript checking, not ESLint. Tests cover the
pipeline, sessions and i18n; they do not prove the factual accuracy of generated
briefs. See [COOLIFY.md](COOLIFY.md) for the single Next.js Docker service.
