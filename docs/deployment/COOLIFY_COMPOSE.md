# Coolify deployment layout

Each roadmap app is deployed as one Git-based Docker Compose resource inside the
same Coolify project and production environment. Frontend and backend share the
private Compose network; only the `web` service needs a public domain.

## Resource mapping

| App | Compose location | Public service | Internal backend |
| --- | --- | --- | --- |
| 00 | `/apps/00-portfolio/compose.coolify.yml` | `web:3000` | — |
| 01 | `/apps/01-smart-inspector/compose.coolify.yml` | `web:3000` | `backend:8000` |
| 02 | `/apps/02-support-bot/compose.coolify.yml` | `web:3000` | `backend:8000` |
| 03 | `/apps/03-prompt-forge/compose.coolify.yml` | `web:3000` | `backend:8000` |
| 04 | `/apps/04-pocket-rag/compose.coolify.yml` | `web:3000` | `backend:8000` |
| 05 | `/apps/05-agentic-workflow/compose.coolify.yml` | `web:3000` | `backend:8005` |

For every resource, use `/` as the Coolify Base Directory and the path above as
the Docker Compose Location. Configure the domain on `web` only.

## Automatic deployment paths

Set the resource Watch Paths to its own app directory. App 00 also reads the
global catalog during its image build.

```text
# App 00
apps/00-portfolio/**
catalog/**

# App NN
apps/NN-*/**
```

This keeps Git-triggered deployments isolated. A change to App 04 does not
trigger App 03 or App 05. Manually started deployments are not path-filtered.

## Environment variables

Create variables in the corresponding Coolify resource. The Compose definitions
contain safe defaults for ports and request limits, but Azure credentials and API
keys intentionally have no committed values. Do not upload or commit `.env`
files. Browser-visible `NEXT_PUBLIC_*` values are build arguments and must never
contain secrets.

App 04 mounts the named volume `pocket-rag-data` at `/app/data`; keep that volume
when replacing or redeploying the resource.

## Migration order

1. Create the new Compose resource without deleting the existing deployment.
2. Configure variables and the public `web` domain.
3. Deploy and verify the web page, backend health, and one real user flow.
4. Move the domain to the Compose resource.
5. Remove the previous resource only after validation.
