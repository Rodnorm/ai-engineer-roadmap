# Plano de Implementação — App 03 · promptForge

> Documento vivo. Atualize conforme decisões forem tomadas. Última atualização: 2026-08-26.

## 1. Contexto e objetivo

O **App 03 — promptForge** é um estúdio de conteúdo marketing que transforma um brief em 3 variações estruturadas usando personas distintas. O **frontend já está completo** (Next.js 16 + React 19 + Tailwind 4, com i18n EN/PT-BR/DE, tema claro/escuro, log de requisições e preview local). O **backend é apenas um esqueleto** (`backend/main.py` expõe só `/health`).

**Objetivo da sessão (próximas 5 h):** tirar o backend do papel — ir do bare mínimo funcional a um backend pronto para ser consumido pelo frontend. Frontend fica para depois desse marco.

## 2. Estado atual

| Camada | Estado | Observações |
|---|---|---|
| Frontend (UI/UX) | ✅ Integrado | `PromptForge.tsx` usa os endpoints de geração, safety e log, com cancelamento via `AbortController`. |
| Backend FastAPI | ✅ Fase 1+2 pronta | Geração estruturada, personas, custos, log, safety, prompts e health implementados. |
| Integração Azure OpenAI | ✅ Pronta | Integração direta em `main.py`, seguindo o padrão simples dos Apps 01 e 02. |
| `backend/prompts/app3_prompt_test_harness.json` | ✅ Pronto | 10 prompts de classificação + casos de teste — útil para reuso do "test harness" como classificador prévio do brief. |
| Azure OpenAI | ❌ Não configurado | Variáveis `AZURE_OPENAI_ENDPOINT/DEPLOYMENT/API_KEY` ainda sem valor real. |
| Content Safety | ❌ Não integrado | Hoje só existe um regex client-side em `PromptForge.tsx` (linha 40). |
| Persistência de log | ❌ Não integrada | `RequestLog` hoje é state local em memória. |
| Streaming (Vercel AI SDK) | ❌ Não integrado | Frontend só lê o array de variações de uma vez. |
| `vercel.json` | ✅ Pronto | Rewrite `/api/backend(/.*)? → backend`, resto vai para o frontend. |

## 3. Visão de produto (features)

Numeração = prioridade. **F1–F4** são o backend mínimo das próximas 5h. **F5–F8** são backend ampliado. **F9–F11** são integração com o frontend.

### 3.1 Backend — bare mínimo (Fase 1, ~2h)

- **F1. Endpoint `POST /api/backend/generate`** — recebe `{ brief, audience, format, persona, temperature, topP, maxTokens }` e retorna `{ variations: [{id, title, body, seoKeywords, tokens, cost}], totals }`.
- **F2. Integração Azure OpenAI** com **structured outputs** (JSON schema `Variation[]`) usando o SDK oficial `openai` (cliente Azure). Substituir o stub `_build_client` por inicialização real + `responses.parse` (ou `chat.completions` com `response_format` JSON schema).
- **F3. Mapeamento de persona → system prompt** (3 personas: friendly / technical / cfo). Persona é uma string; persona vira prompt via tabela.
- **F4. Cálculo de tokens/custo** a partir de `usage` retornado pelo modelo (prompt + completion × 3 variações). Persistir em memória em um `deque`/lista para o endpoint de log.

### 3.2 Backend — endurecimento (Fase 2, ~2h)

- **F5. Endpoint `GET /api/backend/log`** — retorna as últimas N requisições (tokens, custo, persona, status, timestamp, brief truncado).
- **F6. Endpoint `GET /api/backend/prompts`** — retorna os prompts do test harness para futura UI de "prompt playground".
- **F7. Validação de entrada** com Pydantic (`BaseModel` por endpoint). Erros 422 padronizados.
- **F8. Endpoint `POST /api/backend/safety/check`** — wrapper fino do Azure AI Content Safety (stub retornando `{safe: true}` por enquanto; trocar quando a chave estiver disponível).

### 3.3 Backend — polimento (Fase 3, ~1h)

- **F9. Health enriquecido** (`/health` retorna `model`, `deployment`, `safety_configured`).
- **F10. Limites e rate limit** simples em memória (token bucket) — opcional.
- **F11. Logs estruturados** (JSON) e `request_id` por chamada.

### 3.4 Frontend — integração (Fase 4, depois das 5h)

- **F12. Substituir mock por `fetch('/api/backend/generate')`** em `PromptForge.tsx`, removendo `buildVariations`.
- **F13. Streaming opcional** com Vercel AI SDK (`useCompletion` ou `streamObject`) — voltar para fetch se demorar.
- **F14. Botão "stop"** cancela via `AbortController`.
- **F15. Erro de safety** agora é renderizado a partir da resposta 422/400 do backend, removendo a heurística client-side.
- **F16. Request log** lê de `GET /log` em vez de state local (manter cache local para UX imediata).
- **F17. Página `/playground`** que lista os prompts de `app3_prompt_test_harness.json` (vindo de `/api/backend/prompts`) e roda o classificador — opcional.

## 4. Arquitetura proposta

```
apps/03-prompt-forge/
├── backend/
│   ├── main.py              # FastAPI app + routers
│   ├── agent.py             # PromptForgeAgent (orquestra Azure OpenAI)
│   ├── models.py            # Pydantic: GenerateRequest, Variation, LogEntry
│   ├── personas.py          # TABELA persona -> {system_prompt, description}
│   ├── safety.py            # Wrapper Content Safety (stub agora)
│   ├── log_store.py         # In-memory deque de RequestEntry
│   ├── prompts/             # (já existe) test harness
│   ├── requirements.txt     # + openai, azure-identity, pydantic
│   └── .env.example         # atualizar com AZURE_OPENAI_*
└── frontend/                # sem mudanças até Fase 4
```

**Princípios**

- Backend é **stateless** exceto pelo log em memória (sem DB na primeira iteração).
- Toda resposta segue um envelope estável `{ data, meta: {request_id, latency_ms, tokens, cost} }` para o frontend ter um único caminho.
- Persona, formato e audience entram como strings controladas; nada é injetado direto no prompt sem passar pelo `models.py`.
- Erros retornam `{ error: {code, message, field?} }` com status HTTP apropriado (422 para validação, 502 para falha upstream, 503 se Azure não configurado).

## 5. Contratos da API (proposta)

### `POST /api/backend/generate`

Request

```json
{
  "brief": "string (>=20 chars)",
  "audience": "string?",
  "format": "linkedin | email | landing",
  "persona": "friendly | technical | cfo",
  "temperature": 0.7,
  "topP": 0.9,
  "maxTokens": 700
}
```

Response 200

```json
{
  "data": {
    "variations": [
      {"id": 1, "title": "...", "body": "...", "seoKeywords": ["..."]}
    ]
  },
  "meta": {
    "request_id": "uuid",
    "latency_ms": 1240,
    "tokens": {"prompt": 320, "completion": 612, "total": 932},
    "cost": 0.00042
  }
}
```

### `GET /api/backend/log?limit=20`

```json
{
  "data": [
    {"id": "uuid", "brief": "truncated...", "persona": "friendly", "tokens": 932, "cost": 0.00042, "status": "complete", "createdAt": "2026-08-26T14:01:11Z"}
  ]
}
```

### `POST /api/backend/safety/check`

```json
{ "text": "string" }
→ { "data": { "safe": true, "categories": {} } }
```

### `GET /api/backend/prompts`

Retorna o JSON atual de `app3_prompt_test_harness.json` (sem alteração do arquivo).

## 6. Dependências a adicionar (backend)

```
openai>=1.50            # SDK oficial com AzureOpenAI
pydantic>=2.7           # já vem via FastAPI; pydantic-settings p/ env
python-dotenv           # já existe
```

Nenhum cliente pesado (sem langchain, sem vercel ai sdk no backend). Mantenha o backend pequeno.

## 7. Variáveis de ambiente (`.env.example` atualizado)

```
PORT=8000
LOG_LEVEL=INFO

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://<seu-recurso>.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini          # ou gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview  # p/ structured outputs
AZURE_OPENAI_API_KEY=<sua-chave>

# Content Safety (opcional na Fase 2)
AZURE_CONTENT_SAFETY_ENDPOINT=
AZURE_CONTENT_SAFETY_KEY=

# Custos (USD por 1k tokens) — para estimativa caso usage não venha completo
COST_PROMPT_PER_1K=0.00015
COST_COMPLETION_PER_1K=0.0006
```

## 8. Sequência de execução (próximas 5h)

| Bloco | Tempo | Entregas |
|---|---|---|
| **0. Setup** | 10 min | Atualizar `requirements.txt`, `.env.example`, criar `models.py`, `personas.py` |
| **1. Agente mínimo** | 60 min | `agent.py` com `AzureOpenAI` + structured output + 3 personas. Sem endpoint ainda. Script `scripts/run_agent.py` para sanity check manual. |
| **2. Endpoint `/generate`** | 45 min | `POST /generate` em `main.py` chamando o agente. CORS já está OK. Smoke test com `curl`. |
| **3. Log + `/log`** | 30 min | `log_store.py`, `RequestEntry`, endpoint `GET /log`. |
| **4. Validação + erros** | 30 min | Pydantic nos modelos, erros padronizados. |
| **5. `/safety/check` stub** | 15 min | Wrapper retornando `{safe: true}`. |
| **6. `/prompts`** | 15 min | Carrega JSON do test harness. |
| **7. `/health` rico** | 10 min | Retorna config status. |
| **8. Logs estruturados + request_id** | 20 min | Middleware simples. |
| **9. README do backend** | 15 min | Como rodar, envs, contratos, exemplos curl. |
| **10. Buffer** | 30 min | Arrumar o que aparecer. |

**Total orçado:** ~5h. Cortar polimento (F9–F11) se necessário.

## 9. Riscos e mitigações

- **Azure OpenAI sem chave ainda.** Backend precisa funcionar em modo *degraded*: se `AZURE_OPENAI_*` ausentes, `/generate` retorna 503 com mensagem clara (mesmo padrão do stub atual). Documentar como testar sem Azure (script de fixture opcional).
- **Structured outputs exigem `api_version >= 2024-08-01`.** Fixar no `.env.example` e validar no startup.
- **CORS com `root_path=/api/backend`.** Em produção o rewrite do `vercel.json` cobre; em dev local o frontend chamará `http://localhost:8000/api/backend/generate` (atualizar `next.config.mjs` se necessário).
- **Timeout do uvicorn** em dev — manter `reload=True` no `__main__`.
- **Custo de 3 variações = 3 chamadas.** Considerar gerar em paralelo (`asyncio.gather`) já na Fase 1, pois latência percebida cai ~3×.

## 10. Critérios de pronto (Definition of Done) — Fase 1+2

- [x] `uvicorn main:app` sobe sem warning crítico.
- [x] `curl /api/backend/health` retorna o status e a configuração do modelo.
- [x] `curl -X POST /api/backend/generate` com payload válido retorna 3 variações estruturadas (com Azure configurado) ou 503 (sem Azure) — nunca 500.
- [x] `curl -X POST /api/backend/generate` com brief <20 chars retorna 422 com mensagem clara.
- [x] `curl /api/backend/log` lista a requisição anterior com tokens e custo.
- [x] `curl /api/backend/prompts` retorna o test harness.
- [x] `curl -X POST /api/backend/safety/check` retorna `{safe: true}`.
- [x] README do backend atualizado com setup, envs e exemplos.
- [x] Sem `print()` no código de produção (só `logging`).

## 11. Próximos passos Imediatos (próxima 1h)

1. Adicionar `openai` a `requirements.txt` e instalar no `.venv`.
2. Criar `models.py`, `personas.py`, `log_store.py` (esqueleto).
3. Reescrever `agent.py` com classe `PromptForgeAgent`.
4. Criar branch `feat/backend-bare-minimum`.
5. Smoke test via `python -m agent` com Azure configurado.

---

> **Regra de ouro desta sprint:** *o backend sai do esqueleto HOJE.* O frontend só é tocado depois que `/generate`, `/log` e `/safety/check` estiverem respondendo conforme contrato acima.
