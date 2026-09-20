# Privacy data-flow audit

Last reviewed: 2026-09-20

## Scope

This audit covers Apps 00 through 06 in the AI Engineer Roadmap. Analytics, advertising, tracking pixels, fingerprinting, and marketing cookies are deliberately out of scope and must not be added as part of this work.

The objective is data minimisation: collect or retain only what is required to provide each demo, keep operational logs free of submitted content, and make deletion/expiry behaviour explicit.

## Data flow by application

| App | Data received | External processing | Application storage | Current retention |
| --- | --- | --- | --- | --- |
| 00 Portfolio | Navigation, locale/theme preference | None | Browser preference only | Until the visitor clears it |
| 01 Smart Inspector | Uploaded image and language | Sanitised image is sent to Azure AI; EXIF metadata is removed first | Image is not persisted; pseudonymous rate-limit key only | Rate-limit events: 24 hours |
| 02 Support Bot | Message text | Azure AI Language and Azure agent/OpenAI services | Chat is not persisted by the app; pseudonymous rate-limit key only | Rate-limit events: 24 hours |
| 03 Prompt Forge | Brief, audience, and generation options | Azure Content Safety and Azure OpenAI | Current results remain in browser memory; pseudonymous rate-limit key only | Rate-limit events: 24 hours |
| 04 Pocket RAG | Uploaded document, extracted text, query | Azure OpenAI embeddings and answer generation | Original, chunks, and embeddings are stored locally for the active document | 30 minutes, with automatic cleanup and explicit deletion |
| 05 Agentic Workflow | Prompt and workflow messages | Azure OpenAI when configured | Session state is held in process memory; pseudonymous rate-limit key only | Session: 30 minutes of inactivity; rate-limit events: 24 hours |
| 06 Agent Workspace | Owner cookie, conversations, messages, workspace changes | Azure AI Foundry when configured | Memory or Cosmos DB; workspace data can also be persisted locally | Owner cookie: 30 days; conversations/workspace: until user deletion |

## Infrastructure and logs

- Hetzner hosts the VPS; Coolify and Traefik operate the deployments and routing.
- Application logs are intended to contain request IDs, status, duration, sizes/counts, and error categories—not prompts, messages, document contents, images, or extracted text.
- Persistent rate limiting in Apps 01, 02, 03, and 05 must store only a keyed pseudonymous value derived from the client address. Raw client addresses must never be written to the SQLite rate-limit database.
- Reverse-proxy and container-log retention is an infrastructure setting and must be verified in Coolify/Traefik before production deployment.
- Azure is a data recipient only when a visitor invokes a feature that requires an Azure AI service.

## Browser storage

- App 00 may store locale/theme preferences.
- App 06 uses an essential signed owner cookie to associate the browser with its workspace.
- Prompt Forge must not create a persistent visitor identifier.
- No analytics identifiers, advertising identifiers, tracking pixels, or cross-site profiles are used.

## Retention decisions

1. Rate-limit entries expire after 24 hours and use keyed pseudonymisation.
2. Pocket RAG documents expire after 30 minutes.
3. Agentic Workflow sessions expire after 30 minutes of inactivity.
4. App 06 conversations and workspace changes currently remain until deletion. This is disclosed explicitly; automatic expiry should be a separate change because it affects the expected product behaviour and Cosmos DB configuration.
5. Operational container/proxy logs should be rotated and retained only as long as needed for incident diagnosis. See `docs/privacy/production-retention.md`.

## Deployment blockers

The central Impressum and Datenschutzerklärung intentionally contain visible placeholders for the operator's postal address and contact email. They must be replaced before the PR is merged or deployed.

This document is an engineering inventory, not legal advice.
