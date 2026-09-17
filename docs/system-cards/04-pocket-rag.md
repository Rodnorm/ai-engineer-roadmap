# AI System Card: 04 Pocket RAG

## 1. System Overview
- **Application:** Pocket RAG (Local-First Retrieval-Augmented Generation)
- **Embedding Model:** Azure OpenAI `text-embedding-3-small` (1536 dimensions)
- **Generation Model:** Azure OpenAI `gpt-4o-mini`
- **Vector Database:** SQLite Vector (`sqlite-vec` / SQLite local embeddings store)

## 2. Model & Provider Details
- **Provider:** Azure OpenAI Service
- **Chunking Strategy:** Sliding window (500 words chunk size, 50 words overlap)
- **Relevance Threshold:** Minimum cosine similarity score of 0.20 enforced before chunks enter the generation prompt context.

## 3. Data Governance & Retention
- **Document Lifespan:** Uploaded user files have a 30-minute retention policy (`UPLOAD_RETENTION_MINUTES=30`).
- **Periodic Garbage Collection:** Background task scans and deletes expired files, metadata, and vectors every 60 seconds.
- **Storage Isolation:** Uploads are stored with random UUID filenames; files are contained strictly within `settings.upload_dir` with path escape protection.

## 4. Safety & Ingestion Hardening
- **Parsing Timeout:** 15-second CPU limit enforced during document parsing via `asyncio.wait_for`.
- **Encrypted & Corrupt Document Rejection:** Encrypted PDFs and files without extractable text are rejected with HTTP 422.
- **Pathological File Protections:** Page character limits (250,000 chars/page) prevent memory exhaustion from decompression bombs.
- **Groundedness & Abstention:** If no retrieved chunk exceeds the relevance threshold, the system returns an explicit abstention notice without calling the generation model.

## 5. Performance & Economics
- **Retrieval Latency:** ~25ms (local SQLite vector lookup)
- **End-to-End Query Latency:** ~1,100ms
- **Cost Profile:** ~$0.00002 for query embedding + ~$0.0005 for synthesis.
