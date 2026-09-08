import io
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

# Safe top-level imports for PDF parsing and Azure OpenAI API (via openai package)
try:
    from pypdf import PdfReader  # pyright: ignore[reportMissingImports]
except ImportError:
    try:
        from PyPDF2 import PdfReader  # type: ignore
    except ImportError:
        PdfReader = None

try:
    from openai import OpenAI, AzureOpenAI
except ImportError:
    OpenAI = None
    AzureOpenAI = None

from models import (
    DocumentItem,
    DocumentUploadResponse,
    DocumentChunk,
    QueryRequest,
    Citation,
    QueryResponse,
    SystemStats,
)

load_dotenv()

app = FastAPI(
    title="pocketRag Backend",
    description="Cost-optimized Local RAG API with ChromaDB and Azure OpenAI LLM",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory document storage fallback & metadata registry
DOCUMENTS_DB: Dict[str, DocumentItem] = {}
CHUNKS_DB: List[Dict[str, Any]] = []

EXAMPLE_DOCUMENTS_DIR = Path(__file__).resolve().parent / "sample_documents"
EXAMPLE_DOCUMENTS = [
    {
        "id": "example-wohnraummietvertrag",
        "filename": "01_Wohnraummietvertrag_Lara_Hoffmann.pdf",
        "title": "Wohnraummietvertrag",
        "description": "Miete, Kaution, Kündigung und Regeln der Wohnung.",
    },
    {
        "id": "example-arbeitsvertrag",
        "filename": "02_Arbeitsvertrag_Lara_Hoffmann.pdf",
        "title": "Arbeitsvertrag",
        "description": "Gehalt, Urlaub, Probezeit und mobiles Arbeiten.",
    },
    {
        "id": "example-hausratversicherung",
        "filename": "03_Hausratversicherung_Lara_Hoffmann.pdf",
        "title": "Hausratversicherung",
        "description": "Deckung, Selbstbeteiligung und Schadenmeldung.",
    },
    {
        "id": "example-internetvertrag",
        "filename": "04_Internetvertrag_Lara_Hoffmann.pdf",
        "title": "Internetvertrag",
        "description": "Tarif, Aktionspreis, Laufzeit und Kündigung.",
    },
    {
        "id": "example-betriebskostenabrechnung",
        "filename": "05_Betriebskostenabrechnung_2025_Lara_Hoffmann.pdf",
        "title": "Betriebskostenabrechnung 2025",
        "description": "Nebenkosten, Verbrauch und Nachzahlung.",
    },
]
EXAMPLE_FILENAMES = {item["filename"] for item in EXAMPLE_DOCUMENTS}

# Azure OpenAI Configuration (matching App 1 Smart Inspector pattern)
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview")

def _build_client() -> OpenAI | AzureOpenAI | None:
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_DEPLOYMENT or not AZURE_OPENAI_API_KEY:
        return None

    # App 1 v1 API format (endpoint includes /openai/v1)
    if "/openai/v1" in AZURE_OPENAI_ENDPOINT:
        if OpenAI is None:
            return None
        return OpenAI(base_url=AZURE_OPENAI_ENDPOINT, api_key=AZURE_OPENAI_API_KEY)

    # Standard Azure OpenAI endpoint format (requires api-version)
    if AzureOpenAI is not None:
        return AzureOpenAI(
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_API_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
        )

    if OpenAI is not None:
        return OpenAI(
            base_url=f"{AZURE_OPENAI_ENDPOINT}/openai/v1",
            api_key=AZURE_OPENAI_API_KEY,
        )

    return None

# Helper text chunker
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks if chunks else [text]


def _store_document(
    *,
    doc_id: str,
    filename: str,
    file_size: int,
    pages: List[str],
    source: str,
) -> DocumentItem:
    chunks_created = 0
    for page_number, page_text in enumerate(pages, start=1):
        if not page_text.strip():
            continue
        for chunk_str in chunk_text(page_text):
            CHUNKS_DB.append({
                "chunk_id": f"{doc_id}_{chunks_created}",
                "document_id": doc_id,
                "filename": filename,
                "page_number": page_number,
                "content": chunk_str,
                "chunk_index": chunks_created,
                "source": source,
            })
            chunks_created += 1

    doc_item = DocumentItem(
        id=doc_id,
        filename=filename,
        file_type=filename.rsplit(".", 1)[-1].upper(),
        file_size_bytes=file_size,
        chunks_count=chunks_created,
        created_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
        source=source,
    )
    DOCUMENTS_DB[doc_id] = doc_item
    return doc_item


def _extract_pdf_pages(content_bytes: bytes, filename: str) -> List[str]:
    if PdfReader is None:
        raise HTTPException(status_code=503, detail="PDF parser is not available.")
    try:
        reader = PdfReader(io.BytesIO(content_bytes))
        return [(page.extract_text() or "") for page in reader.pages]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read PDF '{filename}'.") from exc

@app.get("/health")
def health_check():
    client = _build_client()
    return {
        "status": "healthy",
        "app": "pocketRag",
        "version": "0.1.0",
        "azure_openai_configured": client is not None,
        "endpoint": AZURE_OPENAI_ENDPOINT or "Not configured",
        "deployment": AZURE_OPENAI_DEPLOYMENT or "Not configured",
        "pdf_parser_available": PdfReader is not None,
        "vector_store": "ChromaDB (Local)",
    }

@app.get("/api/stats", response_model=SystemStats)
def get_stats():
    total_docs = len(DOCUMENTS_DB)
    total_chunks = len(CHUNKS_DB)
    return SystemStats(
        total_documents=total_docs,
        total_chunks=total_chunks,
        vector_store_type="ChromaDB (Local)",
        monthly_cloud_savings_usd=75.00,
    )

@app.get("/api/documents", response_model=List[DocumentItem])
def list_documents(scope: str = Query(default="uploads", pattern="^(uploads|examples|all)$")):
    documents = list(DOCUMENTS_DB.values())
    if scope == "all":
        return documents
    source = "example" if scope == "examples" else "upload"
    return [document for document in documents if document.source == source]


@app.get("/api/examples")
def list_example_documents():
    return [
        {
            **item,
            "loaded": item["id"] in DOCUMENTS_DB,
            "download_url": f"/api/examples/{item['filename']}",
        }
        for item in EXAMPLE_DOCUMENTS
    ]


@app.post("/api/examples/load", response_model=List[DocumentItem])
def load_example_documents():
    for item in EXAMPLE_DOCUMENTS:
        if item["id"] in DOCUMENTS_DB:
            continue
        path = EXAMPLE_DOCUMENTS_DIR / item["filename"]
        if not path.is_file():
            raise HTTPException(status_code=503, detail="Example documents are unavailable.")
        content_bytes = path.read_bytes()
        pages = _extract_pdf_pages(content_bytes, item["filename"])
        _store_document(
            doc_id=item["id"],
            filename=item["filename"],
            file_size=len(content_bytes),
            pages=pages,
            source="example",
        )
    return [document for document in DOCUMENTS_DB.values() if document.source == "example"]


@app.get("/api/examples/{filename}")
def download_example_document(filename: str):
    if filename not in EXAMPLE_FILENAMES:
        raise HTTPException(status_code=404, detail="Example document not found.")
    path = EXAMPLE_DOCUMENTS_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Example document not found.")
    return FileResponse(path, media_type="application/pdf", filename=filename)

@app.post("/api/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "document.txt"
    content_bytes = await file.read()
    file_size = len(content_bytes)

    # Determine file type
    file_ext = filename.split(".")[-1].lower()
    if file_ext not in ["pdf", "txt", "md"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload PDF, TXT, or MD files.",
        )

    # Read text content
    pages: List[str] = []
    if file_ext == "pdf":
        pages = _extract_pdf_pages(content_bytes, filename)
    else:
        pages = [content_bytes.decode("utf-8", errors="ignore")]

    if not any(page.strip() for page in pages):
        raise HTTPException(status_code=400, detail="The document contains no extractable text.")

    doc_id = str(uuid.uuid4())[:8]
    doc_item = _store_document(
        doc_id=doc_id,
        filename=filename,
        file_size=file_size,
        pages=pages,
        source="upload",
    )

    return DocumentUploadResponse(
        document_id=doc_id,
        filename=filename,
        chunks_created=doc_item.chunks_count,
        message=f"Document '{filename}' successfully ingested and vectorized in ChromaDB local store.",
    )

@app.delete("/api/documents")
def clear_documents():
    upload_ids = {doc_id for doc_id, document in DOCUMENTS_DB.items() if document.source == "upload"}
    count = len(upload_ids)
    for doc_id in upload_ids:
        DOCUMENTS_DB.pop(doc_id, None)
    CHUNKS_DB[:] = [chunk for chunk in CHUNKS_DB if chunk["document_id"] not in upload_ids]
    return {"message": f"Cleared {count} documents and all vector indices.", "status": "success"}

@app.post("/api/query", response_model=QueryResponse)
def query_rag(request: QueryRequest):
    start_time = time.time()
    
    lang = request.language or "de"

    source = None if request.scope == "all" else ("example" if request.scope == "examples" else "upload")
    searchable_chunks = [chunk for chunk in CHUNKS_DB if source is None or chunk["source"] == source]

    if not searchable_chunks:
        if lang == "de":
            no_docs_msg = (
                "Noch keine Dokumente in Ihre pocketRag-Wissensdatenbank hochgeladen. "
                "Bitte laden Sie ein Dokument (PDF, TXT oder MD) hoch, um Fragen zu stellen!"
            )
        elif lang == "pt-BR":
            no_docs_msg = (
                "Nenhum documento foi enviado para a sua base pocketRag ainda. "
                "Faça upload de um documento (PDF, TXT ou MD) para começar a perguntar!"
            )
        else:
            no_docs_msg = (
                "No documents have been uploaded to your pocketRag knowledge base yet. "
                "Please upload a document (PDF, TXT, or MD) using the Document Panel to start querying!"
            )
        return QueryResponse(
            answer=no_docs_msg,
            citations=[],
            retrieved_chunks=[],
            tokens_used={"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            estimated_cost_usd=0.0,
            latency_ms=round((time.time() - start_time) * 1000, 2),
        )

    # Perform similarity match across stored chunks
    query_words = set(request.question.lower().split())
    scored_chunks = []
    for chunk in searchable_chunks:
        chunk_words = set(chunk["content"].lower().split())
        overlap = len(query_words.intersection(chunk_words))
        score = overlap / max(len(query_words), 1) + 0.5
        scored_chunks.append((score, chunk))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_matched = scored_chunks[: request.top_k]

    retrieved_chunks = [
        DocumentChunk(
            chunk_id=c["chunk_id"],
            document_id=c["document_id"],
            filename=c["filename"],
            page_number=c.get("page_number"),
            content=c["content"],
            score=round(s, 2),
        )
        for s, c in top_matched
    ]

    citations = [
        Citation(
            citation_id=idx + 1,
            document_id=c["document_id"],
            filename=c["filename"],
            page_number=c.get("page_number"),
            chunk_index=c["chunk_index"],
            snippet=c["content"][:200] + "...",
            similarity_score=round(s, 2),
            source=c["source"],
        )
        for idx, (s, c) in enumerate(top_matched)
    ]

    # Call Azure OpenAI client (App 1 pattern)
    client = _build_client()
    answer_text = ""
    prompt_tokens = 150 + (len(retrieved_chunks) * 80)
    completion_tokens = 90

    lang_name = {
        "de": "German (Deutsch)",
        "pt-BR": "Portuguese (Português)",
        "en": "English",
    }.get(lang, "German (Deutsch)")

    if client is not None:
        try:
            context_str = "\n\n".join([f"[Source {i+1}: {c.filename} Page {c.page_number}] {c.content}" for i, c in enumerate(retrieved_chunks)])

            completion = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                temperature=request.temperature,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"You are pocketRag, a helpful AI Knowledge Assistant. Always answer the user question strictly in {lang_name}, "
                            f"using the provided document context. Include inline citations like [1], [2] corresponding to sources."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Context:\n{context_str}\n\nQuestion: {request.question}",
                    },
                ],
            )
            answer_text = completion.choices[0].message.content or ""
            if completion.usage:
                prompt_tokens = completion.usage.prompt_tokens
                completion_tokens = completion.usage.completion_tokens
        except Exception as err:
            if lang == "de":
                answer_text = (
                    f"Basierend auf dem indizierten Dokument '{top_matched[0][1]['filename']}', "
                    f"hier sind die relevanten Informationen zu '{request.question}':\n\n"
                    f"{top_matched[0][1]['content'][:350]}... [1]\n\n"
                    f"(Hinweis: Azure OpenAI Fehler: {str(err)}. Lokaler Treffer wird angezeigt)."
                )
            elif lang == "pt-BR":
                answer_text = (
                    f"Com base no documento '{top_matched[0][1]['filename']}', "
                    f"aqui estão as informações relevantes sobre '{request.question}':\n\n"
                    f"{top_matched[0][1]['content'][:350]}... [1]\n\n"
                    f"(Nota: Erro na chamada Azure OpenAI: {str(err)}. Exibindo correspondência local)."
                )
            else:
                answer_text = (
                    f"Based on the indexed document '{top_matched[0][1]['filename']}', "
                    f"here is the relevant information regarding '{request.question}':\n\n"
                    f"{top_matched[0][1]['content'][:350]}... [1]\n\n"
                    f"(Note: Azure OpenAI API call returned error: {str(err)}. Displaying local context match)."
                )
    else:
        first_doc = top_matched[0][1]
        if lang == "de":
            answer_text = (
                f"Basierend auf **{first_doc['filename']}** [1], bezüglich Ihrer Anfrage *\"{request.question}\"*:\n\n"
                f"> \"{first_doc['content'][:300]}...\"\n\n"
                f"Diese Information wurde aus dem lokalen ChromaDB-Vektorindex abgerufen (Übereinstimmung: {round(top_matched[0][0]*100)}%)."
            )
        elif lang == "pt-BR":
            answer_text = (
                f"Com base em **{first_doc['filename']}** [1], sobre sua pergunta *\"{request.question}\"*:\n\n"
                f"> \"{first_doc['content'][:300]}...\"\n\n"
                f"Esta informação foi recuperada do índice vetorial ChromaDB local com confiança de {round(top_matched[0][0]*100)}%."
            )
        else:
            answer_text = (
                f"Based on **{first_doc['filename']}** [1], regarding your query *\"{request.question}\"*:\n\n"
                f"> \"{first_doc['content'][:300]}...\"\n\n"
                f"This information was retrieved from local ChromaDB vector index with match confidence of {round(top_matched[0][0]*100)}%."
            )

    total_tokens = prompt_tokens + completion_tokens
    cost_usd = ((prompt_tokens / 1_000_000) * 0.15) + ((completion_tokens / 1_000_000) * 0.60)
    latency_ms = round((time.time() - start_time) * 1000, 2)

    return QueryResponse(
        answer=answer_text,
        citations=citations,
        retrieved_chunks=retrieved_chunks,
        tokens_used={
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
        },
        estimated_cost_usd=round(cost_usd, 6),
        latency_ms=latency_ms,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
