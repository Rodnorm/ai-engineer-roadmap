from typing import List, Literal, Optional
from pydantic import BaseModel, Field

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
    content: str
    score: Optional[float] = None

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=2, description="Question for RAG pipeline")
    top_k: int = Field(default=4, ge=1, le=10, description="Number of context chunks to retrieve")
    temperature: float = Field(default=0.3, ge=0.0, le=1.0)
    language: str = Field(default="de", description="Response language: de, en, or pt-BR")
    scope: Literal["uploads", "examples", "all"] = Field(
        default="uploads",
        description="Document collection to search",
    )

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
    citations: List[Citation]
    retrieved_chunks: List[DocumentChunk]
    tokens_used: dict
    estimated_cost_usd: float
    latency_ms: float

class SystemStats(BaseModel):
    total_documents: int
    total_chunks: int
    vector_store_type: str = "ChromaDB (Local)"
    monthly_cloud_savings_usd: float = 75.00
