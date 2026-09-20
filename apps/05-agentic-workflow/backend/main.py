"""App 05: Agentic Workflow FastAPI Backend.

Provides autonomous agent execution with multi-tool calling and Human-in-the-Loop approval.
"""

from __future__ import annotations

import asyncio
import logging
import os
import uuid
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import AzureOpenAI, OpenAI

from agent import (
    SessionAccessError,
    configure_session_store,
    get_authorized_session,
    resume_agent_approval,
    run_agent_loop,
)
from models import AgentSessionResponse, ApproveTaskRequest, PendingApproval, RunTaskRequest
from client_ip import parse_trusted_proxy_cidrs, resolve_client_ip
from rate_limit import PersistentRateLimiter
from telemetry import metrics_collector

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
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
log = logging.getLogger("agentic-workflow-api")

PORT = _env_int("PORT", 8005)
ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")

GENERATION_ENABLED = _env_bool("GENERATION_ENABLED", True)
AZURE_MAX_OUTPUT_TOKENS = _env_int("AZURE_MAX_OUTPUT_TOKENS", 800)
AZURE_REQUEST_TIMEOUT_SECONDS = _env_float("AZURE_REQUEST_TIMEOUT_SECONDS", 30.0)

MAX_CONCURRENT_REQUESTS = _env_int("MAX_CONCURRENT_REQUESTS", 2, 1)
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
configure_session_store(
    ttl_seconds=_env_int("SESSION_TTL_SECONDS", 1800, 60),
    max_sessions=_env_int("MAX_SESSIONS", 500, 1),
)

RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", True)
RATE_LIMIT_HASH_KEY = os.getenv("RATE_LIMIT_HASH_KEY", "")
if IS_PRODUCTION and RATE_LIMIT_ENABLED and len(RATE_LIMIT_HASH_KEY) < 32:
    raise RuntimeError(
        "RATE_LIMIT_HASH_KEY must contain at least 32 characters in production."
    )
TRUST_PROXY_HEADERS = _env_bool("TRUST_PROXY_HEADERS", False)
TRUSTED_PROXY_CIDRS = parse_trusted_proxy_cidrs(os.getenv("TRUSTED_PROXY_CIDRS", ""))

rate_limiter = PersistentRateLimiter(
    requests_per_minute=_env_int("RATE_LIMIT_REQUESTS_PER_MINUTE", 10),
    requests_per_day_per_ip=_env_int("RATE_LIMIT_REQUESTS_PER_DAY_PER_IP", 100),
    global_requests_per_day=_env_int("RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY", 500),
    database_path=os.getenv(
        "RATE_LIMIT_DB_PATH",
        "/data/rate-limit.sqlite3" if IS_PRODUCTION else "./data/rate-limit.sqlite3",
    ),
    key_secret=RATE_LIMIT_HASH_KEY or "development-only-rate-limit-key",
)


API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")


def _build_client() -> Optional[Any]:
    if not ENDPOINT or not DEPLOYMENT or not API_KEY:
        log.info("Azure OpenAI credentials not configured. Using deterministic offline agent planner.")
        return None
    try:
        if "/openai/v1" in ENDPOINT:
            return OpenAI(
                base_url=ENDPOINT,
                api_key=API_KEY,
                timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
            )
        if AzureOpenAI:
            return AzureOpenAI(
                azure_endpoint=ENDPOINT,
                api_key=API_KEY,
                api_version=API_VERSION,
                timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
            )
        return OpenAI(
            base_url=f"{ENDPOINT}/openai/v1",
            api_key=API_KEY,
            timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
        )
    except Exception as exc:
        log.warning(f"Could not build OpenAI client ({exc}). Defaulting to offline planner.")
        return None


client: Optional[Any] = _build_client()


def _get_client_ip(request: Request) -> str:
    return resolve_client_ip(
        request.client.host if request.client else None,
        request.headers.get("x-forwarded-for"),
        TRUST_PROXY_HEADERS,
        TRUSTED_PROXY_CIDRS,
    )


app = FastAPI(
    title="App 05: Agentic Workflow Backend",
    version="1.0.0",
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
)

# CORS
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3005")
allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Session-Token"],
)


@app.get("/health")
async def health_check():
    """Sanitized health check exposing no internal infrastructure details."""
    return {
        "status": "healthy",
        "service": "05-agentic-workflow",
        "environment": APP_ENV,
        "generation_enabled": GENERATION_ENABLED,
    }


@app.post("/api/agent/run", response_model=AgentSessionResponse)
async def run_agent_endpoint(req: RunTaskRequest, request: Request):
    request_id = str(uuid.uuid4())
    client_ip = _get_client_ip(request)

    if RATE_LIMIT_ENABLED:
        decision = rate_limiter.check_and_record(client_ip)
        if not decision.allowed:
            raise HTTPException(
                status_code=429,
                detail={"requestId": request_id, "code": "RATE_LIMITED", "message": "Rate limit exceeded. Please retry later."},
            )

    if not GENERATION_ENABLED:
        raise HTTPException(
            status_code=503,
            detail={"requestId": request_id, "code": "SERVICE_DISABLED", "message": "Agent execution is temporarily disabled by admin kill-switch."},
        )

    try:
        async with concurrency_semaphore:
            session, issued_token = run_agent_loop(
                prompt=req.prompt,
                session_id=req.session_id,
                session_token=req.session_token,
                client=client,
                deployment=DEPLOYMENT,
                generation_enabled=GENERATION_ENABLED,
                request_id=request_id,
            )

            pending = None
            if session.status == "waiting_approval" and session.pending_tool_call:
                tc = session.pending_tool_call
                pending = PendingApproval(
                    tool_name=tc["tool_name"],
                    tool_args=tc["tool_args"],
                    message=f"Agent wants to execute '{tc['tool_name']}'. Confirmation is required.",
                )

            return AgentSessionResponse(
                session_id=session.session_id,
                session_token=issued_token or req.session_token or "",
                status=session.status,
                steps=session.steps,
                final_answer=session.final_answer,
                pending_approval=pending,
                request_id=request_id,
            )
    except SessionAccessError:
        raise HTTPException(
            status_code=404,
            detail={"requestId": request_id, "code": "SESSION_NOT_FOUND", "message": "Session not found."},
        )
    except Exception as exc:
        log.error(f"Error executing agent run [{request_id}]: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"requestId": request_id, "code": "AGENT_ERROR", "message": "An internal error occurred during agent execution."},
        )


@app.post("/api/agent/approve", response_model=AgentSessionResponse)
async def approve_agent_endpoint(req: ApproveTaskRequest, request: Request):
    request_id = str(uuid.uuid4())
    client_ip = _get_client_ip(request)

    if RATE_LIMIT_ENABLED:
        decision = rate_limiter.check_and_record(client_ip)
        if not decision.allowed:
            raise HTTPException(
                status_code=429,
                detail={"requestId": request_id, "code": "RATE_LIMITED", "message": "Rate limit exceeded. Please retry later."},
            )

    try:
        session = resume_agent_approval(
            session_id=req.session_id,
            session_token=req.session_token,
            approved=req.approved,
            reason=req.reason,
        )

        return AgentSessionResponse(
            session_id=session.session_id,
            session_token=req.session_token,
            status=session.status,
            steps=session.steps,
            final_answer=session.final_answer,
            pending_approval=None,
            request_id=request_id,
        )
    except SessionAccessError as val_err:
        raise HTTPException(
            status_code=404,
            detail={"requestId": request_id, "code": "SESSION_NOT_FOUND", "message": str(val_err)},
        )
    except Exception as exc:
        log.error(f"Error approving agent task [{request_id}]: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"requestId": request_id, "code": "AGENT_ERROR", "message": "An error occurred resuming agent session."},
        )


@app.get("/api/agent/session/{session_id}", response_model=AgentSessionResponse)
async def get_session_endpoint(
    session_id: str,
    session_token: str = Header(alias="X-Session-Token"),
):
    request_id = str(uuid.uuid4())
    try:
        session = get_authorized_session(session_id, session_token)
    except SessionAccessError:
        raise HTTPException(
            status_code=404,
            detail={"requestId": request_id, "code": "SESSION_NOT_FOUND", "message": "Session not found."},
        )

    pending = None
    if session.status == "waiting_approval" and session.pending_tool_call:
        tc = session.pending_tool_call
        pending = PendingApproval(
            tool_name=tc["tool_name"],
            tool_args=tc["tool_args"],
            message=f"Action '{tc['tool_name']}' pending approval.",
        )

    return AgentSessionResponse(
        session_id=session.session_id,
        session_token=session_token,
        status=session.status,
        steps=session.steps,
        final_answer=session.final_answer,
        pending_approval=pending,
        request_id=request_id,
    )


@app.get("/api/metrics")
@app.get("/metrics")
def get_metrics():
    """Operational metrics: request count, error rate, p50/p95 latency, token totals."""
    return metrics_collector.get_summary()

