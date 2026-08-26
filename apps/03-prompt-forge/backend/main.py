"""promptForge FastAPI backend.

Endpoints (base path: /api/backend):
    GET  /health
    POST /generate        generate 3 structured content variations
    GET  /log             list recent requests
    POST /safety/check    simple safety check (heuristic)
    GET  /prompts         list prompts bundled with the app

Authentication uses AZURE_OPENAI_API_KEY. See .env.example.
"""

from __future__ import annotations

import json
import logging
import os
import time
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

from log_store import append as log_append, recent as log_recent
from models import (
    GenerateRequest,
    GenerateResponse,
    SafetyRequest,
    SafetyResponse,
    Variation,
)
from personas import persona_name, system_prompt_for

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

load_dotenv()


def _env_int(name: str, default: int, minimum: int = 1) -> int:
    raw = os.getenv(name, str(default))
    try:
        value = int(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc
    if value < minimum:
        raise RuntimeError(f"{name} must be at least {minimum}")
    return value


def _env_float(name: str, default: float, minimum: float = 0.0) -> float:
    raw = os.getenv(name, str(default))
    try:
        value = float(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be a number") from exc
    if value < minimum:
        raise RuntimeError(f"{name} must be at least {minimum}")
    return value


LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("prompt-forge")

ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
PORT = _env_int("PORT", 8000)

AZURE_MAX_OUTPUT_TOKENS = _env_int("AZURE_MAX_OUTPUT_TOKENS", 700, 1)
AZURE_REQUEST_TIMEOUT_SECONDS = _env_float("AZURE_REQUEST_TIMEOUT_SECONDS", 30.0, 1.0)

COST_PROMPT_PER_1K = _env_float("COST_PROMPT_PER_1K", 0.00015, 0.0)
COST_COMPLETION_PER_1K = _env_float("COST_COMPLETION_PER_1K", 0.0006, 0.0)


def _build_client() -> OpenAI | None:
    if not ENDPOINT or not DEPLOYMENT or not API_KEY:
        return None
    return OpenAI(base_url=ENDPOINT, api_key=API_KEY)


client: OpenAI | None = _build_client()
if client is None:
    log.warning(
        "Azure OpenAI is not fully configured. /generate will return 503 "
        "until endpoint, deployment, and API key are set."
    )
else:
    log.info("Azure OpenAI client ready (endpoint=%s, deployment=%s).", ENDPOINT, DEPLOYMENT)


# ---------------------------------------------------------------------------
# Structured output schema for responses.parse
# ---------------------------------------------------------------------------


class _VariationSchema(BaseModel):
    id: int
    title: str
    body: str
    seoKeywords: list[str] = Field(default_factory=list)


class _ResultSchema(BaseModel):
    variations: list[_VariationSchema]


FORMAT_NAMES: dict[str, str] = {
    "linkedin": "LinkedIn post",
    "email": "Marketing email",
    "landing": "Landing page copy",
}
DEFAULT_FORMAT = "linkedin"


def _build_user_prompt(brief: str, audience: str | None, format_id: str) -> str:
    fmt_label = FORMAT_NAMES.get(format_id, FORMAT_NAMES[DEFAULT_FORMAT])
    audience_line = (
        f"Target audience: {audience.strip()}" if audience else "Target audience: your ideal reader"
    )
    return (
        f"Create exactly 3 distinct content variations for the following brief.\n\n"
        f"Brief: {brief.strip()}\n"
        f"Format: {fmt_label}\n"
        f"{audience_line}\n\n"
        "Each variation must include a strong title, a body, and 3 SEO keywords. "
        "Vary tone and structure between variations; do not repeat the same opening line. "
        "Return JSON with shape: "
        '{"variations":[{"id":1,"title":"...","body":"...","seoKeywords":["..."]}, ...]}.'
    )


def _compute_cost(prompt_tokens: int, completion_tokens: int) -> float:
    return round(
        (prompt_tokens / 1000) * COST_PROMPT_PER_1K
        + (completion_tokens / 1000) * COST_COMPLETION_PER_1K,
        6,
    )


# ---------------------------------------------------------------------------
# Safety (heuristic — mirrors the frontend preview blocked-terms list)
# ---------------------------------------------------------------------------

BLOCKED_TERMS = (
    "build a bomb",
    "make a weapon",
    "explosive device",
    "construir uma bomba",
    "arma explosiva",
    "sprengstoff bauen",
)


def _safety_check(text: str) -> SafetyResponse:
    lowered = text.lower()
    for term in BLOCKED_TERMS:
        if term in lowered:
            return SafetyResponse(safe=False, categories={"blocked_term": 4})
    return SafetyResponse(safe=True)


# ---------------------------------------------------------------------------
# Prompts test harness loader
# ---------------------------------------------------------------------------

_PROMPTS_PATH = Path(__file__).parent / "prompts" / "app3_prompt_test_harness.json"


def _load_prompts() -> dict:
    with _PROMPTS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="promptForge", version="0.2.0", root_path="/api/backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def remove_backend_prefix(request: Request, call_next):
    prefix = "/api/backend"
    if request.scope["path"].startswith(prefix):
        request.scope["path"] = request.scope["path"][len(prefix):]
    return await call_next(request)


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "app": "prompt-forge",
        "azure_openai_configured": client is not None,
        "deployment": DEPLOYMENT or None,
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest) -> GenerateResponse:
    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI is not configured.",
        )

    request_id = str(uuid.uuid4())
    system = system_prompt_for(req.persona)
    user_prompt = _build_user_prompt(req.brief, req.audience, req.format)

    started = time.perf_counter()
    try:
        response = client.with_options(
            timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
            max_retries=0,
        ).responses.parse(
            model=DEPLOYMENT,
            instructions=system,
            input=user_prompt,
            text_format=_ResultSchema,
            temperature=req.temperature,
            top_p=req.topP,
            max_output_tokens=min(req.maxTokens, AZURE_MAX_OUTPUT_TOKENS),
        )
    except Exception:
        log.exception("Azure OpenAI call failed.")
        log_append(brief=req.brief, persona=req.persona, tokens=0, cost=0.0, status="error")
        raise HTTPException(
            status_code=502,
            detail="Azure OpenAI request failed.",
        ) from None

    parsed: _ResultSchema | None = response.output_parsed
    if parsed is None or len(parsed.variations) != 3:
        log_append(brief=req.brief, persona=req.persona, tokens=0, cost=0.0, status="error")
        raise HTTPException(
            status_code=502,
            detail="Model did not return a structured response.",
        )

    variations: list[Variation] = []
    for index, v in enumerate(parsed.variations[:3], start=1):
        variations.append(
            Variation(
                id=index,
                title=v.title.strip(),
                body=v.body.strip(),
                seoKeywords=[k.strip() for k in v.seoKeywords if k.strip()][:3],
            )
        )

    usage = response.usage
    prompt_tokens = getattr(usage, "input_tokens", 0) or 0
    completion_tokens = getattr(usage, "output_tokens", 0) or 0
    total_tokens = prompt_tokens + completion_tokens
    cost = _compute_cost(prompt_tokens, completion_tokens)
    latency_ms = int((time.perf_counter() - started) * 1000)

    log_append(
        brief=req.brief,
        persona=req.persona,
        tokens=total_tokens,
        cost=cost,
        status="complete",
    )
    log.info(
        "Generated %d variations (tokens=%d, cost=$%s, latency=%dms).",
        len(variations),
        total_tokens,
        cost,
        latency_ms,
    )

    return GenerateResponse(
        data={"variations": variations},
        meta={
            "request_id": request_id,
            "latency_ms": latency_ms,
            "tokens": {
                "prompt": prompt_tokens,
                "completion": completion_tokens,
                "total": total_tokens,
            },
            "cost": cost,
            "persona": persona_name(req.persona),
        },
    )


@app.get("/log")
def get_log(limit: int = 20) -> dict:
    return {"data": [e.model_dump(mode="json") for e in log_recent(limit)]}


@app.post("/safety/check", response_model=SafetyResponse)
def safety_check(req: SafetyRequest) -> SafetyResponse:
    return _safety_check(req.text)


@app.get("/prompts")
def prompts() -> dict:
    data = _load_prompts()
    return {
        "data": [
            {
                "id": p["id"],
                "strategy": p["strategy"],
                "title": p["title"],
                "systemPrompt": p["systemPrompt"],
                "userPrompt": p["userPrompt"],
            }
            for p in data.get("prompts", [])
        ]
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
    )
