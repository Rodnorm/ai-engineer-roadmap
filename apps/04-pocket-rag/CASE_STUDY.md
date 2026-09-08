# pocketRag case study

## Problem

The project needed a demonstrable multilingual RAG application without a paid vector
search service, while preserving uploaded documents and making generated claims easy
to inspect.

## Approach

The solution keeps retrieval local: strict parsers produce bounded overlapping word
chunks, a pinned multilingual sentence-transformer creates embeddings, and ChromaDB
performs cosine retrieval. SQLite is the source of truth for the document catalog and
original files use opaque server-generated names. Azure OpenAI is used only for the
final answer and is behind an opt-in kill switch and cost controls.

Reliability work focused on transactional behavior at storage boundaries. Failed
indexing removes the saved file and vectors. Deletion quarantines the original before
removing vectors and metadata, restoring it when vector deletion fails. Tests use
temporary storage and deterministic doubles, so local personal data and paid APIs are
never touched.

User uploads have a 30-minute server-side TTL. Cleanup runs at startup and every
minute, removing originals, ChromaDB vectors, and SQLite metadata without relying on
the browser remaining open. Bundled examples are excluded, and failed cleanup is
logged for retry on the next sweep.

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
- The private API-key mode is intentionally single-user. It avoids pretending that a
  browser-generated identifier provides authorization, but it is not a multi-tenant
  product.
- Local embeddings remove per-query embedding fees, not hosting, CPU, disk, or model
  download costs.

## Evidence and next release gate

The isolated backend suite covers persistence visibility after store recreation,
DOCX/Markdown ingestion, invalid inputs, duplicate rejection, rollback, failed
deletion, expired-upload cleanup, query citations, and collection-scoped cleanup. CI
and dependency monitoring include the app.

RAGAS targets and the reproducible corpus/runner are versioned, but paid evaluation is
not yet executed. Screenshots, a short demo, real-host restart/durability evidence,
and measured RAGAS results remain release gates. Until those artifacts exist, the app
is presented as in development rather than production-ready.
