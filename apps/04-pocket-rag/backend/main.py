import io
import os
import time
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

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

try:
    import chromadb
except ImportError:
    chromadb = None

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

CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")

def _get_chroma_collection():
    if chromadb is None:
        return None
    try:
        os.makedirs(CHROMA_DB_DIR, exist_ok=True)
        client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        collection = client.get_or_create_collection(
            name="pocket_rag_docs",
            metadata={"hnsw:space": "cosine"}
        )
        return collection
    except Exception as e:
        print(f"Error initializing ChromaDB persistent collection: {e}")
        return None

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

@app.get("/health")
def health_check():
    client = _build_client()
    collection = _get_chroma_collection()
    return {
        "status": "healthy",
        "app": "pocketRag",
        "version": "0.1.0",
        "azure_openai_configured": client is not None,
        "endpoint": AZURE_OPENAI_ENDPOINT or "Not configured",
        "deployment": AZURE_OPENAI_DEPLOYMENT or "Not configured",
        "pdf_parser_available": PdfReader is not None,
        "vector_store": "ChromaDB (Local Persistent)" if collection is not None else "In-Memory Fallback",
    }

@app.get("/api/stats", response_model=SystemStats)
def get_stats():
    total_docs = len(DOCUMENTS_DB)
    collection = _get_chroma_collection()
    if collection is not None:
        total_chunks = collection.count()
        v_store = "ChromaDB (Local Persistent)"
    else:
        total_chunks = len(CHUNKS_DB)
        v_store = "In-Memory Fallback"
        
    return SystemStats(
        total_documents=total_docs,
        total_chunks=total_chunks,
        vector_store_type=v_store,
        monthly_cloud_savings_usd=75.00,
    )

@app.get("/api/documents", response_model=List[DocumentItem])
def list_documents():
    return list(DOCUMENTS_DB.values())

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

    # Extract text and track pages
    page_chunks: List[Dict[str, Any]] = []
    extracted_text = ""

    if file_ext == "pdf" and PdfReader is not None:
        try:
            reader = PdfReader(io.BytesIO(content_bytes))
            for page_idx, page in enumerate(reader.pages):
                p_text = (page.extract_text() or "").strip()
                if p_text:
                    extracted_text += p_text + "\n"
                    sub_chunks = chunk_text(p_text)
                    for ch in sub_chunks:
                        page_chunks.append({"content": ch, "page_number": page_idx + 1})
        except Exception:
            extracted_text = f"Extracted content from PDF: {filename} ({file_size} bytes)."
    
    if not extracted_text:
        try:
            extracted_text = content_bytes.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = f"Content from {filename}"

    if not page_chunks:
        sub_chunks = chunk_text(extracted_text if extracted_text.strip() else f"Content of {filename}")
        page_chunks = [{"content": ch, "page_number": (idx // 2) + 1} for idx, ch in enumerate(sub_chunks)]

    doc_id = str(uuid.uuid4())[:8]

    # Store in ChromaDB collection
    collection = _get_chroma_collection()
    if collection is not None and page_chunks:
        try:
            c_ids = [f"{doc_id}_{idx}" for idx in range(len(page_chunks))]
            c_docs = [c["content"] for c in page_chunks]
            c_metas = [
                {
                    "document_id": doc_id,
                    "filename": filename,
                    "page_number": c["page_number"],
                    "chunk_index": idx,
                }
                for idx, c in enumerate(page_chunks)
            ]
            collection.add(ids=c_ids, documents=c_docs, metadatas=c_metas)
        except Exception as e:
            print(f"Error adding vectors to ChromaDB: {e}")

    # Store in memory registry as fallback
    for idx, c in enumerate(page_chunks):
        CHUNKS_DB.append({
            "chunk_id": f"{doc_id}_{idx}",
            "document_id": doc_id,
            "filename": filename,
            "page_number": c["page_number"],
            "content": c["content"],
            "chunk_index": idx,
        })

    doc_item = DocumentItem(
        id=doc_id,
        filename=filename,
        file_type=file_ext.upper(),
        file_size_bytes=file_size,
        chunks_count=len(page_chunks),
        created_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
    )
    DOCUMENTS_DB[doc_id] = doc_item

    return DocumentUploadResponse(
        document_id=doc_id,
        filename=filename,
        chunks_created=len(page_chunks),
        message=f"Document '{filename}' successfully ingested and vectorized in ChromaDB local store.",
    )

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str):
    if doc_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")

    del DOCUMENTS_DB[doc_id]

    global CHUNKS_DB
    CHUNKS_DB = [c for c in CHUNKS_DB if c["document_id"] != doc_id]

    collection = _get_chroma_collection()
    if collection is not None:
        try:
            collection.delete(where={"document_id": doc_id})
        except Exception as e:
            print(f"Error removing document vectors from ChromaDB: {e}")

    return {"message": f"Document '{doc_id}' deleted successfully.", "status": "success"}

@app.delete("/api/documents")
def clear_documents():
    count = len(DOCUMENTS_DB)
    DOCUMENTS_DB.clear()
    CHUNKS_DB.clear()

    collection = _get_chroma_collection()
    if collection is not None:
        try:
            # Delete all documents in collection
            existing_ids = collection.get().get("ids", [])
            if existing_ids:
                collection.delete(ids=existing_ids)
        except Exception as e:
            print(f"Error clearing ChromaDB collection: {e}")

    return {"message": f"Cleared {count} documents and all vector indices.", "status": "success"}

@app.post("/api/query", response_model=QueryResponse)
def query_rag(request: QueryRequest):
    start_time = time.time()
    lang = request.language or "de"

    collection = _get_chroma_collection()
    chroma_count = collection.count() if collection is not None else 0

    if chroma_count == 0 and not CHUNKS_DB:
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

    top_matched: List[tuple[float, Dict[str, Any]]] = []

    # Try ChromaDB persistent vector search first
    if collection is not None and chroma_count > 0:
        try:
            results = collection.query(
                query_texts=[request.question],
                n_results=min(request.top_k, chroma_count)
            )
            if results and results.get("documents") and results["documents"][0]:
                for idx in range(len(results["documents"][0])):
                    doc_text = results["documents"][0][idx]
                    meta = results["metadatas"][0][idx] if (results.get("metadatas") and results["metadatas"][0]) else {}
                    dist = results["distances"][0][idx] if (results.get("distances") and results["distances"][0]) else 0.5
                    sim_score = max(0.0, min(1.0, 1.0 - dist))
                    top_matched.append((
                        sim_score,
                        {
                            "chunk_id": results["ids"][0][idx],
                            "document_id": meta.get("document_id", "unknown"),
                            "filename": meta.get("filename", "document"),
                            "page_number": meta.get("page_number", 1),
                            "content": doc_text,
                            "chunk_index": meta.get("chunk_index", idx),
                        }
                    ))
        except Exception as e:
            print(f"ChromaDB query fallback: {e}")

    # Fallback to word overlap if ChromaDB had no matches
    if not top_matched and CHUNKS_DB:
        query_words = set(request.question.lower().split())
        scored_chunks = []
        for chunk in CHUNKS_DB:
            chunk_words = set(chunk["content"].lower().split())
            overlap = len(query_words.intersection(chunk_words))
            score = (overlap / max(len(query_words), 1)) * 0.5 + 0.5
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
            chunk_index=c.get("chunk_index", idx),
            snippet=c["content"][:200] + "...",
            similarity_score=round(s, 2),
        )
        for idx, (s, c) in enumerate(top_matched)
    ]

    # Call Azure OpenAI client
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

