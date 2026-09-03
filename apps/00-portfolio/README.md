# App 00 — AI Engineer Portfolio & Global Catalog

App 00 serves as the central showcase and global catalog for the `ai-engineer-roadmap` monorepo.

---

## 🏛️ Architectural Principles

1. **Isolation:** App 00 displays and organizes project metadata, but does NOT execute other apps' backends or hold their Azure credentials.
2. **Static & Fast:** Pure Next.js static generation reading directly from `catalog/apps.json` and `apps/00-portfolio/content/`.
3. **No Iframes:** Links direct users to external public demo deployments (`liveUrl`).

---

## 🚀 Running Locally

```bash
cd apps/00-portfolio/frontend
npm ci
npm run dev
```

---

## Vercel Deployment

Create a dedicated Vercel project for App 00 with these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `apps/00-portfolio/frontend` |
| Framework Preset | Next.js |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Leave empty (Next.js default) |
| Production Branch | `main` |
| Include source files outside Root Directory | Enabled |

The external-source option is required because the portfolio reads:

- `catalog/apps.json`
- `apps/00-portfolio/content/`

The local `frontend/vercel.json` keeps this configuration reproducible and disables automatic deployments for every branch except `main`. Preview branches are validated by GitHub Actions without consuming Vercel deployment quota.

If the Hobby deployment limit has already been reached, wait for the rolling 24-hour quota to reset before redeploying the latest commit from `main`.
