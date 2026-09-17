"""Core Agentic Workflow Engine for App 05."""

from __future__ import annotations

import hashlib
import json
import logging
import re
import secrets
import threading
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple
from openai import OpenAI

from models import AgentStep, PendingApproval
from tools import TOOLS_METADATA, TOOLS_SCHEMA

log = logging.getLogger("agentic-workflow")

SYSTEM_PROMPT = """You are an autonomous AI Agent equipped with specialized local tools.
Your goal is to solve the user's task step-by-step.

Available tools:
1. calculator(expression): Safely computes mathematical formulas.
2. knowledge_search(query): Searches internal policies, SLAs, and infrastructure specs.
3. send_alert(recipient, message): Sends operational alerts. NOTE: this tool requires explicit human confirmation before execution.

Rules:
- If a calculation or internal lookup is needed, invoke the corresponding tool.
- Think step by step before invoking tools.
- When all tool results are obtained, provide a concise, high-quality final answer.
"""


class AgentSessionState:
    def __init__(self, session_id: str, prompt: str, access_token_hash: str) -> None:
        now = time.time()
        self.session_id = session_id
        self.prompt = prompt
        self.access_token_hash = access_token_hash
        self.created_at = now
        self.last_accessed_at = now
        self.expires_at = now + SESSION_TTL_SECONDS
        self.status = "running"  # running, waiting_approval, completed, rejected, error
        self.steps: List[AgentStep] = []
        self.messages: List[Dict[str, Any]] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]
        self.pending_tool_call: Optional[Dict[str, Any]] = None
        self.final_answer: Optional[str] = None

    def add_step(
        self,
        step_type: str,
        title: str,
        content: str,
        tool_name: Optional[str] = None,
        tool_args: Optional[Dict[str, Any]] = None,
        tool_result: Optional[str] = None,
    ) -> AgentStep:
        step = AgentStep(
            step_index=len(self.steps) + 1,
            type=step_type,
            title=title,
            content=content,
            tool_name=tool_name,
            tool_args=tool_args,
            tool_result=tool_result,
        )
        self.steps.append(step)
        return step


# In-memory session registry. Access is bounded and protected by per-session bearer tokens.
SESSIONS: Dict[str, AgentSessionState] = {}
SESSION_TTL_SECONDS = 1800
MAX_SESSIONS = 500
_SESSION_LOCK = threading.RLock()


class SessionAccessError(ValueError):
    """Raised when a session is missing, expired, or accessed with an invalid token."""


def configure_session_store(ttl_seconds: int, max_sessions: int) -> None:
    global SESSION_TTL_SECONDS, MAX_SESSIONS
    if ttl_seconds < 60:
        raise ValueError("Session TTL must be at least 60 seconds")
    if max_sessions < 1:
        raise ValueError("MAX_SESSIONS must be at least 1")
    SESSION_TTL_SECONDS = ttl_seconds
    MAX_SESSIONS = max_sessions


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def cleanup_sessions(now: Optional[float] = None) -> int:
    current = now if now is not None else time.time()
    with _SESSION_LOCK:
        expired = [session_id for session_id, session in SESSIONS.items() if session.expires_at <= current]
        for session_id in expired:
            SESSIONS.pop(session_id, None)
        return len(expired)


def _evict_for_capacity() -> None:
    cleanup_sessions()
    with _SESSION_LOCK:
        while len(SESSIONS) >= MAX_SESSIONS:
            evictable = [item for item in SESSIONS.values() if item.status != "running"]
            candidates = evictable or list(SESSIONS.values())
            oldest = min(candidates, key=lambda item: item.last_accessed_at)
            SESSIONS.pop(oldest.session_id, None)


def _create_session(prompt: str) -> Tuple[AgentSessionState, str]:
    _evict_for_capacity()
    token = secrets.token_urlsafe(32)
    session = AgentSessionState(str(uuid.uuid4()), prompt, _token_hash(token))
    with _SESSION_LOCK:
        SESSIONS[session.session_id] = session
    return session, token


def get_authorized_session(
    session_id: str,
    session_token: Optional[str],
    now: Optional[float] = None,
) -> AgentSessionState:
    current = now if now is not None else time.time()
    cleanup_sessions(current)
    with _SESSION_LOCK:
        session = SESSIONS.get(session_id)
        if (
            session is None
            or not session_token
            or not secrets.compare_digest(session.access_token_hash, _token_hash(session_token))
        ):
            raise SessionAccessError("Session not found.")
        session.last_accessed_at = current
        session.expires_at = current + SESSION_TTL_SECONDS
        return session


def _mock_planner_step(prompt: str, iteration: int, session: AgentSessionState) -> Dict[str, Any]:
    """Deterministic fallback planner for offline environments, tests, or when LLM credentials are unset."""
    p_lower = prompt.lower()

    # Step 1: determine tool need
    if iteration == 1:
        # Check for alert intent
        if any(w in p_lower for w in ["alert", "alerta", "avise", "notifique", "notifiquem", "send alert", "envie"]):
            recipient = "@ops-channel"
            if "@" in prompt:
                words = prompt.split()
                for w in words:
                    if w.startswith("@"):
                        recipient = w
                        break
            return {
                "thought": "The user requested an operational alert notification. This triggers a sensitive action requiring human approval.",
                "tool_call": {
                    "name": "send_alert",
                    "arguments": {"recipient": recipient, "message": f"Operational notification: {prompt}"},
                },
            }

        # Check for math intent
        if any(w in p_lower for w in ["calcule", "calculate", "quanto", "sum", "soma", "total", "custo", "+", "*", "-", "/"]):
            # Extract math expression
            match = re.search(r"[\d\.\s\+\-\*\/\(\)]+", prompt)
            expr = match.group(0).strip() if match else "(25 * 40) + 150"
            if len(expr) < 3:
                expr = "(25 * 40) + 150"
            return {
                "thought": f"The user requested a calculation. Evaluating expression: {expr}",
                "tool_call": {
                    "name": "calculator",
                    "arguments": {"expression": expr},
                },
            }

        # Check for knowledge intent
        if any(w in p_lower for w in ["refund", "reembolso", "sla", "oncall", "on-call", "plantão", "server", "servidor", "policy", "política", "politica"]):
            query = "policy SLA infrastructure"
            for k in ["refund", "reembolso", "sla", "oncall", "server", "servidor"]:
                if k in p_lower:
                    query = k
                    break
            return {
                "thought": f"Searching internal documentation for information related to '{query}'.",
                "tool_call": {
                    "name": "knowledge_search",
                    "arguments": {"query": query},
                },
            }

        return {
            "thought": "No external tool required for this inquiry. Generating direct response.",
            "answer": f"I analyzed your request: '{prompt}'. As an autonomous agent, I am ready to evaluate mathematical expressions, query knowledge records, or coordinate notifications with your approval.",
        }

    # Subsequent iterations after receiving tool results
    last_step = session.steps[-1] if session.steps else None
    res = last_step.tool_result if last_step else "Tool executed successfully."
    return {
        "thought": "Tool execution completed. Synthesizing the final result for the user.",
        "answer": f"Task accomplished based on tool output: {res}",
    }


def run_agent_loop(
    prompt: str,
    session_id: Optional[str] = None,
    session_token: Optional[str] = None,
    client: Optional[OpenAI] = None,
    deployment: str = "",
    generation_enabled: bool = True,
    max_iterations: int = 4,
) -> Tuple[AgentSessionState, Optional[str]]:
    """Executes the agent reasoning loop until completion or until pausing for human approval."""
    issued_token: Optional[str] = None
    if session_id:
        session = get_authorized_session(session_id, session_token)
    else:
        session, issued_token = _create_session(prompt)

    iteration = 0
    while iteration < max_iterations:
        iteration += 1

        thought = ""
        tool_name = None
        tool_args: Dict[str, Any] = {}
        direct_answer: Optional[str] = None

        use_real_llm = client is not None and bool(deployment) and generation_enabled

        if use_real_llm:
            try:
                resp = client.chat.completions.create(
                    model=deployment,
                    messages=session.messages,
                    tools=TOOLS_SCHEMA,
                    tool_choice="auto",
                    max_tokens=800,
                    temperature=0.2,
                )
                msg = resp.choices[0].message
                if msg.content:
                    thought = msg.content
                if msg.tool_calls:
                    tc = msg.tool_calls[0]
                    tool_name = tc.function.name
                    try:
                        tool_args = json.loads(tc.function.arguments)
                    except Exception:
                        tool_args = {}
                else:
                    direct_answer = msg.content or "Completed."
            except Exception as err:
                log.warning(f"Real LLM call failed or unavailable ({err}), falling back to deterministic planner.")
                use_real_llm = False

        if not use_real_llm:
            plan = _mock_planner_step(session.prompt, iteration, session)
            thought = plan.get("thought", "Analyzing step...")
            if "tool_call" in plan:
                tool_name = plan["tool_call"]["name"]
                tool_args = plan["tool_call"]["arguments"]
            elif "answer" in plan:
                direct_answer = plan["answer"]

        # Record thought step
        if thought:
            session.add_step(
                step_type="thought",
                title=f"Reasoning (Iteration {iteration})",
                content=thought,
            )

        # Case 1: Agent decides to invoke a tool
        if tool_name and tool_name in TOOLS_METADATA:
            meta = TOOLS_METADATA[tool_name]
            session.add_step(
                step_type="tool_call",
                title=f"Calling Tool: {tool_name}",
                content=f"Arguments: {json.dumps(tool_args, ensure_ascii=False)}",
                tool_name=tool_name,
                tool_args=tool_args,
            )

            # Check if tool requires Human-in-the-Loop approval
            if meta.get("requires_approval", False):
                session.status = "waiting_approval"
                session.pending_tool_call = {
                    "tool_name": tool_name,
                    "tool_args": tool_args,
                }
                session.add_step(
                    step_type="waiting_approval",
                    title="Human Approval Required",
                    content=f"Tool '{tool_name}' requires human confirmation before dispatching.",
                    tool_name=tool_name,
                    tool_args=tool_args,
                )
                # Pause loop immediately and return for user decision
                return session, issued_token

            # Safe tool execution
            tool_fn = meta["fn"]
            try:
                result_str = tool_fn(**tool_args)
            except Exception as exc:
                result_str = f"Execution error: {str(exc)}"

            session.add_step(
                step_type="tool_result",
                title=f"Result: {tool_name}",
                content=result_str,
                tool_name=tool_name,
                tool_result=result_str,
            )

            # Update conversation history
            session.messages.append({
                "role": "assistant",
                "content": thought,
                "tool_calls": [{
                    "id": f"call_{iteration}",
                    "type": "function",
                    "function": {"name": tool_name, "arguments": json.dumps(tool_args)},
                }],
            })
            session.messages.append({
                "role": "tool",
                "tool_call_id": f"call_{iteration}",
                "content": result_str,
            })
            continue

        # Case 2: Agent has concluded with a final answer
        if direct_answer:
            session.final_answer = direct_answer
            session.status = "completed"
            session.add_step(
                step_type="answer",
                title="Final Answer",
                content=direct_answer,
            )
            return session, issued_token

    # Exceeded max iterations safely
    session.status = "completed"
    session.final_answer = session.final_answer or "Execution loop finished."
    session.add_step(
        step_type="answer",
        title="Execution Finished",
        content="Maximum iteration guard limit reached.",
    )
    return session, issued_token


def resume_agent_approval(
    session_id: str,
    session_token: str,
    approved: bool,
    reason: Optional[str] = None,
) -> AgentSessionState:
    """Resumes an agent paused in waiting_approval state based on human operator feedback."""
    session = get_authorized_session(session_id, session_token)
    if session.status != "waiting_approval" or not session.pending_tool_call:
        return session

    pending = session.pending_tool_call
    tool_name = pending["tool_name"]
    tool_args = pending["tool_args"]

    if approved:
        session.add_step(
            step_type="thought",
            title="Authorization Granted",
            content=f"Human operator approved execution of '{tool_name}'. Proceeding...",
        )
        tool_fn = TOOLS_METADATA[tool_name]["fn"]
        try:
            result_str = tool_fn(**tool_args)
        except Exception as exc:
            result_str = f"Execution error: {str(exc)}"

        session.add_step(
            step_type="tool_result",
            title=f"Result: {tool_name}",
            content=result_str,
            tool_name=tool_name,
            tool_result=result_str,
        )

        final_msg = f"Task completed successfully with your approval. {result_str}"
        session.final_answer = final_msg
        session.status = "completed"
        session.pending_tool_call = None
        session.add_step(
            step_type="answer",
            title="Final Answer",
            content=final_msg,
        )
    else:
        refusal_reason = reason or "Rejected by user."
        session.add_step(
            step_type="thought",
            title="Authorization Denied",
            content=f"Human operator cancelled '{tool_name}'. Reason: {refusal_reason}",
        )
        final_msg = f"Action cancelled: tool '{tool_name}' was not executed due to human disapproval."
        session.final_answer = final_msg
        session.status = "rejected"
        session.pending_tool_call = None
        session.add_step(
            step_type="answer",
            title="Operation Cancelled",
            content=final_msg,
        )

    return session
