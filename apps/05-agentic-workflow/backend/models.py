"""Pydantic data models for App 05 Agentic Workflow."""

from __future__ import annotations

import time
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AgentStep(BaseModel):
    step_index: int
    type: str  # "thought" | "tool_call" | "tool_result" | "waiting_approval" | "answer" | "error"
    title: str
    content: str
    tool_name: Optional[str] = None
    tool_args: Optional[Dict[str, Any]] = None
    tool_result: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)


class PendingApproval(BaseModel):
    tool_name: str
    tool_args: Dict[str, Any]
    message: str


class RunTaskRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=1000, description="Task prompt for the agent")
    session_id: Optional[str] = None


class ApproveTaskRequest(BaseModel):
    session_id: str = Field(..., min_length=1)
    approved: bool
    reason: Optional[str] = None


class AgentSessionResponse(BaseModel):
    session_id: str
    status: str  # "completed" | "waiting_approval" | "rejected" | "error"
    steps: List[AgentStep]
    final_answer: Optional[str] = None
    pending_approval: Optional[PendingApproval] = None
    request_id: str
