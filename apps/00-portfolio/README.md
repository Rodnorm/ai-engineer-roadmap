# App 00 — AI Engineer Portfolio & Global Catalog

App 00 serves as the central showcase and global catalog for the `ai-engineer-roadmap` monorepo.

---

## 🏛️ Architectural Principles

1. **Isolation:** App 00 displays and organizes project metadata, but does NOT execute other apps' backends or hold their Azure credentials.
2. **Static & Fast:** Pure Next.js static generation reading directly from `catalog/apps.json` and `apps/00-portfolio/frontend/content/`.
3. **No Iframes:** Links direct users to external public demo deployments (`liveUrl`).

---

## 🌓 Light & Dark Themes

App 00 supports accessible light and dark themes using semantic design tokens:

- **Initial Load:** Respects the user's operating system preference (`prefers-color-scheme: dark`) on first visit.
- **Zero Flash (Anti-FOUC):** An inline script in `<head>` applies the `.dark` class before the first paint.
- **Persistence:** Manual selections are persisted in `localStorage` under `portfolio_theme`.
- **Accessible Switcher:** Dedicated `ThemeToggle` in the header with `Sun` and `Moon` icons, `role="switch"`, `aria-checked`, and full keyboard navigation.
- **Semantic Color Tokens:** Configured via CSS variables in `globals.css` and mapped to Tailwind (`bg-background`, `bg-surface`, `border-border`, `text-foreground`, `text-text-muted`, `text-text-secondary`, `bg-primary`, `bg-accent`).

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
- Localized case studies are stored in `apps/00-portfolio/frontend/content/<slug>.<locale>.md` (e.g., `smart-inspector.pt.md`).
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

# Run Unit Tests (locale resolution, theme preference & fallback coverage)
npm test

# Build the production Next.js bundle
npm run build
```

## Deployment

App 00 is deployed using Docker Compose on Coolify (`compose.coolify.yml`):

- **Coolify Base Directory:** `/`
- **Docker Compose Location:** `/apps/00-portfolio/compose.coolify.yml`
- **Watch Paths:** `apps/00-portfolio/**` and `catalog/**`
- **Public service:** `web:3000`

The image build incorporates the shared catalog and case studies. Production deployments are triggered from `main`.
