# Design System & Guidelines — App 06: Agent Workspace

> **Direção Estética:** MCP Operating Environment / Neomorphic IDE (Estilo VS Code, Linear Workspace, Warp).
> **Filosofia:** Ambiente de trabalho com suporte nativo ao Model Context Protocol (MCP) e streaming em tempo real via SSE. Layout em painéis modulares de IDE com acentos em Azul Cobalto e Verde de Telemetria, histórico de sessão indexado e barra de registro de ferramentas MCP ativas.

---

## 1. Diagnóstico de UX/UI Atual & O Que Mudar

1. **Aparência de Chat Comum:** O aplicativo parece uma página de chat isolada. Deve adotar a estrutura de uma IDE de trabalho com barra lateral de contexto (*Context Inspector*), área central de streaming e rodapé de protocolo MCP.
2. **Indicador de Ferramentas MCP:** As 4 ferramentas (`list_tasks`, `search_notes`, `create_task`, `update_task`) devem aparecer em uma barra técnica de extensões ativas com status de permissão.
3. **Streaming SSE sem Tremor:** O fluxo de tokens precisa de animação suave com cursor de bloco `▋` e balões sem bordas volumosas.
4. **Controle de Sessão e Kill-Switch:** Destacar o interruptor de emergência (*Kill Switch / Abort Stream*) em estilo botão de parada de máquina.

---

## 2. Tokens de Design (Tailwind / CSS)

### Paleta de Cores
```css
/* Backgrounds */
--bg-root: #090A0F;          /* Chumbo grafite de IDE */
--bg-panel: #0F111A;         /* Painel central de trabalho */
--bg-sidebar: #0B0D14;       /* Barra lateral de tarefas/notas */
--bg-surface: #161825;       /* Sub-camada / hover de mensagem */

/* Bordas */
--border-base: #1E2235;      /* Linha técnica 1px */
--border-active: #4F46E5;    /* Cobalto ativo */

/* Cores de Protocolo MCP */
--mcp-ready: #10B981;        /* Servidor MCP conectado */
--mcp-executing: #F59E0B;    /* Chamada de ferramenta em curso */
--mcp-accent: #6366F1;       /* Cobalto / Indigo */

/* Tipografia */
--text-primary: #F8FAFC;
--text-muted: #64748B;
--text-mono: #94A3B8;
```

### Tipografia & Geometria
* **Editor & MCP Calls:** `JetBrains Mono` ou `Geist Mono` (10px a 12px).
* **Interface & Conversa:** `Geist Sans` ou `Inter` (13px a 14px).
* **Border Radius:** `rounded-none` ou `rounded-xs` (2px).
* **Grid:** 1px de divisor entre sidebar e chat (`border-r border-border-base`).

---

## 3. Especificação de Componentes

### A. Layout do Workspace ([ChatWorkspace.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/06-agent-workspace/frontend/components/ChatWorkspace.tsx))
* **Sidebar Esquerda (Tasks & Notes):** Lista compacta de tarefas e notas indexadas com badges de status `[TODO]`, `[DONE]`.
* **Painel Central (Agent Chat & SSE Stream):**
  * Transcrição técnica de comandos e respostas do agente.
  * Chamadas de ferramentas MCP exibidas como blocos inline de execução:
    `[MCP:EXEC] search_notes(query="deployment_v2") -> 3 matches`
* **Rodapé MCP (Protocol Bar):**
  * `● MCP_ENDPOINT: STREAMABLE_HTTP (2026_SPEC) | PERSISTENCE: IN-MEMORY / COSMOS | STATUS: ONLINE`

### B. Header de Sessão & Controles
* Título em mono: `[06] AGENT_WORKSPACE :: FOUNDRY_ADAPTER`.
* Botão de parada de emergência: `[ ■ KILL GENERATION ]` em vermelho discreto com hover vívido.

---

## 4. Checklist Técnico de Implementação

- [ ] Definir tokens de IDE (`--bg-root: #090A0F`, `--mcp-accent: #6366F1`) em `globals.css`.
- [ ] Refatorar a visualização em abas/colunas em [ChatWorkspace.tsx](file:///c:/Users/rnorm/Documents/Projetos/ai-engineer-roadmap/apps/06-agent-workspace/frontend/components/ChatWorkspace.tsx).
- [ ] Adicionar indicadores de protocolo MCP em tempo real.
- [ ] Preservar toda a lógica de streaming SSE e cancelamento por AbortController.
- [ ] Validar com `npm run typecheck` e `npm run build`.
