# Case Study: App 04 — pocketRag

## Overview

pocketRag is a private, multilingual knowledge base for PDF, Markdown, TXT, and DOCX documents. It preserves uploaded originals for a limited retention window, indexes their content, and returns grounded answers with inspectable inline citations.

## Architecture

FastAPI validates and parses bounded uploads. Azure OpenAI creates `text-embedding-3-small` vectors, while SQLite stores document metadata, chunks, embeddings, shared quotas, and generation events. Retrieval computes cosine similarity directly with SQLite/NumPy, avoiding a separate vector-database service. Next.js provides document management, bundled German examples, suggested questions, chat, telemetry, and keyboard-accessible citation dialogs.

## Reliability, privacy, and cost controls

- Upload and delete operations coordinate original files, SQLite metadata, and vectors with rollback behavior.
- Personal uploads expire after 30 minutes through server-side cleanup; bundled examples remain isolated and do not expire.
- Production requires a private bearer key and is intentionally single-user rather than a public multi-tenant demo.
- Retrieval abstains when evidence is weak, treats document text as untrusted data, and rejects unknown citation references.
- Shared SQLite quotas, bounded context and output, provider timeouts, retries, a concurrency cap, and a generation kill switch protect paid Azure usage.
- Tests use temporary storage, deterministic embeddings, a fake LLM, and blocked network access.

## Status

The implementation, CI coverage, example documents, and reproducible RAGAS tooling are complete. Measured RAGAS results and durable-host restart evidence remain release gates, so the app is marked as in development.
