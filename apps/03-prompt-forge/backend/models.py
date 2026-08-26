"""Pydantic schemas for the promptForge API."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    brief: str = Field(..., min_length=20, max_length=2000)
    audience: str | None = Field(default=None, max_length=200)
    format: Literal["linkedin", "email", "landing"] = "linkedin"
    persona: Literal["friendly", "technical", "cfo"] = "friendly"
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
    persona: str


class GenerateResponse(BaseModel):
    data: dict[str, list[Variation]]
    meta: GenerateMeta


class SafetyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)


class SafetyResponse(BaseModel):
    safe: bool
    categories: dict[str, int] = Field(default_factory=dict)


class RequestEntry(BaseModel):
    id: str
    brief: str
    persona: str
    tokens: int
    cost: float
    status: str
    createdAt: datetime
