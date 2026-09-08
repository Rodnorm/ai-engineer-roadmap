# App 04 — pocketRag

pocketRag is a local-first personal RAG knowledge base built with Next.js, FastAPI,
ChromaDB, multilingual sentence-transformer embeddings, and optional Azure OpenAI
answer generation. Its current status is **in development** until a durable host and
the credentialed evaluation are validated.

## Data flow

```text
browser -> authenticated FastAPI API -> private original file
                                  |--> SQLite document catalog
                                  |--> parser + word chunks -> ChromaDB embeddings
question -> ChromaDB top-k -> relevance gate -> bounded context -> Azure OpenAI
                                                        -> answer + inline citations
```

Supported uploads are PDF, Markdown, UTF-8 TXT, and DOCX. Defaults are 10 MB,
200 PDF pages, 2,000,000 extracted characters, 1,000 chunks per document, 500 words
per chunk, and 50 overlapping words. Scanned PDFs need OCR and are rejected. DOCX
archives have expansion and entry-count limits.

The repository also includes five fictional German PDF documents covering housing,
employment, insurance, internet, and service charges. The UI can index them
idempotently in a separate `examples` scope, offers suggested questions, and lets the
user download the source PDFs. Example retrieval never searches private uploads, and
clearing personal documents preserves the bundled examples.

Original files receive server-generated names under `backend/data/uploads`.
Document metadata is persisted in SQLite and vectors in `backend/data/chroma_db`.
All three stores are ignored by Git. Upload rolls back on indexing failure; deletion
removes the original, metadata, and vectors and reports failures instead of claiming
success. Identical file content is rejected to avoid accidental duplicates.

## Local setup

Backend:

```bash
cd apps/04-pocket-rag/backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd apps/04-pocket-rag/frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. Next.js rewrites `/api/backend` to the local FastAPI
server. On Windows, use `npm.cmd` when PowerShell blocks `npm.ps1`.

The multilingual embedding model downloads on first use. Pre-download and retain its
cache on a production host to avoid unpredictable cold starts.

## Configuration and access

Copy `backend/.env.example` and review every limit. Important controls:

- `APP_ENV=production` disables Swagger/OpenAPI and requires `POCKET_RAG_API_KEY`.
- `GENERATION_ENABLED=false` is the default kill switch. Set it to `true` only after
  configuring Azure credentials, limits, and a budget.
- `CORS_ORIGINS` is an explicit comma-separated allowlist.
- `REQUESTS_PER_MINUTE` and `DAILY_GENERATION_LIMIT` are enforced through SQLite,
  shared by processes using the same volume. `MAX_CONCURRENT_GENERATIONS` bounds
  concurrent provider calls in each process.
- Provider timeout, retry count, context, output, question, file, document, page, and
  chunk limits are all server-side settings.
- Token prices are configurable assumptions. The UI does not claim fixed savings.

Production is a single-user/private-server mode. The frontend asks for the API key
and keeps it only in memory for the current tab. Every document, stats, query, and
delete endpoint validates the bearer token. `/health` remains public and returns only
app/status/version. This is not multi-tenant isolation.

The API returns sanitized errors with a stable code and request ID. Logs include
request method/path/status/duration and error type, never prompt or document content.
Rate-limited responses include `Retry-After`.

## Privacy and retention

The upload panel states what is stored and what leaves the server. Files, metadata,
chunks, and vectors remain until the user deletes one document or confirms deletion
of all documents. When generation is enabled, the question and retrieved excerpts
are sent to Azure OpenAI. Visible chat history is browser-only and is not sent, so
questions are independent rather than persistent multi-turn conversations.

Back up the three data stores together. Before decommissioning a host, use the clear
action and verify the mounted volume is empty. Automatic time-based retention is not
implemented; operators must define and perform retention appropriate to their data.

## API

All `/api/*` examples need `Authorization: Bearer <POCKET_RAG_API_KEY>` when a key is
configured.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Minimal liveness response |
| `GET` | `/api/documents` | List persistent document metadata |
| `POST` | `/api/documents/upload` | Validate, preserve, chunk, and index one file |
| `DELETE` | `/api/documents/{id}` | Delete one document consistently |
| `DELETE` | `/api/documents` | Delete the complete personal knowledge base |
| `POST` | `/api/query` | Retrieve evidence and optionally generate an answer |
| `GET` | `/api/stats` | Document/chunk counts and vector-store state |

Retrieval uses the pinned
`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` model and cosine
distance. Index configuration is stored beside metadata; changing model or chunking
with existing documents requires clearing and reindexing. Similarity is a retrieval
score, not a probability that an answer is correct. Below-threshold results abstain.
Document content is delimited as untrusted data in the generation prompt, context and
output are bounded, and unknown citation references fail safely.

## Validation

Common tests use a temporary SQLite catalog/upload directory, a unique ChromaDB
collection, deterministic embeddings, a fake LLM, and blocked network sockets:

```bash
cd apps/04-pocket-rag/backend
python -m pip install -r requirements-test.txt
python -m unittest -v test_app04
```

Frontend checks:

```bash
cd apps/04-pocket-rag/frontend
npm run lint
npm run typecheck
npm run build
```

CI installs immutable frontend dependencies and executes all three frontend checks
plus the isolated backend suite. Dependabot monitors both dependency sets.

The deliberate RAGAS workflow is documented in [evals/REPORT.md](evals/REPORT.md).
It includes five golden examples and multilingual, unsupported-question, conflicting
source, and prompt-injection coverage. It is excluded from normal CI because it uses
paid generation/evaluator calls. Never publish simulated scores as measurements.

## Deployment

`vercel.json` uses Vercel's experimental multi-service configuration: Next.js at `/`
and FastAPI at `/api/backend`. Select the **Services** framework preset if evaluating
that configuration. The frontend sends same-origin API requests.

Vercel's default function filesystem is not evidence of durable ChromaDB, SQLite, or
uploaded-file storage. Do not label that deployment production-ready unless the host
provides a mounted persistent filesystem shared by backend instances and restart tests
prove all three stores survive. A host with a persistent volume is required for the
current architecture. Store production secrets only in the production environment,
keep generation disabled in previews, deploy publicly from `main`, and test upload,
query, delete, restart recovery, model cold start, duration, and kill switch on the
actual host.

Security headers disable framework disclosure, MIME sniffing, framing, camera,
microphone, and geolocation. CSP starts in Report-Only to observe violations while
remaining compatible with the inline pre-paint theme script; apply it only after
reviewing real reports.

See [CASE_STUDY.md](CASE_STUDY.md) for the implementation decisions and outstanding
release evidence.
