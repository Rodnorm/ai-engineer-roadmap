# Design System & Guidelines — App 02: Support Bot

> **Direção Estética:** Enterprise Tactical Support / Incident & NLP Desk (Estilo Datadog Helpdesk, Linear Triage).
> **Filosofia:** Assistente técnico de suporte corporativo grounded em FAQ e auditoria de NLP em tempo real (detecção de idioma, sentimento, entidades e PII masking). Interface sóbria, de alta densidade informativa e rastreabilidade total.

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Chat de Balão Genérico:** Balões arredondados e coloridos parecem mensageiro informal. Devem adotar o formato de transcrição técnica de ticket corporativo (*Support Session Log*).
2. **Cards de NLP Desconexos:** Os dados de sentimento, entidades e PII mascarados precisam aparecer como um painel de telemetria lateral (*NLP Telemetry Drawer*) com métricas numéricas e tags auditáveis.
3. **Indicador de Grounding:** Respostas ancoradas em FAQ devem destacar explicitamente as fontes com tags mono `[FAQ_ID: 104 | SCORE: 0.89]`.
4. **Header & Controles:** Cabeçalho técnico integrado com indicador de status do Azure AI Foundry Agent e Azure AI Language.

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #0A0C10;          /* Ardósia escura / Obsidian */
--bg-panel: #11141B;         /* Painel de ticket / chat */
--bg-surface: #181C26;       /* Sub-camada / hover de mensagem */
--bg-terminal: #07090D;

/* Bordas */
--border-base: #202634;      /* Borda técnica 1px */
--border-active: #323C52;

/* Acentos & Status */
--accent-primary: #06B6D4;   /* Ciano Radar / Electric Teal */
--accent-subtle: rgba(6, 182, 212, 0.1);
--sentiment-pos: #10B981;    /* Verde neutro auditado */
--sentiment-neu: #71717A;    /* Zinco */
--sentiment-neg: #EF4444;    /* Vermelho alerta */
--pii-masked: #F59E0B;       /* Âmbar de proteção de dados */

/* Tipografia */
--text-primary: #F1F5F9;
--text-muted: #64748B;
--text-mono: #94A3B8;
```

### Tipografia & Geometria
* **Logs & NLP Tags:** `JetBrains Mono` ou `Geist Mono` (10px a 12px).
* **Mensagens de Usuário/Agente:** `Geist Sans` ou `Inter` (13px a 14px, lineHeight confortável de 1.5).
* **Border Radius:** `rounded-none` ou `rounded-xs` (2px).
* **Divisores:** 1px contínuo `border-base`.

---

## 3. Especificação de Componentes

### A. Console de Conversação ([ChatArea.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/02-support-bot/frontend/components/ChatArea.tsx) e [Message.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/02-support-bot/frontend/components/Message.tsx))
* Transcrição estruturada estilo ticket:
  * Cabeçalho de mensagem com remetente, timestamp e indicador de idioma: `USER [LOCALE: PT-BR] :: 14:32:01`.
  * Resposta do agente: `AGENT [FOUNDRY_LLM] :: FAQ_GROUNDED [3 SOURCES]`.
* Sem balões curvos; blocos técnicos com borda de 1px e leve distinção de superfície.

### B. Painel de Análise de NLP ([NLPAnalysisCard.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/02-support-bot/frontend/components/NLPAnalysisCard.tsx))
* Widget compacto acoplado à direita ou expansível por mensagem:
  * **Sentimento:** Barra de confiança tricolor (Pos / Neu / Neg) com score percentual.
  * **Key Phrases:** Chips monospaçados: `[KEY: "reembolso"]`, `[KEY: "prazo_faturamento"]`.
  * **PII Detection:** Badge de status de segurança `[PII: 0 DETECTED]` ou `[PII: 2 MASKED]`.

### C. Input de Suporte ([ChatInput.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/02-support-bot/frontend/components/ChatInput.tsx))
* Barra técnica de envio com atalho visual `[ ↵ SUBMIT ]` e contador de caracteres monospaçado.

---

## 4. Checklist Técnico de Implementação

- [ ] Aplicar `--accent-primary: #06B6D4` e `--bg-root: #0A0C10` em `globals.css`.
- [ ] Refatorar os balões de [Message.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/02-support-bot/frontend/components/Message.tsx) para blocos retos com carimbo de log.
- [ ] Atualizar [NLPAnalysisCard.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/02-support-bot/frontend/components/NLPAnalysisCard.tsx) para formato de telemetria tabular.
- [ ] Garantir preservação das integrações de Azure AI Language e SSE streaming.
- [ ] Validar rotas i18n, `npm run typecheck` e `npm run build`.
