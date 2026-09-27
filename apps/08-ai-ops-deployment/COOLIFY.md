# App 08 Deployment with Coolify

Deploy App 08 (**Production AI Deployment & Operations Studio**) as a standalone Next.js 15 application directly from this repository. Coolify's reverse proxy (Traefik) terminates HTTPS and maps to container port `3008`.

## 1. Application Configuration in Coolify

Create a new application in Coolify with:

- **Build Pack:** `Dockerfile`
- **Repository:** `your-org/ai-engineer-roadmap`
- **Branch:** `main` (or feature branch)
- **Base Directory:** `/apps/08-ai-ops-deployment`
- **Dockerfile Location:** `/Dockerfile`
- **Port:** `3008`
- **Health Check Path:** `/api/health`
- **Domains:** `https://ai-ops.<your-domain>`

## 2. Environment Variables

Configure the following variables in the Coolify **Environment Variables** tab:

| Variable | Recommended / Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Execution mode |
| `PORT` | `3008` | Internal HTTP listening port |
| `APP_MODE` | `online` (or `offline`) | Real Azure calls (`online`) or deterministic mocks (`offline`) |
| `AZURE_OPENAI_ENDPOINT` | `https://<resource>.openai.azure.com/` | Azure OpenAI or Foundry Hub endpoint |
| `AZURE_OPENAI_API_KEY` | `your-azure-key` (Mark as Secret) | Azure OpenAI access key |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` | Baseline flagship model deployment name |
| `AZURE_OPENAI_DEPLOYMENT_CANDIDATE` | `gpt-4o-mini` | Canary candidate model deployment name |
| `AZURE_OPENAI_API_VERSION` | `2024-10-21` | API version |
| `DEPLOY_ENABLED` | `true` | Emergency cost kill-switch |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | `30` | IP sliding window rate limit |
| `MAX_CONCURRENCY` | `2` | Global semaphore concurrency ceiling |
| `SESSION_SECRET` | `<32-char-random-string>` (Secret) | HMAC-SHA256 signing secret for session cookies |

> [!TIP]
> To run a zero-cost public demo or test the deploy before provisioning cloud quota, set `APP_MODE=offline`. The application uses the built-in deterministic simulation engine.

## 3. Post-Deployment Verification (Smoke Test)

1. Verify `GET https://ai-ops.<your-domain>/api/health` returns `{"status":"ok","app":"08-ai-ops-deployment"}`.
2. Open the UI, click "Sobre o App" and verify the architecture slide-over drawer opens.
3. Switch theme between Dark and Light mode (persists on reload).
4. Select scenario 01 ("Progressive Canary Rollout") and verify traffic slider adjusts to 90% Blue / 10% Green.
5. Select scenario 03 ("Rollback Automático por Latência") and verify the P95 latency breach triggers atomic rollback to 100% Blue in real time.
6. Test Emergency Stop ("Parada de Emergência") to verify immediate HTTP 503 response.
