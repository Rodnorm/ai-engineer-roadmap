"""Standard AI Application FastAPI backend starter.

Exposes:
    POST /process
    GET  /health
"""

import asyncio
import logging
import os
import time
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

from app.security.rate_limit import InMemoryRateLimiter

load_dotenv()


def _env_int(name: str, default: int, minimum: int = 1) -> int:
    raw = os.getenv(name, str(default))
    try:
        val = int(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc
    if val < minimum:
        raise RuntimeError(f"{name} must be at least {minimum}")
    return val


def _env_float(name: str, default: float, minimum: float = 0.0) -> float:
    raw = os.getenv(name, str(default))
    try:
        val = float(raw)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be a number") from exc
    if val < minimum:
        raise RuntimeError(f"{name} must be at least {minimum}")
    return val


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name, str(default)).strip().lower()
    return raw in {"1", "true", "yes", "on"}


APP_ENV = os.getenv("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("ai-app-template")

PORT = _env_int("PORT", 8000)
ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")

GENERATION_ENABLED = _env_bool("GENERATION_ENABLED", True)
AZURE_MAX_OUTPUT_TOKENS = _env_int("AZURE_MAX_OUTPUT_TOKENS", 800)
AZURE_REQUEST_TIMEOUT_SECONDS = _env_float("AZURE_REQUEST_TIMEOUT_SECONDS", 30.0)

MAX_CONCURRENT_REQUESTS = _env_int("MAX_CONCURRENT_REQUESTS", 2, 1)
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", True)
TRUST_PROXY_HEADERS = _env_bool("TRUST_PROXY_HEADERS", True)

rate_limiter = InMemoryRateLimiter(
    requests_per_minute=_env_int("RATE_LIMIT_REQUESTS_PER_MINUTE", 3),
    requests_per_day_per_ip=_env_int("RATE_LIMIT_REQUESTS_PER_DAY_PER_IP", 20),
    global_requests_per_day=_env_int("RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY", 100),
)


def _build_client() -> OpenAI | None:
    if not ENDPOINT or not DEPLOYMENT or not API_KEY:
        return None
    return OpenAI(base_url=ENDPOINT, api_key=API_KEY)


client: OpenAI | None = _build_client()


class ProcessRequest(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=2000)


class ProcessResponse(BaseModel):
    result: str
    requestId: str


app = FastAPI(
    title="AI App Template",
    version="1.0.0",
    root_path="/api/backend",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


def _client_ip(request: Request) -> str:
    if TRUST_PROXY_HEADERS:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",", maxsplit=1)[0].strip()
    return request.client.host if request.client else "unknown"


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "generation_enabled": GENERATION_ENABLED,
        "azure_openai_configured": client is not None,
        "rate_limit_enabled": RATE_LIMIT_ENABLED,
    }


@app.post("/process", response_model=ProcessResponse)
async def process(payload: ProcessRequest, request: Request):
    request_id = uuid.uuid4().hex[:12]
    start_time = time.monotonic()

    if not GENERATION_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="Service is temporarily disabled.",
        )

    if client is None:
        raise HTTPException(
            status_code=503,
            detail="Azure OpenAI is not configured.",
        )

    if RATE_LIMIT_ENABLED:
        decision = rate_limiter.check_and_record(_client_ip(request))
        if not decision.allowed:
            raise HTTPException(
                status_code=429,
                detail="Request limit reached. Please try again later.",
                headers={"Retry-After": str(decision.retry_after)},
            )

    if concurrency_semaphore.locked():
        raise HTTPException(
            status_code=429,
            detail="Server is busy processing other requests.",
        )

    async with concurrency_semaphore:
        try:
            response = client.with_options(
                timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
                max_retries=0,
            ).chat.completions.create(
                model=DEPLOYMENT,
                messages=[{"role": "user", "content": payload.prompt}],
                max_tokens=AZURE_MAX_OUTPUT_TOKENS,
            )
            out_text = response.choices[0].message.content or ""
        except Exception:
            log.exception("[%s] Azure OpenAI request failed.", request_id)
            raise HTTPException(
                status_code=502,
                detail=f"Azure OpenAI request failed. (Request ID: {request_id})",
            ) from None

    elapsed_ms = int((time.monotonic() - start_time) * 1000)
    log.info("[%s] Request completed in %d ms.", request_id, elapsed_ms)
    return ProcessResponse(result=out_text.strip(), requestId=request_id)
