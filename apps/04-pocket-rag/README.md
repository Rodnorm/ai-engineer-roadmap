# App 04 — pocketRag

pocketRag is a personal RAG knowledge base with local document storage built with Next.js, FastAPI,
SQLite storage for JSON-encoded vectors, Azure OpenAI embeddings, and Azure OpenAI
answer generation. Ingestion, retrieval, suggestions, citations and retention are
implemented. Credentialed evaluation and host validation remain separate release
evidence; this README does not certify deployment readiness.

## Data flow

```text
browser -> signed HttpOnly owner session -> Next.js BFF -> authenticated FastAPI API
                                                       |-> private original file
                                                       |-> owner-scoped SQLite chunks
question -> owner-scoped vector top-k -> relevance gate -> Azure OpenAI -> cited answer
```

Supported uploads are PDF, Markdown, UTF-8 TXT, and DOCX. Defaults are 10 MB,
200 PDF pages, 2,000,000 extracted characters, 1,000 chunks per document, 100
deployment-wide documents, 10 documents per anonymous owner, 500 words per chunk,
and 50 overlapping words. Scanned PDFs need OCR and are rejected. DOCX
archives have expansion and entry-count limits.

The repository also includes five fictional German PDF documents covering housing,
employment, insurance, internet, and service charges. The UI can index them
idempotently in a separate `examples` scope, offers suggested questions, and lets the
user download the source PDFs. Example retrieval never searches private uploads, and
clearing personal documents preserves the bundled examples.

Original files receive server-generated names under `backend/data/uploads`.
Document metadata and vector embeddings are persisted in SQLite (`backend/data/metadata.sqlite3`).
Both stores are ignored by Git. Upload rolls back on indexing failure; deletion
removes the original, metadata, and chunk vectors and reports failures instead of claiming
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
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The Next.js route handler proxies `/api/backend` to
FastAPI, creates a signed anonymous owner cookie, and adds the internal API key and
owner ID server-side. On Windows, use `npm.cmd` when PowerShell blocks `npm.ps1`.

Embeddings are requested from Azure OpenAI; no local embedding model is downloaded.
Configure `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` and the Azure credentials before
indexing documents or querying. The generation kill switch does not make embeddings
local or free. For the root orchestrator, set `BACKEND_URL=http://localhost:8004`;
its `NEXT_PUBLIC_API_BASE_URL` setting is unused by the BFF. The frontend package
currently fixes port 3000 despite the registry declaring 3004. To run alongside
App 00, start the frontend separately with `npx next dev --port 3004`.

For uploaded documents, the empty chat view generates up to five suggested questions
from bounded excerpts of the five most recent documents. Suggestions use the same
Azure deployment, generation limits, access control, and prompt-injection boundary as
grounded answers. Bundled examples keep their static suggestions and incur no extra call.

## Configuration and access

Copy `backend/.env.example` and review every limit. Important controls:

- `APP_ENV=production` disables Swagger/OpenAPI and requires `POCKET_RAG_API_KEY`.
  Configure the same value only on the FastAPI and Next.js servers.
- `POCKET_RAG_SESSION_SECRET` belongs only to Next.js, must contain at least 32
  characters, and signs the anonymous `HttpOnly` owner cookie.
- `BACKEND_URL` is server-only. The browser calls the same-origin Next.js BFF and
  never receives the backend URL, API key, session secret, or owner ID.
- Local development enables generation by default when `GENERATION_ENABLED` is
  omitted. Test and production environments default to the safe `false` kill switch;
  set it to `true` only after configuring Azure credentials, limits, and a budget.
- `CORS_ORIGINS` is an explicit comma-separated allowlist.
- `REQUESTS_PER_MINUTE` and `DAILY_GENERATION_LIMIT` are enforced through SQLite,
  shared by processes using the same volume. `MAX_CONCURRENT_GENERATIONS` bounds
  concurrent provider calls in each process.
- `MAX_DOCUMENTS` retains the deployment-wide storage/embedding cap, while
  `MAX_DOCUMENTS_PER_OWNER` prevents one anonymous session from consuming it.
- Provider timeout, retry count, context, output, question, file, document, page, and
  chunk limits are all server-side settings.
- Token prices are configurable assumptions. The UI does not claim fixed savings.

Production uses anonymous owner sessions rather than accounts or a shared password.
Next.js stores a signed owner token in a `Secure`, `HttpOnly`, `SameSite=Lax`
cookie. FastAPI accepts owner identity only from the authenticated BFF and scopes
upload listing, duplicate detection, suggestions, retrieval, statistics, and deletion
to that owner. Bundled examples remain global and read-only. `/health` remains public
and returns only app/status/version.

This provides browser-session isolation, not durable identity: clearing cookies or
using another browser creates a new owner. A real login would still be required for
cross-device access or account recovery.

The API returns sanitized errors with a stable code and request ID. Logs include
request method/path/status/duration and error type, never prompt or document content.
Rate-limited responses include `Retry-After`.

## Privacy and retention

The upload panel states what is stored and what leaves the server. Uploaded originals,
metadata, chunks, and vectors expire 30 minutes after `created_at`. A backend task runs
on startup and every 60 seconds, so an active service normally removes an upload
between 30 and 31 minutes after ingestion. Closing the browser is not the deletion
trigger and does not need to keep a request alive. Bundled example documents do not
expire.

`UPLOAD_RETENTION_MINUTES` and `CLEANUP_INTERVAL_SECONDS` configure this policy. If
the service is stopped at the expiration time, stale uploads are removed on its next
startup. Failed storage deletions are logged and retried by the next sweep; operators
must monitor these events because no application can guarantee deletion when its
storage is unavailable. Stale orphan files left by interrupted operations are also
removed after the retention window.

During ingestion and retrieval, document chunks and questions are sent to Azure
OpenAI for embeddings. When generation is enabled, excerpts are also sent to create
question suggestions and answer questions. Visible chat history is browser-only and
is not sent, so questions are independent rather than persistent multi-turn
conversations. Before decommissioning a host, use the clear action and verify the
mounted volume is empty.

## API

The browser calls the same-origin `/api/backend/*` BFF: for example,
`/api/backend/api/query` forwards to FastAPI `/api/query`. Direct FastAPI `/api/*`
requests are internal and require both `Authorization: Bearer <POCKET_RAG_API_KEY>`
and the BFF-provided `X-Owner-ID`; clients must not choose their own owner ID.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Minimal liveness response |
| `GET` | `/api/documents` | List persistent document metadata |
| `POST` | `/api/documents/upload` | Validate, preserve, chunk, and index one file |
| `DELETE` | `/api/documents/{id}` | Delete one document consistently |
| `DELETE` | `/api/documents` | Delete the complete personal knowledge base |
| `POST` | `/api/suggestions` | Generate contextual questions from recent uploads |
| `POST` | `/api/query` | Retrieve evidence and optionally generate an answer |
| `GET` | `/api/stats` | Document/chunk counts and vector-store state |
| `GET` | `/api/examples` | List bundled examples and suggestions |
| `POST` | `/api/examples/load` | Index bundled examples |
| `GET` | `/api/examples/{filename}` | Download a bundled example |

Retrieval uses Azure OpenAI embeddings (`text-embedding-3-small`) and cosine
similarity computed in NumPy (with a pure-Python fallback) over vectors loaded from SQLite. No SQLite vector extension is required. Index configuration is stored beside metadata; changing model or chunking
with existing documents requires clearing and reindexing. Similarity is a retrieval
score, not a probability that an answer is correct. Below-threshold results abstain.
Document content is delimited as untrusted data in the generation prompt, context and
output are bounded, and unknown citation references fail safely.

## Validation

Common tests use a temporary SQLite catalog/upload directory,
deterministic embeddings, a fake LLM, and blocked network sockets:

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

The app includes `compose.coolify.yml` for Coolify. Next.js serves the UI and
`/api/backend/*` BFF; it maps those calls to the internal FastAPI `/api/*` routes.

The backend uses a mounted persistent volume (`pocket-rag-data`) at `/app/data`
to ensure durable SQLite and uploaded-file storage across restarts. Configure
`BACKEND_URL`, `POCKET_RAG_API_KEY`, and `POCKET_RAG_SESSION_SECRET` on the
Next.js resource; configure the same `POCKET_RAG_API_KEY` on FastAPI.
Keep generation disabled during initial setup, deploy from `main`, and test upload,
query, delete, restart recovery, provider connectivity, duration, and kill switch on the
actual host.

Security headers disable framework disclosure, MIME sniffing, framing, camera,
microphone, and geolocation. CSP starts in Report-Only to observe violations while
remaining compatible with the inline pre-paint theme script; apply it only after
reviewing real reports.

See [CASE_STUDY.md](CASE_STUDY.md) for the implementation decisions and outstanding
release evidence.


