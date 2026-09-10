"""App 05: Agentic Workflow FastAPI Backend.

Provides autonomous agent execution with multi-tool calling and Human-in-the-Loop approval.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
import uuid
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI

from agent import SESSIONS, resume_agent_approval, run_agent_loop
from models import AgentSessionResponse, ApproveTaskRequest, PendingApproval, RunTaskRequest
from rate_limit import InMemoryRateLimiter

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

RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", True)
TRUST_PROXY_HEADERS = _env_bool("TRUST_PROXY_HEADERS", True)

rate_limiter = InMemoryRateLimiter(
    requests_per_minute=_env_int("RATE_LIMIT_REQUESTS_PER_MINUTE", 10),
    requests_per_day_per_ip=_env_int("RATE_LIMIT_REQUESTS_PER_DAY_PER_IP", 100),
    global_requests_per_day=_env_int("RATE_LIMIT_GLOBAL_REQUESTS_PER_DAY", 500),
)


def _build_client() -> Optional[OpenAI]:
    if not ENDPOINT or not DEPLOYMENT or not API_KEY:
        log.info("Azure OpenAI credentials not configured. Using deterministic offline agent planner.")
        return None
    try:
        return OpenAI(
            base_url=ENDPOINT,
            api_key=API_KEY,
            timeout=AZURE_REQUEST_TIMEOUT_SECONDS,
        )
    except Exception as exc:
        log.warning(f"Could not build OpenAI client ({exc}). Defaulting to offline planner.")
        return None


client: Optional[OpenAI] = _build_client()


def _get_client_ip(request: Request) -> str:
    if TRUST_PROXY_HEADERS:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
            session = run_agent_loop(
                prompt=req.prompt,
                session_id=req.session_id,
                client=client,
                deployment=DEPLOYMENT,
                generation_enabled=GENERATION_ENABLED,
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
                status=session.status,
                steps=session.steps,
                final_answer=session.final_answer,
                pending_approval=pending,
                request_id=request_id,
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
            approved=req.approved,
            reason=req.reason,
        )

        return AgentSessionResponse(
            session_id=session.session_id,
            status=session.status,
            steps=session.steps,
            final_answer=session.final_answer,
            pending_approval=None,
            request_id=request_id,
        )
    except ValueError as val_err:
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
async def get_session_endpoint(session_id: str):
    request_id = str(uuid.uuid4())
    if session_id not in SESSIONS:
        raise HTTPException(
            status_code=404,
            detail={"requestId": request_id, "code": "SESSION_NOT_FOUND", "message": "Session not found."},
        )
    session = SESSIONS[session_id]
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
        status=session.status,
        steps=session.steps,
        final_answer=session.final_answer,
        pending_approval=pending,
        request_id=request_id,
    )
