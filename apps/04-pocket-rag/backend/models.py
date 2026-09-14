import time
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

class DocumentItem(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size_bytes: int
    chunks_count: int
    created_at: str
    source: Literal["upload", "example"] = "upload"

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    chunks_created: int
    message: str

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    page_number: Optional[int] = None
    chunk_index: int
    content: str
    score: Optional[float] = None
    source: Literal["upload", "example"] = "upload"

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000, description="Question for RAG pipeline")
    top_k: int = Field(default=4, ge=1, le=10, description="Number of context chunks to retrieve")
    temperature: float = Field(default=0.3, ge=0.0, le=1.0)
    language: Literal["de", "en", "pt-BR"] = "de"
    scope: Literal["uploads", "examples", "all"] = "uploads"

    @field_validator("question")
    @classmethod
    def normalize_question(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Question is too short")
        return value

class SuggestionRequest(BaseModel):
    language: Literal["de", "en", "pt-BR"] = "de"

class SuggestionResponse(BaseModel):
    questions: list[str]
    generation_status: Literal["generated", "disabled", "not_needed"]

class Citation(BaseModel):
    citation_id: int
    document_id: str
    filename: str
    page_number: Optional[int] = None
    chunk_index: int
    snippet: str
    similarity_score: float
    source: Literal["upload", "example"] = "upload"

class QueryResponse(BaseModel):
    answer: str
    citations: list[Citation]
    retrieved_chunks: list[DocumentChunk]
    tokens_used: dict
    estimated_cost_usd: float
    latency_ms: float
    generation_status: Literal["generated", "disabled", "not_needed"]

    @classmethod
    def empty(cls, answer: str, started_at: float):
        return cls(
            answer=answer,
            citations=[],
            retrieved_chunks=[],
            tokens_used={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            estimated_cost_usd=0,
            latency_ms=round((time.perf_counter() - started_at) * 1000, 2),
            generation_status="not_needed",
        )

class SystemStats(BaseModel):
    total_documents: int
    total_chunks: int
    vector_store_type: str = "SQLite Vector (Local)"
