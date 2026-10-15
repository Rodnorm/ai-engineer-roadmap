# App 00 — Rodrigo Normando · Personal Engineering Portfolio

App 00 presents Rodrigo Normando’s professional experience, engineering skills and personal AI projects. The roadmap catalog remains available as a record of learning projects.

---

## 🏛️ Architectural Principles

1. **Isolation:** App 00 displays and organizes project metadata, but does NOT execute other apps' backends or hold their Azure credentials.
2. **Static & Fast:** Next.js pages read `catalog/apps.json` relative to the frontend working directory and Markdown from `frontend/content/`. The Docker build incorporates the shared root catalog; local development also has a frontend catalog copy. `frontend/lib/catalog.ts` supplies a fallback catalog when no entries load.
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

App 00 includes a Docker Compose configuration for Coolify (`compose.coolify.yml`):

- **Coolify Base Directory:** `/`
- **Docker Compose Location:** `/apps/00-portfolio/compose.coolify.yml`
- **Watch Paths:** `apps/00-portfolio/**` and `catalog/**`
- **Public service:** `web:3000`

The image build incorporates the shared catalog and case studies. Deployment triggers and Watch Paths must be configured in Coolify. Catalog statuses and the safety scorecard are repository metadata, not live availability or security measurements.



## Personal portfolio content

- `/`: personal introduction, one professional case study and two selected personal projects.
- `/experience`: professional history, with the internal AI R&D work shown within the consulting role.
- `/experience/ai-review-platform`: anonymized professional case study; no internal project name, private repository links, colleagues or report attachments are published.
- `/about`: frontend/backend skills, education, languages and LinkedIn contact for CV requests.
- `/apps` and `/roadmap`: personal AI projects with app-specific capabilities and limitations.

English uses root URLs; Portuguese and German use `/pt` and `/de`, including the new experience routes. `frontend/lib/personal-content.ts` holds typed personal content for all three languages. The professional case is based on the user-supplied participation report; historical profile details are user-provided. Revalidate dates and language levels when updating the profile. No downloadable CV is included because a current public PDF has not been added.

The professional case omits internal names and artifacts and distinguishes individual contributions from project-wide test counts. It does not establish production deployment or regulatory certification. No report file is copied into the public assets.

### Local checks for this change

From the repository root, run `npm ci`, then:

```bash
cd apps/00-portfolio/frontend
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run dev
```

Check the home, experience, professional case, about, catalog and roadmap pages in EN/PT/DE; switch languages while on the professional case. Check keyboard focus, light/dark themes and narrow mobile widths. Confirm professional and personal labels, external contact links and the absence of the internal project name. Build/tests were intentionally left for the user to run locally for this change.
