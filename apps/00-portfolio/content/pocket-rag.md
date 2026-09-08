# Case Study: App 04 — pocketRag

## Overview

pocketRag is a local-first personal knowledge base for PDF, Markdown, TXT, and DOCX documents. It preserves originals, metadata, and vector chunks while returning grounded answers with inspectable inline citations.

## Architecture

FastAPI validates and parses uploads, stores document metadata in SQLite, and indexes bounded chunks with multilingual sentence-transformer embeddings in persistent ChromaDB. Next.js provides private document management, example documents, chat, telemetry, and an accessible citation dialog. Azure OpenAI generation is optional and disabled by default.

## Reliability, privacy, and cost controls

- Upload and delete operations coordinate original files, SQLite metadata, and vectors with rollback behavior.
- Production requires a private bearer key; documents are not shared as a public multi-tenant demo.
- Retrieval abstains when evidence is weak, treats documents as untrusted data, and rejects unknown citations.
- Shared SQLite quotas, per-process concurrency, bounded inputs/outputs, provider timeout/retries, and a kill switch protect paid generation.
- Common tests use temporary storage, deterministic embeddings, a fake LLM, and blocked network access.

## Status

The implementation and reproducible RAGAS tooling are complete, but measured RAGAS results and durable-host restart evidence remain release gates. The app is therefore marked as in development.
