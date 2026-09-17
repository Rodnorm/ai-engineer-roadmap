# Análise Técnica: App 05 & App 06 e Decisão de Recursos no Azure

Este documento detalha o estado atual de implementação, o que resta fazer e a resposta direta sobre a **necessidade ou não de criar novos recursos no Microsoft Azure** para o **App 05 (Agentic Workflow)** e o **App 06 (Agent Workspace)**.

---

## 🎯 Resumo Direto: Devo criar recursos no Azure agora?

| Aplicação | Precisa criar novos recursos no Azure? | Justificativa |
| :--- | :---: | :--- |
| **App 05 (Agentic Workflow)** | **NÃO** ❌ | Usa o mesmo **Azure OpenAI** (`gpt-4o-mini`) já configurado para os Apps 01 a 04. Não requer nenhum recurso adicional. |
| **App 06 (Agent Workspace) - Modo Demonstração / Portfólio** | **NÃO** ❌ | Possui o modo `AGENT_PROVIDER=offline` com Docker Compose nativo. Roda o loop de agente, o MCP Server e o chat 100% offline com custo zero. |
| **App 06 (Agent Workspace) - Modo Nuvem / Foundry** | **SIM** ⚠️ *(Opcional)* | Apenas se você desejar conectar o agente ao serviço corporativo **Azure AI Foundry**, Service Principal no Entra ID e Azure Cosmos DB. |

> [!TIP]
> **Recomendação:** Não crie novos recursos pagos no Azure agora. Suba ambos os apps no Coolify ou localmente com as credenciais que você já tem (App 05 no Azure OpenAI existente; App 06 em modo `offline` ou com MCP local). Isso economiza custos de nuvem e já comprova 100% do valor de engenharia no portfólio.

---

## 1. App 05 — Agentic Workflow

### 1.1 O que já está implementado e funcionando
- **Backend FastAPI (`apps/05-agentic-workflow/backend`):**
  - **ReAct Loop Autônomo (`agent.py`):** Ciclo iterativo `Pensamento -> Ação -> Observação -> Resposta Final` limitado com teto rígido de 4 iterações.
  - **Ferramentas Determinísticas (`tools.py`):**
    - `calculator`: Avaliação matemática segura baseada em AST (sem uso de `eval()` inseguro).
    - `knowledge_search`: Consulta de políticas internas, SLAs e infraestrutura em memória.
    - `send_alert`: Ação de alerta operacional que aciona o fluxo de aprovação.
  - **Human-in-the-Loop (HITL):** Ações sensíveis entram no estado `waiting_approval`. A execução só é retomada com um token de sessão criptográfico válido gerado para o operador humano.
  - **Governança e Defesa:** Rate limiter persistente em SQLite com token bucket por IP e global, semáforo de concorrência (`MAX_CONCURRENT_REQUESTS=2`) e kill-switch (`GENERATION_ENABLED=true/false`).
  - **Fallback Offline:** Simula respostas inteligentes caso a chave do Azure OpenAI não seja fornecida.
  - **Suíte de Testes:** Testes unitários para lógica do agente, IP de cliente, rate limit e validação de token de aprovação.
- **Frontend Next.js (`apps/05-agentic-workflow/frontend`):**
  - Interface interativa mostrando os passos do raciocínio, logs das ferramentas e modal de confirmação/rejeição de ações pelo usuário.
  - Security headers padronizados com Content Security Policy estrito e HSTS de 2 anos.

### 1.2 O que falta fazer no App 05
1. **Adicionar Rastreamento OpenTelemetry no Backend:**
   - Implementar o padrão `telemetry.py` (idêntico ao App 01) para coletar métricas de latência p50/p95, contagem de tokens e expor o endpoint `/api/metrics`.
2. **Avaliação de Persistência de Sessões:**
   - Atualmente, as sessões do agente residem em memória com TTL de 30 minutos (`SESSION_TTL_SECONDS=1800`). Se o container reiniciar, a sessão expira.
   - *Ação:* Manter em memória (conforme documentado no System Card) ou migrar para persistência SQLite durável se for exigido manter o histórico do ReAct entre restarts.
3. **Validação de Deploy no Coolify:**
   - O arquivo `compose.coolify.yml` já existe. Falta apenas configurar as variáveis de ambiente na instância do Coolify apontando para o seu Azure OpenAI existente.

---

## 2. App 06 — Agent Workspace

### 2.1 O que já está implementado e funcionando
- **Frontend & Orquestrador (`apps/06-agent-workspace/frontend`):**
  - Chat streaming com Server-Sent Events (SSE) para visualização de tokens em tempo real.
  - Suporte a arquitetura dual de providers:
    - `AGENT_PROVIDER=offline`: Loop determinístico local com dados sintéticos.
    - `AGENT_PROVIDER=foundry`: Conexão com o Microsoft Azure AI Foundry Agent Service.
  - Suporte a persistência dual:
    - `InMemoryConversationRepository`: Sessões voláteis em memória.
    - `CosmosConversationRepository`: Persistência particionada por `/ownerId`.
  - Gate de aprovação humana para ferramentas MCP com inspeção de argumentos antes da execução.
  - Script automatizado de provisionamento: `npm run provision:agent`.
- **Servidor MCP (`apps/06-agent-workspace/mcp-server`):**
  - Servidor Node.js implementando o padrão **Model Context Protocol (MCP)** versão 2026 com retrocompatibilidade 2025.
  - Ferramentas tipadas expostas via MCP:
    - `list_tasks` (Leitura de tarefas do workspace).
    - `search_notes` (Busca semântica de notas).
    - `create_task` (Mutação de tarefas — exige confirmação explícita).
  - Autenticação via header `INTERNAL_API_TOKEN` e chave pública opcional `MCP_API_KEY`.
  - Docker Compose pronto para orquestração local de ambos os serviços.

### 2.2 O que falta fazer no App 06
1. **Ajuste no Script de Testes do Frontend:**
   - Em ambiente de monorepo com npm workspaces, o script `npm test` do frontend precisa invocar o `tsx` a partir do root ou usar `--loader` explícito para rodar os testes unitários (`conversation-isolation.test.ts` e `offline-agent.test.ts`).
2. **Cobertura E2E no Playwright:**
   - O App 06 atualmente não está incluído no runner de fumaça `tests/e2e/smoke.spec.ts` (que cobre do App 00 ao 05). Adicionar o teste offline do workspace no Playwright.
3. **Decisão sobre Deploy (Offline vs. Nuvem):**
   - **Se rodar em Modo Demonstração (Recomendado):**
     - Subir os dois containers no Coolify usando `AGENT_PROVIDER=offline` e volume local para o arquivo `/data/workspace.json`. Custo: **$0 / mês**.
   - **Se rodar com Azure AI Foundry Real:**
     - Executar o checklist de infraestrutura Azure detalhado na seção 3.

---

## 3. Guia de Recursos Azure (Caso decida provisionar o Modo Foundry)

Se e quando você optar por ativar o modo `AGENT_PROVIDER=foundry` no App 06, esta é a infraestrutura exata que precisará ser criada no portal do Azure:

```
[Azure Subscription]
  ├── Resource Group: rg-ai-roadmap
  │     ├── Azure OpenAI Service (Já existente)
  │     │     └── Deployment: gpt-4o-mini
  │     │
  │     ├── Azure AI Foundry (Hub & Project)
  │     │     ├── Project Endpoint: https://<account>.services.ai.azure.com/api/projects/<project>
  │     │     └── Connected Deployment: gpt-4o-mini
  │     │
  │     ├── Microsoft Entra ID (App Registration / Service Principal)
  │     │     ├── Role: "Azure AI Developer" atribuída no Projeto Foundry
  │     │     └── Credenciais: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID
  │     │
  │     └── Azure Cosmos DB (Opcional - NoSQL API)
  │           ├── Database: agent-workspace
  │           └── Container: conversations-v2 (Partition key: /ownerId)
```

### Ordem obrigatória de configuração para o Foundry:
1. **Publicar o MCP Server primeiro na internet:**
   - O Azure AI Foundry não consegue se conectar a `localhost:8006`.
   - Você deve deployar o container `mcp-server` no Coolify com um domínio público seguro (ex: `https://mcp-app06.seudominio.com/mcp`).
2. **Rodar o provisionamento:**
   ```bash
   cd apps/06-agent-workspace/frontend
   AZURE_AI_PROJECT_ENDPOINT="https://<account>.services.ai.azure.com/api/projects/<project>" \
   AZURE_AI_MODEL_DEPLOYMENT_NAME="gpt-4o-mini" \
   AZURE_AI_AGENT_NAME="agent-workspace" \
   PUBLIC_MCP_SERVER_URL="https://mcp-app06.seudominio.com/mcp" \
   npm run provision:agent
   ```
3. **Configurar o frontend Next.js com as credenciais do Service Principal.**

---

## 4. Próximos Passos Recomendados

1. **App 05:**
   - Manter as variáveis apontando para o seu **Azure OpenAI atual**.
   - Adicionar o tracing OpenTelemetry (`telemetry.py`) para paridade total com o App 01.
2. **App 06:**
   - Manter em `AGENT_PROVIDER=offline` para testes locais e demo pública inicial.
   - Ajustar o comando de testes unitários para o monorepo.
   - Incluir o App 06 na suíte de testes E2E do Playwright (`tests/e2e`).
3. **Deploy:**
   - Deployar ambos no Coolify usando os arquivos `compose.coolify.yml` (App 05) e `docker-compose.yml` (App 06), mantendo todos os segredos protegidos em variáveis de ambiente.
