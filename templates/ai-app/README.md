# Standard AI Application Template

This template provides a production-hardened starting point for creating new AI applications (`apps/04-name`, `apps/05-name`) in the `ai-engineer-roadmap` monorepo.

---

## 🚀 Getting Started

1. Copy this directory to `apps/<app-id>-<app-name>`:
   ```bash
   cp -r templates/ai-app apps/04-my-new-app
   ```
2. Configure `.env` in `apps/04-my-new-app/backend/.env` using `.env.example`.
3. Register the new app entry in `catalog/apps.json`.
4. Implement your feature following `SECURITY-CHECKLIST.md` and `docs/standards/app-definition-of-done.md`.
