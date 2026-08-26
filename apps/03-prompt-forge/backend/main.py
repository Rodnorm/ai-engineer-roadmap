"""promptForge FastAPI backend.

Endpoints (base path: /api/backend):
    GET  /health
    POST /generate        generate 3 structured content variations
    POST /generate/stream stream structured generation using SSE
    GET  /log             list recent requests
    POST /safety/check    simple safety check (heuristic)
    GET  /prompts         list prompts bundled with the app

Authentication uses AZURE_OPENAI_API_KEY. See .env.example.
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import unicodedata
import uuid
from pathlib import Path

from dotenv import load_dotenv
from azure.ai.contentsafety import ContentSafetyClient
from azure.ai.contentsafety.models import AnalyzeTextOptions, TextCategory
from azure.core.credentials import AzureKeyCredential
from azure.core.exceptions import AzureError
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for field in (
            "request_id",
            "method",
            "path",
            "status_code",
            "latency_ms",
            "tokens",
            "cost",
            "variation_count",
        ):
            if hasattr(record, field):
                payload[field] = getattr(record, field)
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
logging.basicConfig(level=LOG_LEVEL, handlers=[handler], force=True)
log = logging.getLogger("prompt-forge")

ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
PORT = _env_int("PORT", 8000)

AZURE_MAX_OUTPUT_TOKENS = _env_int("AZURE_MAX_OUTPUT_TOKENS", 700, 1)
AZURE_REQUEST_TIMEOUT_SECONDS = _env_float("AZURE_REQUEST_TIMEOUT_SECONDS", 30.0, 1.0)

CONTENT_SAFETY_ENDPOINT = os.getenv("AZURE_CONTENT_SAFETY_ENDPOINT", "").rstrip("/")
CONTENT_SAFETY_API_KEY = os.getenv("AZURE_CONTENT_SAFETY_API_KEY", "")

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


def _build_content_safety_client() -> ContentSafetyClient | None:
    if not CONTENT_SAFETY_ENDPOINT or not CONTENT_SAFETY_API_KEY:
        return None
    return ContentSafetyClient(
        CONTENT_SAFETY_ENDPOINT,
        AzureKeyCredential(CONTENT_SAFETY_API_KEY),
    )


content_safety_client = _build_content_safety_client()
if content_safety_client is None:
    log.warning("Azure Content Safety is not configured. Using the local heuristic.")
else:
    log.info("Azure Content Safety client ready (endpoint=%s).", CONTENT_SAFETY_ENDPOINT)


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
LANGUAGE_NAMES = {
    "en": "English",
    "pt-br": "Brazilian Portuguese",
    "de": "German",
}
DEFAULT_LANGUAGE = "en"


def _build_user_prompt(brief: str, audience: str | None, format_id: str, language: str) -> str:
    fmt_label = FORMAT_NAMES.get(format_id, FORMAT_NAMES[DEFAULT_FORMAT])
    language_name = LANGUAGE_NAMES.get(language.lower(), LANGUAGE_NAMES[DEFAULT_LANGUAGE])
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
        f"Write every title, body, and SEO keyword in {language_name}. "
        "Return JSON with shape: "
        '{"variations":[{"id":1,"title":"...","body":"...","seoKeywords":["..."]}, ...]}.'
    )


def _compute_cost(prompt_tokens: int, completion_tokens: int) -> float:
    return round(
        (prompt_tokens / 1000) * COST_PROMPT_PER_1K
        + (completion_tokens / 1000) * COST_COMPLETION_PER_1K,
        6,
    )


def _variations_from_result(parsed: _ResultSchema) -> list[Variation]:
    return [
        Variation(
            id=index,
            title=variation.title.strip(),
            body=variation.body.strip(),
            seoKeywords=[keyword.strip() for keyword in variation.seoKeywords if keyword.strip()][
                :3
            ],
        )
        for index, variation in enumerate(parsed.variations[:3], start=1)
    ]


def _sse_event(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _complete_variations_from_json(text: str) -> list[Variation]:
    marker_index = text.find('"variations"')
    array_index = text.find("[", marker_index)
    if marker_index < 0 or array_index < 0:
        return []

    variations: list[Variation] = []
    object_start: int | None = None
    depth = 0
    in_string = False
    escaped = False

    for index in range(array_index + 1, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == "{":
            if depth == 0:
                object_start = index
            depth += 1
        elif char == "}" and depth > 0:
            depth -= 1
            if depth == 0 and object_start is not None:
                candidate = _VariationSchema.model_validate_json(text[object_start : index + 1])
                variations.append(
                    Variation(
                        id=len(variations) + 1,
                        title=candidate.title.strip(),
                        body=candidate.body.strip(),
                        seoKeywords=[
                            keyword.strip()
                            for keyword in candidate.seoKeywords
                            if keyword.strip()
                        ][:3],
                    )
                )
                object_start = None
    return variations


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

BLOCKED_PATTERNS = (
    re.compile(
        r"\b(?:fazer|montar|construir|fabricar|criar|produzir)\b.{0,40}"
        r"\b(?:bomba|explosivo|arma)\b"
    ),
    re.compile(
        r"\b(?:build|make|construct|assemble|create)\b.{0,40}"
        r"\b(?:bomb|weapon|explosive)\b"
    ),
    re.compile(
        r"\b(?:bauen|herstellen|montieren)\b.{0,40}"
        r"\b(?:bombe|sprengstoff|waffe)\b"
    ),
)

SELF_HARM_PATTERNS = (
    re.compile(r"\bauto\s*-?\s*mutila\w*\b"),
    re.compile(r"\bauto\s*-?\s*agress\w*\b"),
    re.compile(r"\b(?:suicid\w*|se matar|tirar a propria vida)\b"),
    re.compile(r"\b(?:self\s*-?\s*harm\w*|self\s*-?\s*mutilat\w*|suicid\w*)\b"),
    re.compile(r"\b(?:selbstverletz\w*|selbstmord\w*|suizid\w*)\b"),
)


def _normalize_safety_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text.lower())
    return "".join(char for char in normalized if not unicodedata.combining(char))


def _is_locally_blocked(text: str) -> bool:
    return bool(_local_safety_categories(text))


def _local_safety_categories(text: str) -> dict[str, int]:
    normalized = _normalize_safety_text(text)
    categories: dict[str, int] = {}
    if any(term in normalized for term in BLOCKED_TERMS) or any(
        pattern.search(normalized) for pattern in BLOCKED_PATTERNS
    ):
        categories["violence"] = 4
    if any(pattern.search(normalized) for pattern in SELF_HARM_PATTERNS):
        categories["self_harm"] = 4
    return categories


def _safety_check(text: str, request_id: str | None = None) -> SafetyResponse:
    local_categories = _local_safety_categories(text)
    if local_categories:
        return SafetyResponse(
            safe=False,
            severity=[f"{name}: {value}" for name, value in local_categories.items()],
            categories=local_categories,
        )

    if content_safety_client is None:
        return SafetyResponse(safe=True)

    try:
        response = content_safety_client.analyze_text(AnalyzeTextOptions(text=text))
    except AzureError:
        log.exception("content_safety_request_failed", extra={"request_id": request_id})
        raise HTTPException(
            status_code=502,
            detail="Azure Content Safety request failed.",
        ) from None

    category_names = {
        TextCategory.HATE: "hate",
        TextCategory.SELF_HARM: "self_harm",
        TextCategory.SEXUAL: "sexual",
        TextCategory.VIOLENCE: "violence",
    }
    categories = {
        category_names[item.category]: item.severity or 0
        for item in response.categories_analysis
        if item.category in category_names
    }
    severity = [f"{name}: {value}" for name, value in categories.items() if value > 0]
    return SafetyResponse(
        safe=all(value < 2 for value in categories.values()),
        severity=severity,
        categories=categories,
    )

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
async def request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    prefix = "/api/backend"
    if request.scope["path"].startswith(prefix):
        request.scope["path"] = request.scope["path"][len(prefix):]
    started = time.perf_counter()
    response = await call_next(request)
    latency_ms = int((time.perf_counter() - started) * 1000)
    response.headers["x-request-id"] = request_id
    log.info(
        "request_completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.scope["path"],
            "status_code": response.status_code,
            "latency_ms": latency_ms,
        },
    )
    return response


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "app": "prompt-forge",
        "azure_openai_configured": client is not None,
        "deployment": DEPLOYMENT or None,
        "safety_configured": content_safety_client is not None,
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest, request: Request) -> GenerateResponse:
    safety = _safety_check(req.brief, request.state.request_id)
    if not safety.safe:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "unsafe_content",
                "message": "The brief was blocked by Content Safety.",
                "categories": safety.categories,
            },
        )

    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI is not configured.",
        )

    request_id = request.state.request_id
    system = system_prompt_for(req.persona)
    user_prompt = _build_user_prompt(req.brief, req.audience, req.format, req.language)

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
        log.exception("azure_openai_request_failed", extra={"request_id": request_id})
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

    variations = _variations_from_result(parsed)

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
        "generation_completed",
        extra={
            "request_id": request_id,
            "latency_ms": latency_ms,
            "tokens": total_tokens,
            "cost": cost,
            "variation_count": len(variations),
        },
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


@app.post("/generate/stream")
def generate_stream(req: GenerateRequest, request: Request) -> StreamingResponse:
    request_id = request.state.request_id
    safety = _safety_check(req.brief, request_id)
    if not safety.safe:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "unsafe_content",
                "message": "The brief was blocked by Content Safety.",
                "categories": safety.categories,
            },
        )
    if client is None:
        raise HTTPException(status_code=503, detail="Azure OpenAI is not configured.")

    system = system_prompt_for(req.persona)
    user_prompt = _build_user_prompt(req.brief, req.audience, req.format, req.language)

    def events():
        started = time.perf_counter()
        streamed_text = ""
        emitted_variations = 0
        yield _sse_event(
            "safety",
            {"safe": safety.safe, "categories": safety.categories},
        )
        yield _sse_event("start", {"request_id": request_id})
        try:
            with client.with_options(
                timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
                max_retries=0,
            ).responses.stream(
                model=DEPLOYMENT,
                instructions=system,
                input=user_prompt,
                text_format=_ResultSchema,
                temperature=req.temperature,
                top_p=req.topP,
                max_output_tokens=min(req.maxTokens, AZURE_MAX_OUTPUT_TOKENS),
            ) as stream:
                for event in stream:
                    if event.type == "response.output_text.delta":
                        streamed_text += event.delta
                        yield _sse_event("delta", {"text": event.delta})
                        complete_variations = _complete_variations_from_json(streamed_text)
                        for variation in complete_variations[emitted_variations:]:
                            yield _sse_event(
                                "variation",
                                {"variation": variation.model_dump(mode="json")},
                            )
                            emitted_variations += 1
                response = stream.get_final_response()
        except Exception:
            log.exception("azure_openai_stream_failed", extra={"request_id": request_id})
            log_append(
                brief=req.brief,
                persona=req.persona,
                tokens=0,
                cost=0.0,
                status="error",
            )
            yield _sse_event("error", {"message": "Azure OpenAI stream failed."})
            return

        parsed: _ResultSchema | None = response.output_parsed
        if parsed is None or len(parsed.variations) != 3:
            log_append(
                brief=req.brief,
                persona=req.persona,
                tokens=0,
                cost=0.0,
                status="error",
            )
            yield _sse_event("error", {"message": "Invalid structured response."})
            return

        variations = _variations_from_result(parsed)
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
            "generation_stream_completed",
            extra={
                "request_id": request_id,
                "latency_ms": latency_ms,
                "tokens": total_tokens,
                "cost": cost,
                "variation_count": len(variations),
            },
        )
        result = GenerateResponse(
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
        yield _sse_event("result", result.model_dump(mode="json"))

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/log")
def get_log(limit: int = 20) -> dict:
    return {"data": [e.model_dump(mode="json") for e in log_recent(limit)]}


@app.post("/safety/check", response_model=SafetyResponse)
def safety_check(req: SafetyRequest, request: Request) -> SafetyResponse:
    return _safety_check(req.text, request.state.request_id)


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
