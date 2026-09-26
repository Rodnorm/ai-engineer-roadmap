# App 07 Deployment with Coolify

Deploy App 07 (Multi-Agent Brief Generator) as a standalone Next.js 15 application directly from this GitHub repository. Coolify's reverse proxy (Traefik) terminates HTTPS and maps to container port `3007`.

## 1. Application Configuration in Coolify

Create a new application in Coolify with:

- **Build Pack:** `Dockerfile` (or `Nixpacks`)
- **Repository:** `seu-usuario/ai-engineer-roadmap`
- **Branch:** `main` (ou `feat/07-multi-agent-brief-generator`)
- **Base Directory:** `/apps/07-brief-generator`
- **Dockerfile Location:** `/Dockerfile`
- **Port:** `3007`
- **Health Check Path:** `/api/health`
- **Domains:** `https://brief-generator.<your-domain>`

## 2. Environment Variables

Configure the following variables in the Coolify **Environment Variables** tab:

| Variable | Recommended / Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Execution mode |
| `PORT` | `3007` | Internal HTTP listening port |
| `APP_MODE` | `online` (or `offline`) | Real Azure calls (`online`) or deterministic mocks (`offline`) |
| `AZURE_OPENAI_ENDPOINT` | `https://<resource>.openai.azure.com/` | Azure OpenAI or Foundry Hub endpoint |
| `AZURE_OPENAI_API_KEY` | `your-azure-key` (Mark as Secret) | Azure OpenAI access key |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` | Model deployment name |
| `AZURE_OPENAI_API_VERSION` | `2024-10-21` | API version |
| `GENERATION_ENABLED` | `true` | Emergency cost kill-switch |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | `10` | IP sliding window rate limit |
| `MAX_RESEARCH_ROUNDS` | `3` | Max research rounds for Researcher Agent |
| `CONVERSATION_SESSION_SECRET` | `<32-char-random-string>` (Secret) | HMAC-SHA256 signing secret for session cookies |

> [!TIP]
> To run a zero-cost public demo or test the deploy before provisioning cloud quota, set `APP_MODE=offline`. The application uses the built-in deterministic multi-agent mock engine.

## 3. Post-Deployment Verification (Smoke Test)

1. Verify `GET https://brief-generator.<your-domain>/api/health` returns `{"status":"ok","app":"07-brief-generator"}`.
2. Open the UI, click "Sobre o App" and verify the architecture slide-over drawer opens.
3. Switch theme between Dark and Light mode (persists on reload).
4. Select scenario "Monólito Modular vs Microsserviços" and click "Gerar Briefing Executivo".
5. Verify the real-time Handoff Trace progresses: `Researcher -> Handoff -> Writer`.
6. Test "Copiar Markdown" and toggle to "Dados do Researcher" to view the raw dossier.
