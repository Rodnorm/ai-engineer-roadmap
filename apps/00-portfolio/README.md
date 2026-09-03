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
