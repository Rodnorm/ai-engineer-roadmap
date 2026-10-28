# Design System & Guidelines — App 03: promptForge

> **Direção Estética:** Modern Creator Studio / Type Foundry (Estilo Raycast Studio, Craft, Linear Content).
> **Filosofia:** Estúdio de redação assistida por IA para criadores técnicos e profissionais de marketing. Interface de alta densidade tipográfica com acentos em Violeta Sintético, controles de parâmetros táteis e visualizador de múltiplos tons de voz lado a lado.

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Parâmetros Genéricos de Formulário:** Os controles de Temperature e Top P se parecem com inputs HTML básicos. Devem virar sliders táteis de precisão com leitura numérica imediata (`TEMP: 0.70`, `TOP_P: 0.95`).
2. **Seleção de Personas:** As 3 personas (SaaS Marketer, Technical Blogger, Skeptical CFO) precisam de cartões táteis com ícones de perfil de voz e chips de tom (`VOICE: EMPATHETIC`, `AUDIENCE: DEV-FIRST`).
3. **Exibição dos Resultados:** A visualização das 3 variações geradas deve permitir alternância imediata em abas de estúdio (*Studio Views: Preview / Raw Markdown / Structured JSON*).
4. **Alerta de Segurança:** O bloqueio pelo Azure Content Safety deve ser apresentado como um filtro editorial de moderação (`[CONTENT_SAFETY: POLICY VIOLATION]`), limpo e informativo.

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #0B0B0F;          /* Grafite profundo de estúdio */
--bg-panel: #121218;         /* Superfície dos blocos */
--bg-surface: #1A1A22;       /* Hover / seleção tátil */
--bg-editor: #08080B;        /* Canvas de escrita */

/* Bordas */
--border-base: #242430;      /* Linha técnica 1px */
--border-active: #4338CA;

/* Acentos & Personas */
--accent-primary: #8B5CF6;   /* Violeta Sintético / Studio Purple */
--accent-subtle: rgba(139, 92, 246, 0.12);
--persona-saas: #38BDF8;     /* Sky */
--persona-blog: #10B981;     /* Emerald */
--persona-cfo: #F59E0B;      /* Amber */

/* Tipografia */
--text-primary: #F8FAFC;
--text-muted: #64748B;
--text-mono: #94A3B8;
```

### Tipografia & Geometria
* **Display / Títulos:** `Geist Sans` ou `Inter` (16px a 20px, font-semibold).
* **Parâmetros & Metadados:** `JetBrains Mono` ou `Geist Mono` (10px a 12px, tabular numbers).
* **Border Radius:** `rounded-xs` (2px) ou `rounded-none`.
* **Editor Canvas:** Tipografia proporcional de alta legibilidade com entrelinha de 1.6.

---

## 3. Especificação de Componentes

### A. Painel de Parâmetros & Brief ([PromptForge.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/03-prompt-forge/frontend/components/PromptForge.tsx))
* Controles compactos com sliders técnicos e valores em tempo real.
* Seletores de Persona em estilo switches com micro-indicador de cor:
  * `[ SaaS Marketer ]` (Acento Ciano)
  * `[ Tech Blogger ]` (Acento Esmeralda)
  * `[ Skeptical CFO ]` (Acento Âmbar)

### B. Canvas de Geração & Streaming ([GenerationResults.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/03-prompt-forge/frontend/components/GenerationResults.tsx))
* Barra de controle superior com abas de renderização:
  `[ PREVIEW ]` | `[ MARKDOWN ]` | `[ JSON EXPORT ]` | `[ COPY ALL ]`
* Cursor de streaming suave durante a geração SSE.
* Título, corpo e palavras-chave de SEO organizados em blocos modulares de 1px.

### C. Log de Requisição & Metadados ([RequestLog.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/03-prompt-forge/frontend/components/RequestLog.tsx))
* Linha de status no rodapé com tokens usados, latência e custo estimado da requisição.

---

## 4. Checklist Técnico de Implementação

- [ ] Configurar `--accent-primary: #8B5CF6` e `--bg-root: #0B0B0F` em `globals.css`.
- [ ] Refatorar os seletores de persona e sliders em [PromptForge.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/03-prompt-forge/frontend/components/PromptForge.tsx).
- [ ] Atualizar [GenerationResults.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/03-prompt-forge/frontend/components/GenerationResults.tsx) com abas limpas e streaming sem tremor de layout.
- [ ] Garantir compatibilidade com respostas de erro e moderação da API do Azure.
- [ ] Validar compilação com `npm run typecheck` e `npm run build`.
