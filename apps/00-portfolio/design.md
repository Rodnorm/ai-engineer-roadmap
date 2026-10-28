# Design System & Guidelines — App 00: Portfolio & AI Engineering Catalog

> **Direção Estética:** Swiss Minimalist / Modern Architecture (Estilo Vercel, Linear, Acre Studio).
> **Filosofia:** Vitrine executiva de engenharia sênior. Tipografia editorial de alto contraste, assimetria intencional, grid modular preciso de 1px, sem firulas de IA clichê (sem gradientes roxos/azuis ou cartões genéricos).

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Excesso de "Glow" e Gradientes Template:** O visual anterior usava sombras e gradientes azuis genéricos de template de portfólio. Substituir por contraste tipográfico puro, superfícies neutras de titânio escuro e linhas de divisão milimétricas de 1px.
2. **Scorecards e Métricas:** Transformar tabelas e cards soltos em uma matriz densa de métricas (*AI Engineering Matrix*), com badges monospaçadas discretas para SLAs, latências e modelos de fundação.
3. **Catálogo de Projetos:** Em vez de cards flutuantes com cantos arredondados infantis, usar um índice técnico de projetos com linhas tabulares expansíveis (status de deploy, arquitetura e tags de infraestrutura).
4. **Hierarquia Editorial:** Cabeçalhos limpos com números de índice (`00 // EXECUTIVE OVERVIEW`), citações técnicas e tipografia `Geist Sans` com números em `Geist Mono`.

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #08080A;          /* Preto asfalto editorial */
--bg-panel: #101014;         /* Superfície do container */
--bg-surface: #18181F;       /* Hover de linha / seletor */
--bg-subtle: #202028;

/* Bordas & Divisores */
--border-base: #24242E;      /* Linha precisa de 1px */
--border-focus: #3E3E4D;

/* Acentos & Status */
--accent-primary: #EDEDED;   /* Branco titânio de alto contraste */
--accent-secondary: #6366F1; /* Cobalto sutil para links ativos */
--status-live: #10B981;      /* Esmeralda para demos ativas */
--status-archived: #71717A;  /* Zinco para projetos locais */

/* Tipografia */
--text-primary: #F4F4F6;
--text-muted: #71717A;
--text-mono: #A1A1AA;
```

### Tipografia & Geometria
* **Display / Títulos:** `Geist Sans`, `Inter` (Font-weight 600 a 700, tracking -0.02em).
* **Métricas / Tags / Índices:** `Geist Mono`, `JetBrains Mono` (Tamanhos 10px a 12px, tracking 0.05em uppercase).
* **Border Radius:** `rounded-xs` (2px) ou `rounded-none`. Zero cantos `rounded-2xl` ou `rounded-3xl`.
* **Sombras:** Zero sombras difusas coloridas. Sombras técnicas duras ou apenas contraste de 1px (`border-base`).

---

## 3. Especificação de Componentes

### A. Header & Navegação ([Header.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/00-portfolio/frontend/components/Header.tsx))
* Logo mono com índice de sistema: `00 // RODRIGO NORMANDO` com subtítulo `AI SYSTEM ARCHITECTURE`.
* Barra de navegação modular em estilo abas de arquitetura: `[ OVERVIEW ]`, `[ CASE STUDIES ]`, `[ SCORECARD ]`, `[ ROADMAP ]`.
* Seletor de idioma minimalista (EN / PT / DE) e ThemeToggle com cantos retos e borda de 1px.

### B. Hero & Selected Work ([SelectedWork.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/00-portfolio/frontend/components/SelectedWork.tsx))
* Lista tabular em vez de cards:
  ```text
  ┌────┬───────────────────────┬───────────────────────────┬──────────────┬────────┐
  │ ID │ APPLICATION           │ CORE ARCHITECTURE         │ STATUS       │ LINK   │
  ├────┼───────────────────────┼───────────────────────────┼──────────────┼────────┤
  │ 04 │ pocketRag             │ SQLite Vector + OpenAI    │ ● DEPLOYED   │ [EXPL] │
  │ 05 │ Agentic Workflow      │ ReAct Loop + HITL         │ ● SIMULATED  │ [EXPL] │
  └────┴───────────────────────┴───────────────────────────┴──────────────┴────────┘
  ```
* Cada linha destaca com sutil fundo `--bg-surface` no hover (transição 100ms).

### C. AI Safety & Engineering Scorecard ([AiSafetyScorecard.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/00-portfolio/frontend/components/AiSafetyScorecard.tsx))
* Matriz tabular de verificação com tags monocromáticas `[PASS: 100%]`, `[EVAL: STRICT]`.
* Barras de progresso com preenchimento em blocos técnicos sem gradientes coloridos excessivos.

---

## 4. Checklist Técnico de Implementação

- [ ] Atualizar variáveis de cor e tokens de borda em `frontend/app/globals.css`.
- [ ] Refatorar [Header.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/00-portfolio/frontend/components/Header.tsx) com tipografia editorial e bordas nítidas de 1px.
- [ ] Refatorar os views de catálogo ([CatalogPageView.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/00-portfolio/frontend/components/views/CatalogPageView.tsx)) para layout tabular de alta densidade.
- [ ] Eliminar classes `rounded-2xl` e gradientes `from-sky-500 to-indigo-600`.
- [ ] Validar compatibilidade i18n (EN/PT/DE) e rotas estáticas sem quebrar hidratação.
- [ ] Rodar `npm run typecheck`, `npm run lint` e `npm run build`.
