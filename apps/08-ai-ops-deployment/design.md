# Design System & Guidelines — App 08: AI-Ops Deployment & Resilience Studio

> **Direção Estética:** Site Reliability Engineering (SRE) Radar / Datacenter NOC (Estilo Cloudflare Radar, Datadog APM, Grafana).
> **Filosofia:** Laboratório de resiliência e roteamento de inferência de IA. Painel de controle de tráfego (Canary, Blue/Green, Shadow Mode), disjuntores de falha (*Circuit Breakers*) e simulação de cenários de caos em tempo real. Interface de alta densidade métrica com acentos em Ciano Radar, Verde Nominal e Vermelho Degradação.

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Controles de Roteamento Genéricos:** Os seletores de Canary (pesos 90/10) e Blue/Green parecem formulários comuns. Devem se transformar em comutadores de tráfego de rede (*Traffic Shifters*) com feedback percentual instantâneo.
2. **Circuit Breaker Pouco Chamativo:** O estado do disjuntor (`CLOSED` / `HALF_OPEN` / `OPEN`) precisa de um display de alarme nítido com luzes de status técnicas e tempo de reset exposto.
3. **Simulador de Caos:** Os botões de injeção de latência e falhas na inferência devem parecer gatilhos de simulação de crise (*Chaos Injection Switches*).
4. **Telemetria de Inferência:** Exibir a comparação lado a lado de modelos (Primary vs Shadow Target) com gráficos de barra e tabela de latência P50/P99.

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #08080B;          /* Preto de centro de operações (NOC) */
--bg-panel: #0E1015;         /* Superfície do dashboard */
--bg-surface: #141720;       /* Módulos de tráfego / métricas */
--bg-terminal: #07080A;

/* Bordas */
--border-base: #1C202C;      /* Linha técnica 1px */
--border-active: #00F2FE;    /* Ciano Radar ativo */

/* Cores de Telemetria SRE */
--sre-cyan: #00F2FE;         /* Tráfego nominal / Radar */
--sre-green: #10B981;        /* Circuit Breaker CLOSED (Operacional) */
--sre-amber: #F59E0B;        /* HALF_OPEN / Degradação / Shadow */
--sre-red: #EF4444;          /* OPEN (Bloqueado) / Falha / Timeout */

/* Tipografia */
--text-primary: #EDEDED;
--text-muted: #64748B;
--text-mono: #94A3B8;
```

### Tipografia & Geometria
* **Métricas / SRE Logs:** `JetBrains Mono` ou `Geist Mono` (10px a 12px, tabular numbers).
* **Interface:** `Geist Sans` ou `Inter` (13px a 14px).
* **Border Radius:** `rounded-none` ou `rounded-xs` (2px).
* **Grid:** Divisores de 1px contínuos entre os painéis de tráfego e simulação.

---

## 3. Especificação de Componentes

### A. Painel de Roteamento de Inferência (`components/controls/` e `components/dashboard/`)
* Matriz de distribuição de tráfego:
  ```text
  ┌────────────────────────────────────────────────────────┐
  │ [ROUTING_POLICY: CANARY]                               │
  │ PRIMARY TARGET: model-gpt-4o-mini   [90% █████████░]   │
  │ CANARY CANDIDATE: model-gpt-4o-eval [10% █░░░░░░░░░]   │
  │ SHADOW MIRRORING: ENABLED (SEQUENTIAL COMPARISON)      │
  │                                                        │
  │ [ PROMOTE CANDIDATE ]     [ REVERT TO PRIMARY ]        │
  └────────────────────────────────────────────────────────┘
  ```

### B. Display do Circuit Breaker (`components/dashboard/`)
* Indicador de estado com alerta visual:
  * `[● STATE: CLOSED] — Normal Operation (Failures: 0/5)`
  * `[▲ STATE: HALF_OPEN] — Testing Canary Probes`
  * `[■ STATE: OPEN] — Trip Activated! Fallback Rule Engaged`

### C. Console de Simulação de Caos (`components/trace/`)
* Gatilhos de teste de resiliência:
  * `[SIMULATE BATCH: 10 REQS]`
  * `[INJECT 500ms LATENCY]`
  * `[SIMULATE 429 RATE LIMIT]`
* Log de telemetria em tempo real com código HTTP, latência de cada requisição e modelo roteado.

---

## 4. Checklist Técnico de Implementação

- [ ] Definir tokens SRE (`--sre-cyan: #00F2FE`, `--sre-green: #10B981`, `--bg-root: #08080B`) em `app/globals.css`.
- [ ] Refatorar os painéis de tráfego em `components/dashboard/` e `components/controls/` para layout tabular técnico.
- [ ] Atualizar o visual do Circuit Breaker com semáforo de status em monospaçado.
- [ ] Preservar toda a lógica de hash de request-ID e execução de shadow mode.
- [ ] Executar `npm run typecheck`, `npm run lint` e `npm run build`.
