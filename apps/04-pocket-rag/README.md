# App 04 — pocketRag

A cost-optimized, local RAG (Retrieval-Augmented Generation) knowledge base built with Next.js and FastAPI.

`pocketRag` replaces expensive cloud search services (like Azure AI Search) with a zero-cost local Python vector store (**ChromaDB**), local PDF parsing, and sentence embeddings, using OpenAI `gpt-4o-mini` solely for generating final grounded answers.

## Architecture

```text
04-pocket-rag/
├── backend/       # FastAPI service, ChromaDB vector store, pypdf parser
├── frontend/      # Next.js App Router UI with document manager & chat
├── README.md
└── vercel.json
```

## Features

- **Local Vector Storage**: ChromaDB file-backed or in-memory vector store ($0 infra cost).
- **Document Ingestion**: Upload PDF, TXT, or MD documents, parse text, and generate vector embeddings locally.
- **Grounded RAG Queries**: Query documents with top-k vector similarity search.
- **Inline Citations**: Every answer includes clickable inline citations linking directly to source snippets.
- **Cost & Token Telemetry**: Per-query token breakdown and cloud savings estimator.
- **Multi-language UI**: Support for English, Portuguese, and German.

## Quickstart

### Backend Setup

```bash
cd apps/04-pocket-rag/backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd apps/04-pocket-rag/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

From `backend/`, with the virtual environment activated:

```bash
python -m pip install -r requirements-test.txt
python -m unittest -v test_app04
```

Each test uses a temporary ChromaDB directory, a unique collection, deterministic
local embeddings, and a fake LLM response. Tests do not load `.env`, ignore Azure
credentials, and block outbound socket connections. Temporary clients are closed
before their directories are removed; the application's local database is not
opened or cleared. These tests validate API behavior, not model quality.

From `frontend/`:

```bash
npm run build
npm run lint
npm run typecheck
```

Lint excludes generated build and coverage files, so it can also run after a build.
On Windows, use `npm.cmd` if PowerShell blocks the `npm.ps1` wrapper.
