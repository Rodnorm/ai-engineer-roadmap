# Design System & Guidelines — App 05: Agentic Workflow

> **Direção Estética:** SCADA Industrial Automation / Mission Control (Estilo NASA Mission Control, Bloomberg Terminal, Grafana APM).
> **Filosofia:** Orquestração de agentes autônomos com ciclo ReAct (`Thought -> Action -> Observation -> Final Answer`) e intervenção humana obrigatória (Human-in-the-Loop). Interface de automação crítica com acentos em Laranja Industrial e Verde Operacional, timeline de passos com conectores de 1px e chave de segurança para autorizações.

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Timeline Sem Hierarquia de Conexão:** Os passos de raciocínio do agente parecem uma lista comum de cards soltos. Devem formar uma árvore visual contínua de orquestração com linhas de 1px conectando `THOUGHT -> ACTION -> OBSERVATION`.
2. **Card de Aprovação HITL Sem Peso:** O cartão de aprovação do usuário (`waiting_approval`) deve parecer um disjuntor de segurança operacional (*Air-Gap Authorization Switch*), com destaque visual imediato em âmbar/laranja e comandos claros `[ AUTHORIZE ]` / `[ REJECT ]`.
3. **Métricas de Loop ReAct:** Adicionar um contador de iterações em formato de odômetro monospaçado (`ITERATION 2/4 | RUN_ID: #8942`).
4. **Header Técnico:** Integrar o status de execução do loop em uma barra de estado contínua.

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #0A0B0E;          /* Preto de automação industrial */
--bg-panel: #101217;         /* Painel de controle */
--bg-surface: #171922;       /* Superfície do nó de execução */
--bg-hitl: #1C160C;          /* Fundo de estado de aprovação */

/* Bordas & Conectores */
--border-base: #202430;      /* Linha técnica 1px */
--border-active: #F97316;    /* Laranja ativo */
--border-hitl: #F59E0B;      /* Âmbar de autorização */

/* Cores de Sinal SCADA */
--scada-idle: #71717A;       /* Pronto */
--scada-running: #10B981;    /* Verde operacional */
--scada-hitl: #F59E0B;       /* Âmbar aguardando humano */
--scada-error: #EF4444;      /* Falha / abortado */
--scada-accent: #F97316;     /* Laranja Industrial */

/* Tipografia */
--text-primary: #EDEDED;
--text-muted: #71717A;
--text-mono: #A1A1AA;
```

### Tipografia & Geometria
* **Passos & Ferramentas:** `JetBrains Mono` ou `Geist Mono` (10px a 12px, tabular numbers).
* **Raciocínio (Thought):** `Geist Sans` ou `Inter` (13px, alta densidade).
* **Border Radius:** `rounded-none` ou `rounded-xs` (2px).
* **Conectores de Pipeline:** Linhas verticais e horizontais rígidas de 1px (`w-px bg-border-base`).

---

## 3. Especificação de Componentes

### A. Timeline ReAct ([AgentTimeline.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/05-agentic-workflow/frontend/components/AgentTimeline.tsx))
* Nós numerados com prefixos de ciclo:
  * `[T-01] THOUGHT:` — Raciocínio em andamento.
  * `[A-01] TOOL_INVOCATION: knowledge_search(query=...)` — Chamada determinística de ferramenta.
  * `[O-01] OBSERVATION:` — Dados retornados do ambiente.
  * `[F-01] FINAL_ANSWER:` — Síntese final entregue ao usuário.
* Conexão visual vertical entre os nós por linha de 1px contínua.

### B. Módulo de Autorização Humana ([ApprovalCard.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/05-agentic-workflow/frontend/components/ApprovalCard.tsx))
* Bloco de destaque com borda dupla técnica em âmbar (`border-2 border-amber-500/80`):
  ```text
  ┌────────────────────────────────────────────────────────┐
  │ [!] HUMAN-IN-THE-LOOP AUTHORIZATION REQUIRED           │
  │ ACTION: send_alert(recipient="admin@sre.internal")     │
  │ SLA: Infrastructure Incident Alert                     │
  │                                                        │
  │ [ ✓ AUTHORIZE EXECUTION ]   [ ✗ REJECT & HALT ]        │
  └────────────────────────────────────────────────────────┘
  ```

### C. Prompts Rápidos & Launcher ([QuickPrompts.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/05-agentic-workflow/frontend/components/QuickPrompts.tsx))
* Gatilhos de cenário em estilo painel de acionamento:
  * `[SCENARIO 1] SLA Failure Check`
  * `[SCENARIO 2] Mathematical Formula Audit`
  * `[SCENARIO 3] Critical Security Alert (Triggers HITL)`

---

## 4. Checklist Técnico de Implementação

- [ ] Definir tokens SCADA (`--scada-accent: #F97316` e `--scada-running: #10B981`) em `globals.css`.
- [ ] Refatorar os conectores de [AgentTimeline.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/05-agentic-workflow/frontend/components/AgentTimeline.tsx) com linhas rígidas de 1px.
- [ ] Atualizar [ApprovalCard.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/05-agentic-workflow/frontend/components/ApprovalCard.tsx) com visual de disjuntor de segurança.
- [ ] Preservar 100% da máquina de estados (`waiting_approval`, `running`, `completed`).
- [ ] Executar `npm run typecheck` e `npm run build`.
