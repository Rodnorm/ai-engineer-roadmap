# App 00 — AI Engineer Portfolio & Global Catalog

App 00 serves as the central showcase and global catalog for the `ai-engineer-roadmap` monorepo.

---

## 🏛️ Architectural Principles

1. **Isolation:** App 00 displays and organizes project metadata, but does NOT execute other apps' backends or hold their Azure credentials.
2. **Static & Fast:** Pure Next.js static generation reading directly from `catalog/apps.json` and `apps/00-portfolio/content/`.
3. **No Iframes:** Links direct users to external public demo deployments (`liveUrl`).

---

## 🌐 Internationalization (i18n)

App 00 supports multi-language navigation with static page generation:

| Locale Code | Language | HTML `lang` | Route Prefix | Default |
| :--- | :--- | :--- | :--- | :--- |
| `en` | English | `en` | `/` (root) | ✅ Yes |
| `pt` | Português (Brasil) | `pt-BR` | `/pt` | No |
| `de` | Deutsch | `de` | `/de` | No |

### Routing & Static Pre-rendering
- English is served at the root routes (`/`, `/apps`, `/roadmap`, `/about`, `/apps/[slug]`).
- Localized versions are pre-rendered at `/[locale]` (`/pt`, `/de`, `/pt/apps`, `/de/apps`, etc.) using `generateStaticParams`.
- User language preference is persisted in `localStorage` and a cookie named `portfolio_locale`.
- The HTML `lang` attribute dynamically synchronizes via `<HtmlLangSync />`.

### Case Study Fallback Strategy
- Localized case studies are stored in `apps/00-portfolio/content/<slug>.<locale>.md` (e.g., `smart-inspector.pt.md`).
- If a localized markdown file is absent, the system falls back explicitly to the base English version (`<slug>.md`) and renders an informative fallback notice.

---

## 🚀 Running Locally & Testing

```bash
cd apps/00-portfolio/frontend
npm install
npm run dev
```

### Validation & Test Commands

```bash
# Run ESLint validation
npm run lint

# Run Unit Tests (locale resolution & fallback coverage)
npm test

# Build production bundle with full static export
npm run build
```
