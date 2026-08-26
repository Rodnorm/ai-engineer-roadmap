# Tutorial — Fases 1 e 2 · Backend bare minimum do promptForge

> Guia passo-a-passo para tirar o backend do `apps/03-prompt-forge` do estado de esqueleto até responder aos endpoints definidos no `PLANO_IMPLEMENTACAO.md`. **Fase 1** = backend mínimo funcional (~2h). **Fase 2** = endurecimento + endpoints auxiliares (~2h). O frontend continua intocado.

**Tempo total orçado:** ~4h dentro da janela de 5h.

---

## Visão geral do que você vai construir

```
backend/
├── main.py            # FastAPI + routers
├── agent.py           # PromptForgeAgent (Azure OpenAI + structured output)
├── models.py          # Pydantic (request/response)
├── personas.py        # Tabela persona -> system prompt
├── safety.py          # Wrapper Content Safety (stub)
├── log_store.py       # Log em memória
└── prompts/           # já existe (test harness)
```

Endpoints após as duas fases:

| Método | Rota | Função |
|---|---|---|
| GET  | `/api/backend/health` | Status + configuração Azure |
| POST | `/api/backend/generate` | Gera 3 variações |
| GET  | `/api/backend/log` | Lista últimas requisições |
| POST | `/api/backend/safety/check` | Stub de Content Safety |
| GET  | `/api/backend/prompts` | Lista prompts do test harness |

---

## Pré-requisitos

- Python 3.11+
- Ambiente virtual já existente em `backend/.venv`
- PowerShell no diretório `apps/03-prompt-forge`
- (Opcional, mas recomendado) Credenciais Azure OpenAI — sem elas, `/generate` retorna 503, mas o resto funciona

```powershell
cd apps/03-prompt-forge/backend
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
```

---

# Fase 1 — Backend bare minimum funcional

> **Objetivo:** `POST /api/backend/generate` retorna 3 variações estruturadas com tokens e custo. `GET /api/backend/health` confirma o status. Os outros endpoints podem retornar 404.

## Passo 1 — Atualizar dependências (~5 min)

**1.1.** Edite `backend/requirements.txt`:

```
python-dotenv
fastapi>=0.141.1
uvicorn[standard]>=0.52.4
openai>=1.50.0
pydantic>=2.7
```

**1.2.** Instale:

```powershell
pip install -r requirements.txt
```

**1.3.** Atualize `backend/.env.example`:

```
# Server
PORT=8000
LOG_LEVEL=INFO

# Azure OpenAI — preencha quando disponível
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_VERSION=2024-08-01-preview

# Custos (USD por 1k tokens)
COST_PROMPT_PER_1K=0.00015
COST_COMPLETION_PER_1K=0.0006
```

> Crie seu `backend/.env` local a partir desse exemplo (o `.gitignore` já o ignora).

---

## Passo 2 — Criar `models.py` (~15 min)

Arquivo: `backend/models.py`. Concentra os schemas Pydantic para evitar duplicação entre agente, endpoints e log.

```python
"""Pydantic models for promptForge API."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


PersonaId = Literal["friendly", "technical", "cfo"]
FormatId = Literal["linkedin", "email", "landing"]


class GenerateRequest(BaseModel):
    brief: str = Field(..., min_length=20, max_length=2000)
    audience: str | None = Field(default=None, max_length=200)
    format: FormatId = "linkedin"
    persona: PersonaId = "friendly"
    temperature: float = Field(default=0.7, ge=0.0, le=1.5)
    topP: float = Field(default=0.9, ge=0.1, le=1.0)
    maxTokens: int = Field(default=700, ge=200, le=1600)


class Variation(BaseModel):
    id: int
    title: str
    body: str
    seoKeywords: list[str] = Field(default_factory=list)


class TokenUsage(BaseModel):
    prompt: int
    completion: int
    total: int


class GenerateMeta(BaseModel):
    request_id: str
    latency_ms: int
    tokens: TokenUsage
    cost: float


class GenerateResponse(BaseModel):
    data: list[Variation]
    meta: GenerateMeta


class SafetyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)


class SafetyResponse(BaseModel):
    safe: bool
    categories: dict[str, int] = Field(default_factory=dict)


class RequestEntry(BaseModel):
    id: str
    brief: str
    persona: PersonaId
    tokens: int
    cost: float
    status: Literal["complete", "cancelled", "error"]
    createdAt: datetime
```

> **Por que `data` é `list[Variation]` e não `{ variations: [...] }`?** Ambos servem; manter `data` como array direto simplifica o frontend no F12. Se preferir o envelope `{ data: { variations: [...] } }`, ajuste aqui antes da Fase 4.

---

## Passo 3 — Criar `personas.py` (~10 min)

Arquivo: `backend/personas.py`. Persona é uma escolha de tom, não precisa ser prompt gigante.

```python
"""Persona -> system prompt mapping."""
from __future__ import annotations

PERSONAS: dict[str, dict[str, str]] = {
    "friendly": {
        "name": "Friendly SaaS Marketer",
        "system": (
            "You are a friendly SaaS marketer. "
            "Write in a warm, benefit-led, conversational tone. "
            "Prefer short sentences and a clear call to action."
        ),
    },
    "technical": {
        "name": "Technical Blogger",
        "system": (
            "You are a technical blogger. "
            "Write in a precise, credible, educational tone. "
            "Include concrete details, trade-offs, and one practical tip."
        ),
    },
    "cfo": {
        "name": "Skeptical CFO",
        "system": (
            "You are a skeptical CFO. "
            "Write in a direct, evidence-driven, ROI-focused tone. "
            "Quantify impact where possible and flag risks explicitly."
        ),
    },
}


def system_prompt_for(persona: str) -> str:
    if persona not in PERSONAS:
        raise ValueError(f"Unknown persona: {persona}")
    return PERSONAS[persona]["system"]


def name_for(persona: str) -> str:
    return PERSONAS.get(persona, {}).get("name", persona)
```

---

## Passo 4 — Criar `log_store.py` (~10 min)

Arquivo: `backend/log_store.py`. In-memory deque com limite. Sem persistência ainda.

```python
"""In-memory request log."""
from __future__ import annotations

from collections import deque
from threading import Lock
from uuid import uuid4

from models import RequestEntry


_MAX_ENTRIES = 100

_lock = Lock()
_entries: deque[RequestEntry] = deque(maxlen=_MAX_ENTRIES)


def append(brief: str, persona: str, tokens: int, cost: float, status: str) -> RequestEntry:
    entry = RequestEntry(
        id=str(uuid4()),
        brief=brief[:120],
        persona=persona,  # type: ignore[arg-type]
        tokens=tokens,
        cost=cost,
        status=status,  # type: ignore[arg-type]
        createdAt=_now(),
    )
    with _lock:
        _entries.appendleft(entry)
    return entry


def recent(limit: int = 20) -> list[RequestEntry]:
    with _lock:
        return list(_entries)[:limit]


def _now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)
```

---

## Passo 5 — Implementar `agent.py` — o coração (~60 min)

Substitua o conteúdo de `backend/agent.py` por:

```python
"""PromptForge agent — orchestrates Azure OpenAI structured generation."""
from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from typing import Any

from openai import AzureOpenAI, OpenAIError
from pydantic import BaseModel, Field

from personas import system_prompt_for

log = logging.getLogger("prompt-forge.agent")


# --- Structured output schema (mirrors models.Variation) ----------------------
class _VariationSchema(BaseModel):
    id: int
    title: str
    body: str
    seoKeywords: list[str] = Field(default_factory=list)


class _ResultSchema(BaseModel):
    variations: list[_VariationSchema]


# --- Client ------------------------------------------------------------------
def _build_client() -> AzureOpenAI | None:
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
    api_key = os.getenv("AZURE_OPENAI_API_KEY", "")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")
    if not endpoint or not api_key:
        return None
    return AzureOpenAI(azure_endpoint=endpoint, api_key=api_key, api_version=api_version)


def _deployment() -> str:
    return os.getenv("AZURE_OPENAI_DEPLOYMENT", "")


def _is_configured() -> bool:
    return _build_client() is not None and bool(_deployment())


# --- Cost helpers ------------------------------------------------------------
def _cost_rates() -> tuple[float, float]:
    return (
        float(os.getenv("COST_PROMPT_PER_1K", "0.00015")),
        float(os.getenv("COST_COMPLETION_PER_1K", "0.0006")),
    )


def _compute_cost(prompt_tokens: int, completion_tokens: int) -> float:
    p, c = _cost_rates()
    return round((prompt_tokens / 1000) * p + (completion_tokens / 1000) * c, 6)


# --- Agent -------------------------------------------------------------------
class PromptForgeAgent:
    """Generates N variations in parallel for a given brief."""

    def __init__(self, client: AzureOpenAI | None = None, deployment: str | None = None):
        self.client = client if client is not None else _build_client()
        self.deployment = deployment or _deployment()

    @property
    def configured(self) -> bool:
        return self.client is not None and bool(self.deployment)

    async def generate(
        self,
        *,
        brief: str,
        audience: str | None,
        format_: str,
        persona: str,
        temperature: float,
        top_p: float,
        max_tokens: int,
        n_variations: int = 3,
        request_id: str,
    ) -> dict[str, Any]:
        if not self.configured:
            raise RuntimeError("Azure OpenAI is not configured")

        system = system_prompt_for(persona)
        user = self._user_prompt(brief, audience, format_, n_variations)

        started = time.perf_counter()
        tasks = [
            self._one_call(system, user, temperature, top_p, max_tokens)
            for _ in range(n_variations)
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Se qualquer chamada falhar, levantamos o primeiro erro (pode refinar depois).
        for r in results:
            if isinstance(r, Exception):
                raise r

        merged = self._merge_variations(results, n_variations)  # type: ignore[arg-type]

        prompt_tokens = sum(r["usage"]["prompt_tokens"] for r in results)
        completion_tokens = sum(r["usage"]["completion_tokens"] for r in results)
        total = prompt_tokens + completion_tokens
        cost = _compute_cost(prompt_tokens, completion_tokens)

        return {
            "data": merged,
            "meta": {
                "request_id": request_id,
                "latency_ms": int((time.perf_counter() - started) * 1000),
                "tokens": {
                    "prompt": prompt_tokens,
                    "completion": completion_tokens,
                    "total": total,
                },
                "cost": cost,
            },
        }

    async def _one_call(self, system: str, user: str, temperature: float, top_p: float, max_tokens: int) -> dict[str, Any]:
        # SDK openai>=1.50 tem parse() síncrono. Rodamos em thread para não bloquear.
        def _call() -> dict[str, Any]:
            assert self.client is not None
            completion = self.client.chat.completions.parse(
                model=self.deployment,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                response_format=_ResultSchema,
            )
            parsed: _ResultSchema = completion.choices[0].message.parsed  # type: ignore[assignment]
            usage = completion.usage
            return {
                "variations": [v.model_dump() for v in parsed.variations],
                "usage": {
                    "prompt_tokens": usage.prompt_tokens or 0,
                    "completion_tokens": usage.completion_tokens or 0,
                },
            }

        return await asyncio.to_thread(_call)

    @staticmethod
    def _user_prompt(brief: str, audience: str | None, format_: str, n: int) -> str:
        audience_line = f"Target audience: {audience.strip()}" if audience else "Target audience: your ideal reader"
        return (
            f"Create exactly {n} distinct content variations for the following brief.\n\n"
            f"Brief: {brief.strip()}\n"
            f"Format: {format_}\n"
            f"{audience_line}\n\n"
            "Each variation must have a strong title, a body, and 3 SEO keywords. "
            "Return JSON with shape: {\"variations\": [{\"id\":1,\"title\":\"...\",\"body\":\"...\",\"seoKeywords\":[...]}, ...]}. "
            "Vary tone and structure between variations; do not repeat the same opening line."
        )

    @staticmethod
    def _merge_variations(results: list[dict[str, Any]], expected: int) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        next_id = 1
        for r in results:
            for v in r["variations"]:
                v["id"] = next_id
                out.append(v)
                next_id += 1
                if len(out) >= expected:
                    return out
        return out


# --- Singleton ---------------------------------------------------------------
_agent: PromptForgeAgent | None = None


def get_agent() -> PromptForgeAgent:
    global _agent
    if _agent is None:
        _agent = PromptForgeAgent()
        if _agent.configured:
            log.info("Azure OpenAI ready (deployment=%s)", _agent.deployment)
        else:
            log.warning("Azure OpenAI not fully configured — /generate will return 503")
    return _agent
```

> **Por que 3 chamadas em paralelo?** Latência percebida cai ~3× e cada variation tem ruído independente. Structured outputs com `response_format` JSON schema estão estáveis na `api_version` `2024-08-01-preview`.

**Sanity check manual** (sem Azure não vai funcionar; com Azure deve gerar):

```powershell
python -c "import asyncio; from agent import get_agent; print(get_agent().configured)"
```

---

## Passo 6 — Reescrever `main.py` com o endpoint `/generate` (~45 min)

Substitua `backend/main.py` por:

```python
"""promptForge FastAPI backend.

Endpoints (base path: /api/backend):
    GET  /health
    POST /generate
    GET  /log
    POST /safety/check
    GET  /prompts
"""

import logging
import os
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agent import get_agent
from log_store import append as log_append, recent as log_recent
from models import GenerateRequest, GenerateResponse, SafetyRequest, SafetyResponse
from safety import check_safety
from prompts_loader import list_prompts  # veja Passo 7

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("prompt-forge")

app = FastAPI(title="promptForge", version="0.2.0", root_path="/api/backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:3001", "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict:
    agent = get_agent()
    return {
        "status": "ok",
        "app": "prompt-forge",
        "azure_configured": agent.configured,
        "deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT") or None,
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    request_id = str(uuid.uuid4())
    agent = get_agent()
    if not agent.configured:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "azure_not_configured",
                "message": "Azure OpenAI is not configured on the server.",
            },
        )

    try:
        # FastAPI é async-friendly, mas o cliente OpenAI é síncrono; rodamos dentro do event loop.
        import asyncio
        result = asyncio.run(agent.generate(
            brief=req.brief,
            audience=req.audience,
            format_=req.format,
            persona=req.persona,
            temperature=req.temperature,
            top_p=req.topP,
            max_tokens=req.maxTokens,
            request_id=request_id,
        ))
    except Exception as exc:  # noqa: BLE001
        log.exception("generate failed (request_id=%s)", request_id)
        log_append(req.brief, req.persona, 0, 0.0, "error")
        raise HTTPException(
            status_code=502,
            detail={"code": "upstream_error", "message": str(exc)},
        ) from exc

    log_append(
        brief=req.brief,
        persona=req.persona,
        tokens=result["meta"]["tokens"]["total"],
        cost=result["meta"]["cost"],
        status="complete",
    )

    return GenerateResponse(data=result["data"], meta=result["meta"])


@app.get("/log")
def get_log(limit: int = 20) -> dict:
    return {"data": [e.model_dump(mode="json") for e in log_recent(limit)]}


@app.post("/safety/check", response_model=SafetyResponse)
def safety_check(req: SafetyRequest) -> SafetyResponse:
    return check_safety(req.text)


@app.get("/prompts")
def prompts() -> dict:
    return {"data": list_prompts()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
```

> O endpoint usa `asyncio.run` porque o handler é síncrono. Se preferir, marque `generate` como `async def` e use `await agent.generate(...)` — escolha o que você for manter como padrão.

---

## Passo 7 — Criar `safety.py` e `prompts_loader.py` (~15 min)

**`backend/safety.py`** — stub do Content Safety:

```python
"""Content Safety wrapper.

Na Fase 1 retorna sempre {safe: True}. A Fase 2 substitui por chamada real
quando AZURE_CONTENT_SAFETY_* estiverem configuradas.
"""
from __future__ import annotations

import logging

from fastapi import HTTPException

from models import SafetyResponse

log = logging.getLogger("prompt-forge.safety")


def check_safety(text: str) -> SafetyResponse:
    # Stub — manter simples. Quando as credenciais chegarem, trocar por chamada real.
    blocked_terms = ("build a bomb", "make a weapon", "construir uma bomba", "sprengstoff bauen")
    lowered = text.lower()
    for term in blocked_terms:
        if term in lowered:
            return SafetyResponse(safe=False, categories={"blocked_term": 4})

    return SafetyResponse(safe=True)
```

**`backend/prompts_loader.py`** — carrega o test harness JSON:

```python
"""Loads the prompt test harness bundled with the backend."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

_PROMPTS_PATH = Path(__file__).parent / "prompts" / "app3_prompt_test_harness.json"


@lru_cache(maxsize=1)
def _load() -> dict:
    with _PROMPTS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def list_prompts() -> list[dict]:
    return _load().get("prompts", [])
```

---

## Passo 8 — Smoke test (~10 min)

**8.1.** Suba o servidor:

```powershell
cd apps/03-prompt-forge/backend
.\.venv\Scripts\Activate.ps1
python main.py
```

**8.2.** Em outro terminal:

```powershell
# Health
curl http://localhost:8000/api/backend/health

# Geração (com Azure configurado)
curl -X POST http://localhost:8000/api/backend/generate `
  -H "Content-Type: application/json" `
  -d '{
    "brief": "Anuncie o lancamento do nosso novo dashboard de analytics para times de marketing.",
    "audience": "Growth managers em startups SaaS",
    "format": "linkedin",
    "persona": "friendly",
    "temperature": 0.7,
    "topP": 0.9,
    "maxTokens": 700
  }'

# Log
curl http://localhost:8000/api/backend/log
```

**8.3.** Sem Azure configurado, espere 503 com `{code: "azure_not_configured"}` em `/generate`. Os outros endpoints continuam funcionando.

---

## Passo 9 — Validar o checklist da Fase 1

- [ ] `uvicorn` sobe sem warning crítico
- [ ] `GET /api/backend/health` retorna `{azure_configured: true|false}`
- [ ] `POST /api/backend/generate` retorna 200 com 3 variações (Azure configurado) ou 503 (sem Azure)
- [ ] Brief com <20 chars retorna 422 com mensagem clara (Pydantic)
- [ ] Log recebe a entrada após uma geração
- [ ] Nenhum `print()` em código de produção

**Ao terminar, marque a Fase 1 como concluída e vá para a Fase 2.**

---

# Fase 2 — Endurecimento e endpoints auxiliares

> **Objetivo:** Reforçar validação, adicionar `/safety/check` (comportamento real opcional), expor `/prompts`, melhorar `/health` e preparar logs estruturados para a Fase 4 (frontend).

## Passo 10 — `safety.py` com Azure AI Content Safety opcional (~20 min)

Substitua o conteúdo de `backend/safety.py`:

```python
"""Content Safety wrapper.

Modos:
  - Stub (default): usa heurística local de termos bloqueados.
  - Azure: quando AZURE_CONTENT_SAFETY_ENDPOINT e AZURE_CONTENT_SAFETY_KEY estão
          configuradas, chama a API Analyze Text e devolve as categorias.
"""
from __future__ import annotations

import logging
import os
from typing import Any

import httpx

from models import SafetyResponse

log = logging.getLogger("prompt-forge.safety")

_ENDPOINT = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT", "").rstrip("/")
_KEY = os.getenv("AZURE_CONTENT_SAFETY_KEY", "")
_API_VERSION = os.getenv("AZURE_CONTENT_SAFETY_API_VERSION", "2024-09-01")

_BLOCKED_TERMS = (
    "build a bomb", "make a weapon", "explosive device",
    "construir uma bomba", "arma explosiva",
    "sprengstoff bauen",
)


def _is_azure_configured() -> bool:
    return bool(_ENDPOINT) and bool(_KEY)


def check_safety(text: str) -> SafetyResponse:
    lowered = text.lower()
    if any(term in lowered for term in _BLOCKED_TERMS):
        return SafetyResponse(safe=False, categories={"blocked_term": 4})

    if _is_azure_configured():
        try:
            return _check_with_azure(text)
        except Exception:
            log.exception("Azure Content Safety failed; falling back to stub")
    return SafetyResponse(safe=True)


def _check_with_azure(text: str) -> SafetyResponse:
    url = f"{_ENDPOINT}/contentsafety/text:analyze?api-version={_API_VERSION}"
    headers = {"Ocp-Apim-Subscription-Key": _KEY, "Content-Type": "application/json"}
    body = {
        "text": text,
        "categories": ["Hate", "Sexual", "Violence", "SelfHarm"],
        "outputType": "FourSeverityLevels",
    }
    with httpx.Client(timeout=10.0) as client:
        resp = client.post(url, json=body, headers=headers)
        resp.raise_for_status()
        payload: dict[str, Any] = resp.json()

    cats = {item["category"]: item.get("severity", 0) for item in payload.get("categoriesAnalysis", [])}
    safe = all(sev <= 2 for sev in cats.values())  # severidade 0-2 = safe
    return SafetyResponse(safe=safe, categories=cats)
```

> Adicione `httpx` ao `requirements.txt` se ainda não estiver lá (vem com `uvicorn[standard]` na maioria dos casos).

---

## Passo 11 — Melhorar `/health` e adicionar request_id middleware (~20 min)

Em `backend/main.py`, adicione o middleware **antes** da definição das rotas (depois de `app = FastAPI(...)`):

```python
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        request.state.request_id = request_id
        started = time.perf_counter()
        response = await call_next(request)
        elapsed = int((time.perf_counter() - started) * 1000)
        response.headers["x-request-id"] = request_id
        response.headers["x-latency-ms"] = str(elapsed)
        log.info("%s %s -> %s (%sms)", request.method, request.url.path, response.status_code, elapsed)
        return response


app.add_middleware(RequestContextMiddleware)
```

Atualize `/health` para devolver `safety_configured`:

```python
@app.get("/health")
def health() -> dict:
    agent = get_agent()
    return {
        "status": "ok",
        "app": "prompt-forge",
        "azure_configured": agent.configured,
        "safety_configured": bool(os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT")) and bool(os.getenv("AZURE_CONTENT_SAFETY_KEY")),
        "deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT") or None,
    }
```

> No FastAPI, **middleware é registrado em ordem inversa**: o último `add_middleware` é o mais externo. Registre o `RequestContextMiddleware` **depois** do `CORSMiddleware` para que o request_id apareça em todas as respostas.

---

## Passo 12 — Endpoint `/prompts` e tipagem mais forte (~10 min)

Você já criou `prompts_loader.list_prompts()` no Passo 7. Garanta que `/prompts` devolve também metadados úteis para a futura UI `/playground`:

Edite `backend/prompts_loader.py`:

```python
@lru_cache(maxsize=1)
def _load() -> dict:
    with _PROMPTS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def list_prompts() -> list[dict]:
    data = _load()
    out = []
    for p in data.get("prompts", []):
        out.append({
            "id": p["id"],
            "strategy": p["strategy"],
            "title": p["title"],
            "systemPrompt": p["systemPrompt"],
            "userPrompt": p["userPrompt"],
        })
    return out


def suggested_test_cases() -> list[dict]:
    return _load().get("suggestedTestCases", [])
```

E exponha via rota adicional em `main.py`:

```python
from prompts_loader import list_prompts, suggested_test_cases


@app.get("/prompts")
def prompts() -> dict:
    return {"data": list_prompts()}


@app.get("/prompts/test-cases")
def prompts_test_cases() -> dict:
    return {"data": suggested_test_cases()}
```

---

## Passo 13 — Validação extra em `/generate` (~15 min)

Adicione regras de negócio sobre as que o Pydantic já aplica:

```python
@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    # Sanity check de audience
    if req.audience is not None and len(req.audience.strip()) > 200:
        raise HTTPException(status_code=422, detail={
            "code": "audience_too_long", "message": "Audience must be <= 200 chars",
            "field": "audience",
        })

    request_id = str(uuid.uuid4())
    agent = get_agent()
    if not agent.configured:
        log_append(req.brief, req.persona, 0, 0.0, "error")
        raise HTTPException(status_code=503, detail={
            "code": "azure_not_configured",
            "message": "Configure AZURE_OPENAI_* to enable generation.",
        })

    # ... resto igual ao Passo 6
```

---

## Passo 14 — Script de auto-teste do `/generate` (~15 min)

Crie `backend/scripts/smoke.py` para validar o backend sem precisar do frontend:

```python
"""Smoke test runner. Usage: python scripts/smoke.py"""
from __future__ import annotations

import json
import sys
import urllib.request
import urllib.error

BASE = "http://localhost:8000/api/backend"


def get(path: str) -> dict:
    with urllib.request.urlopen(BASE + path) as r:
        return json.loads(r.read())


def post(path: str, payload: dict) -> tuple[int, dict]:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        BASE + path, data=data, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def main() -> int:
    print("[health]", get("/health"))

    status, body = post("/safety/check", {"text": "hello world"})
    print("[safety/check]", status, body)

    status, body = post("/generate", {
        "brief": "Anuncie o lancamento do nosso novo dashboard de analytics para times de marketing.",
        "audience": "Growth managers em startups SaaS",
        "format": "linkedin",
        "persona": "friendly",
    })
    print("[generate]", status)
    if status == 200:
        print("  variations:", len(body["data"]))
        print("  tokens:", body["meta"]["tokens"])
        print("  cost: $", body["meta"]["cost"])
    elif status == 503:
        print("  (Azure not configured — esperado em ambiente sem chave)")

    print("[log]", get("/log"))
    print("[prompts count]", len(get("/prompts")["data"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Rode (com o servidor no ar):

```powershell
python scripts/smoke.py
```

Saída esperada (sem Azure):

```
[health] {'status': 'ok', 'app': 'prompt-forge', 'azure_configured': False, ...}
[safety/check] 200 {'safe': True, 'categories': {}}
[generate] 503 {'detail': {'code': 'azure_not_configured', ...}}
[log] {'data': [...]}
[prompts count] 10
```

---

## Passo 15 — README do backend (~15 min)

Crie `backend/README.md`:

````markdown
# promptForge — backend

FastAPI + Azure OpenAI.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # preencher AZURE_OPENAI_*
python main.py
```

Servidor sobe em `http://localhost:8000` com `root_path=/api/backend`.
No frontend, a URL final é `http://localhost:8000/api/backend`.

## Endpoints

| Método | Rota                     | Descrição                              |
|--------|--------------------------|----------------------------------------|
| GET    | `/api/backend/health`    | Status e configuração Azure            |
| POST   | `/api/backend/generate`  | Gera 3 variações para um brief         |
| GET    | `/api/backend/log`       | Lista últimas requisições              |
| POST   | `/api/backend/safety/check` | Stub (ou Azure Content Safety)       |
| GET    | `/api/backend/prompts`   | Lista os prompts do test harness       |

## Exemplo

```powershell
curl -X POST http://localhost:8000/api/backend/generate `
  -H "Content-Type: application/json" `
  -d '{"brief":"Anuncie o lancamento do nosso dashboard","format":"linkedin","persona":"friendly"}'
```

## Variáveis de ambiente

Ver `.env.example`.

## Modo degradado

Sem `AZURE_OPENAI_*`, `/generate` retorna **503** com
`{code: "azure_not_configured"}`. Os demais endpoints funcionam.
````

---

## Passo 16 — Validar o checklist final (Fases 1 + 2)

- [ ] `python main.py` sobe sem warning crítico
- [ ] `curl /api/backend/health` retorna status completo
- [ ] `curl -X POST /api/backend/generate` retorna 200 (com Azure) ou 503 (sem)
- [ ] Brief inválido retorna 422 com mensagem clara
- [ ] Audience >200 chars retorna 422
- [ ] `curl -X POST /api/backend/safety/check {"text": "build a bomb"}` retorna `safe=false`
- [ ] `curl /api/backend/log` lista a requisição anterior
- [ ] `curl /api/backend/prompts` retorna os 10 prompts do harness
- [ ] `python scripts/smoke.py` roda fim-a-fim
- [ ] Cada response tem header `x-request-id`
- [ ] README do backend criado

---

## Próximos passos (Fase 3 e 4 — depois das 5h)

- **Fase 3 — Polimento backend:** streaming opcional, rate limit em memória, métricas Prometheus.
- **Fase 4 — Integração frontend:** trocar `buildVariations()` em `PromptForge.tsx` por `fetch('/api/backend/generate')`, ler `/log` para o `RequestLog`, usar `/safety/check` em vez do regex local, opcionalmente `streamObject` da Vercel AI SDK.

---

> **Você está pronto.** Com as Fases 1 e 2 concluídas, o backend responde a todos os contratos definidos no plano e o frontend pode ser plugado sem mudanças de schema.
