# Design System & Guidelines — App 07: Brief Generator

> **Direção Estética:** Executive Dossier / Intelligence Briefing (Estilo Palantir, Financial Times Dark, LexisNexis).
> **Filosofia:** Sistema sequencial multi-agente de pesquisa e redação executiva. O primeiro agente compila e valida um dossiê de fatos e fontes; o segundo redige um briefing executivo. Interface sóbria, elegante e focada em densidade editorial com acentos em Ouro Monástico / Latão Técnico e visual de relatório confidencial desclassificado.

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Pipeline de Agentes Invisível:** O handoff entre o Researcher e o Writer é o cerne do projeto, mas a interface atual trata o processo como um gerador de texto comum. Deve apresentar um painel visual de handoff (*Agent Transmission Pipeline: Researcher -> Dossier -> Writer*).
2. **Exibição do Dossiê:** O `ResearchDossier` (fatos checados, métricas e citações) deve ser inspecionável em formato de dossiê técnico antes da leitura do briefing final.
3. **Tipografia Editorial:** O briefing executivo final em Markdown precisa de tipografia legível, com entrelinhas elegantes e hierarquia limpa de seções (estilo artigo executivo/memorando).
4. **Histórico de Briefings:** Lista lateral técnica com metadados de geração (`DOSSIER_FACTS: 12`, `WORDS: 840`, `TIME: 4.2s`).

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #0C0D10;          /* Preto papel escuro / carvão */
--bg-panel: #121418;         /* Superfície do dossiê */
--bg-surface: #191B22;       /* Hover de item / aba */
--bg-brief: #0E0F13;         /* Papel do relatório final */

/* Bordas */
--border-base: #242833;      /* Linha técnica 1px */
--border-active: #EAB308;    /* Ouro ativo */

/* Cores de Inteligência / Dossiê */
--dossier-accent: #EAB308;   /* Ouro Monástico / Brass */
--dossier-verified: #10B981; /* Fato verificado */
--dossier-pipeline: #6366F1; /* Handoff de agente */

/* Tipografia */
--text-primary: #F4F4F5;
--text-muted: #71717A;
--text-mono: #A1A1AA;
```

### Tipografia & Geometria
* **Briefing Executivo:** `Geist Sans`, `Inter` (14px a 15px, lineHeight 1.6).
* **Dossiê / Fatos / Handoff:** `JetBrains Mono` ou `Geist Mono` (10px a 12px, tabular numbers).
* **Border Radius:** `rounded-none` ou `rounded-xs` (2px).
* **Divisores:** 1px contínuo `border-base`.

---

## 3. Especificação de Componentes

### A. Pipeline de Handoff Multi-Agente (`components/trace/`)
* Barra de telemetria sequencial:
  ```text
  [01: RESEARCHER AGENT] ───► [VERIFIED DOSSIER: 8 FACTS] ───► [02: WRITER AGENT] ───► [EXECUTIVE BRIEF]
  ● STATUS: SYNTHESIZING CLAIM VERIFICATION MATRIX (STREAMING)
  ```

### B. Inspecionador do Dossiê de Pesquisa (`components/brief/`)
* Abas superiores integradas:
  `[ 01: EXECUTIVE BRIEF (MARKDOWN) ]` | `[ 02: RESEARCH DOSSIER (STRUCTURED) ]` | `[ 03: AGENT AUDIT TRACE ]`
* Lista de fatos checados com tags de evidência:
  `[FACT #01: "Latency reduced by 43%"] [VERIFIED: INTERNAL FIXTURE]`

### C. Seletor de Cenários & Idioma (`components/suggestions/` e `components/layout/`)
* Gatilhos rápidos de cenários de inteligência corporativa:
  * `[SCENARIO A] Cloud Infrastructure Migration Brief`
  * `[SCENARIO B] AI Safety Compliance Audit`
  * `[SCENARIO C] Quarterly FinOps Summary`

---

## 4. Checklist Técnico de Implementação

- [ ] Configurar `--dossier-accent: #EAB308` e `--bg-root: #0C0D10` em `app/globals.css`.
- [ ] Refatorar a visualização da esteira multi-agente em `components/trace/`.
- [ ] Implementar abas limpas para alternância entre Briefing executivo e Dossiê de pesquisa.
- [ ] Assegurar integridade das rotas i18n e modos `APP_MODE=offline/online`.
- [ ] Validar com `npm run typecheck`, `npm run lint` e `npm run build`.
