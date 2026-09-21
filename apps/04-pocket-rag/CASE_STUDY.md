# pocketRag case study

## Problem

The project needed a demonstrable multilingual RAG application without a paid vector
search service, while preserving uploaded documents and making generated claims easy
to inspect.

## Approach

The solution keeps retrieval fast and lightweight: strict parsers produce bounded overlapping word
chunks, Azure OpenAI generates embeddings (`text-embedding-3-small`), and SQLite/NumPy
performs cosine similarity retrieval. SQLite is the source of truth for the document catalog and
chunk vectors, while original files use opaque server-generated names. Azure OpenAI is used for
embeddings and answer generation, behind opt-in kill switches and cost controls.

Reliability work focused on transactional behavior at storage boundaries. Failed
indexing removes the saved file and chunk records. Deletion quarantines the original before
removing chunk vectors and metadata, restoring it when metadata deletion fails. Tests use
temporary storage and deterministic doubles, so local personal data and paid APIs are
never touched.

User uploads are scoped to a signed anonymous owner session and have a 30-minute
server-side TTL. The browser holds only a `Secure`, `HttpOnly`, `SameSite=Lax`
cookie; Next.js authenticates to FastAPI and supplies the verified owner ID
server-side. Cleanup runs at startup and every minute, removing originals, chunk
vectors, and SQLite metadata without relying on the browser remaining open. Bundled
examples are global, read-only, and excluded from cleanup.

Grounding is explicit: low-relevance and empty results abstain, sources are delimited
as untrusted data, context/output are bounded, and only citations actually referenced
by the answer are presented. The UI turns `[n]` into keyboard-operable controls that
open the complete retrieved chunk in a native modal dialog.

## Trade-offs

- SQLite-backed counters work across processes sharing one volume, while the
  concurrency semaphore is process-local. Deployment concurrency must account for
  the number of instances.
- Word chunks are transparent and inexpensive but are less precise than tokenizer-
  aware chunks.
- Anonymous signed sessions isolate browsers without adding account management. They
  do not provide cross-device access or recovery after the owner cookie is cleared;
  those capabilities would require real authentication.
- SQLite vector search avoids the multi-gigabyte dependency footprint of ChromaDB and
  PyTorch, making the application lightweight and compatible with standard serverless hosting.

## Evidence and next release gate

The isolated backend suite covers persistence visibility after store recreation,
owner-scoped listing/query/deletion, tamper-resistant owner headers, DOCX/Markdown
ingestion, invalid inputs, duplicate rejection, rollback, failed deletion,
expired-upload cleanup, query citations, and collection-scoped cleanup. CI and
dependency monitoring include the app.

RAGAS targets and the reproducible corpus/runner are versioned, but paid evaluation is
not yet executed. Screenshots, a short demo, real-host restart/durability evidence,
and measured RAGAS results remain release gates. Until those artifacts exist, the app
is presented as in development rather than production-ready.
