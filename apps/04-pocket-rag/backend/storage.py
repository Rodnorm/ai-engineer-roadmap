import json
import math
import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from models import DocumentItem


class DocumentStore:
    def __init__(self, database_path: Path, upload_dir: Path):
        self.database_path = database_path
        self.upload_dir = upload_dir
        self._lock = threading.RLock()
        database_path.parent.mkdir(parents=True, exist_ok=True)
        upload_dir.mkdir(parents=True, exist_ok=True)
        self._initialize()

    @contextmanager
    def connection(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path, timeout=10)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def _initialize(self) -> None:
        with self.connection() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    filename TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    chunks_count INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    stored_filename TEXT NOT NULL UNIQUE,
                    content_sha256 TEXT NOT NULL,
                    source TEXT NOT NULL DEFAULT 'upload',
                    owner_id TEXT NOT NULL DEFAULT ''
                );
                CREATE INDEX IF NOT EXISTS idx_documents_sha256
                    ON documents(content_sha256);
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    embedding TEXT NOT NULL,
                    source TEXT NOT NULL DEFAULT 'upload',
                    page_number INTEGER,
                    owner_id TEXT NOT NULL DEFAULT ''
                );
                CREATE INDEX IF NOT EXISTS idx_chunks_document_id
                    ON document_chunks(document_id);
                CREATE INDEX IF NOT EXISTS idx_chunks_source
                    ON document_chunks(source);
                CREATE TABLE IF NOT EXISTS app_metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS generation_events (
                    occurred_at INTEGER NOT NULL
                );
                """
            )
            document_columns = {
                row[1] for row in connection.execute("PRAGMA table_info(documents)")
            }
            if "source" not in document_columns:
                connection.execute(
                    "ALTER TABLE documents ADD COLUMN source TEXT NOT NULL DEFAULT 'upload'"
                )
            if "owner_id" not in document_columns:
                connection.execute(
                    "ALTER TABLE documents ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''"
                )

            chunk_columns = {
                row[1] for row in connection.execute("PRAGMA table_info(document_chunks)")
            }
            if "owner_id" not in chunk_columns:
                connection.execute(
                    "ALTER TABLE document_chunks ADD COLUMN owner_id TEXT NOT NULL DEFAULT ''"
                )

            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_documents_owner_source "
                "ON documents(owner_id, source)"
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_chunks_owner_source "
                "ON document_chunks(owner_id, source)"
            )

    @staticmethod
    def _scope_filter(
        source: str | None, owner_id: str | None
    ) -> tuple[str, tuple[str, ...]]:
        if source == "example":
            return " WHERE source = 'example'", ()
        if source == "upload" and owner_id:
            return " WHERE source = 'upload' AND owner_id = ?", (owner_id,)
        if source == "upload":
            return " WHERE source = 'upload'", ()
        if owner_id:
            return (
                " WHERE source = 'example' OR (source = 'upload' AND owner_id = ?)",
                (owner_id,),
            )
        return "", ()

    def list_documents(
        self, source: str | None = None, owner_id: str | None = None
    ) -> list[DocumentItem]:
        where, parameters = self._scope_filter(source, owner_id)
        with self.connection() as connection:
            rows = connection.execute(
                "SELECT id, filename, file_type, file_size_bytes, chunks_count, created_at, source "
                f"FROM documents{where} ORDER BY created_at DESC",
                parameters,
            ).fetchall()
        return [DocumentItem(**dict(row)) for row in rows]

    def count_documents(
        self, source: str | None = None, owner_id: str | None = None
    ) -> int:
        where, parameters = self._scope_filter(source, owner_id)
        with self.connection() as connection:
            return int(
                connection.execute(
                    f"SELECT COUNT(*) FROM documents{where}", parameters
                ).fetchone()[0]
            )

    def get_record(
        self, document_id: str, owner_id: str | None = None
    ) -> sqlite3.Row | None:
        where = " AND (source = 'example' OR owner_id = ?)" if owner_id else ""
        parameters = (document_id, owner_id) if owner_id else (document_id,)
        with self.connection() as connection:
            return connection.execute(
                f"SELECT * FROM documents WHERE id = ?{where}", parameters
            ).fetchone()

    def list_expired_upload_records(self, cutoff: str) -> list[sqlite3.Row]:
        with self.connection() as connection:
            return connection.execute(
                "SELECT * FROM documents "
                "WHERE source = 'upload' AND created_at <= ? ORDER BY created_at",
                (cutoff,),
            ).fetchall()

    def find_by_hash(self, content_sha256: str, owner_id: str) -> sqlite3.Row | None:
        with self.connection() as connection:
            return connection.execute(
                "SELECT * FROM documents "
                "WHERE content_sha256 = ? AND source = 'upload' AND owner_id = ?",
                (content_sha256, owner_id),
            ).fetchone()

    def add(
        self,
        item: DocumentItem,
        stored_filename: str,
        content_sha256: str,
        owner_id: str = "",
    ) -> None:
        with self._lock, self.connection() as connection:
            connection.execute(
                "INSERT INTO documents "
                "(id, filename, file_type, file_size_bytes, chunks_count, created_at, stored_filename, content_sha256, source, owner_id) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    item.id,
                    item.filename,
                    item.file_type,
                    item.file_size_bytes,
                    item.chunks_count,
                    item.created_at,
                    stored_filename,
                    content_sha256,
                    item.source,
                    owner_id,
                ),
            )

    def add_chunks(self, chunks: list[dict[str, Any]]) -> None:
        if not chunks:
            return
        with self._lock, self.connection() as connection:
            connection.executemany(
                """
                INSERT OR REPLACE INTO document_chunks
                (id, document_id, filename, chunk_index, content, embedding, source, page_number, owner_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        chunk["id"],
                        chunk["document_id"],
                        chunk["filename"],
                        chunk["chunk_index"],
                        chunk["content"],
                        json.dumps(chunk["embedding"])
                        if not isinstance(chunk["embedding"], str)
                        else chunk["embedding"],
                        chunk.get("source", "upload"),
                        chunk.get("page_number"),
                        chunk.get("owner_id", ""),
                    )
                    for chunk in chunks
                ],
            )

    def count_chunks(
        self, source: str | None = None, owner_id: str | None = None
    ) -> int:
        where, parameters = self._scope_filter(source, owner_id)
        with self.connection() as connection:
            return int(
                connection.execute(f"SELECT COUNT(*) FROM document_chunks{where}", parameters).fetchone()[0]
            )

    def delete_chunks(self, document_id: str) -> None:
        with self._lock, self.connection() as connection:
            connection.execute("DELETE FROM document_chunks WHERE document_id = ?", (document_id,))

    def delete_metadata(
        self, document_id: str, owner_id: str | None = None
    ) -> None:
        with self._lock, self.connection() as connection:
            if owner_id:
                connection.execute(
                    "DELETE FROM document_chunks WHERE document_id = ? AND owner_id = ?",
                    (document_id, owner_id),
                )
                cursor = connection.execute(
                    "DELETE FROM documents "
                    "WHERE id = ? AND source = 'upload' AND owner_id = ?",
                    (document_id, owner_id),
                )
            else:
                connection.execute(
                    "DELETE FROM document_chunks WHERE document_id = ?", (document_id,)
                )
                cursor = connection.execute(
                    "DELETE FROM documents WHERE id = ?", (document_id,)
                )
            if cursor.rowcount != 1:
                raise KeyError(document_id)

    def clear_metadata(
        self, source: str | None = None, owner_id: str | None = None
    ) -> None:
        with self._lock, self.connection() as connection:
            where, parameters = self._scope_filter(source, owner_id)
            connection.execute(f"DELETE FROM document_chunks{where}", parameters)
            connection.execute(f"DELETE FROM documents{where}", parameters)

    def get_chunks_for_suggestions(
        self,
        owner_id: str,
        limit_docs: int = 5,
        chunks_per_doc: int = 3,
        max_chars: int = 16000,
    ) -> str:
        with self.connection() as connection:
            recent_docs = connection.execute(
                "SELECT id, filename FROM documents "
                "WHERE source = 'upload' AND owner_id = ? "
                "ORDER BY created_at DESC LIMIT ?",
                (owner_id, limit_docs),
            ).fetchall()
            parts: list[str] = []
            context_length = 0
            for doc in recent_docs:
                chunks = connection.execute(
                    "SELECT content FROM document_chunks "
                    "WHERE document_id = ? AND owner_id = ? "
                    "ORDER BY chunk_index ASC LIMIT ?",
                    (doc["id"], owner_id, chunks_per_doc),
                ).fetchall()
                for chunk in chunks:
                    part = f"[DOCUMENT: {doc['filename']}]\n{chunk['content']}\n[/DOCUMENT]"
                    if context_length + len(part) > max_chars:
                        return "\n\n".join(parts)
                    parts.append(part)
                    context_length += len(part)
            return "\n\n".join(parts)

    def search_chunks(
        self,
        query_embedding: list[float],
        top_k: int = 4,
        min_score: float = 0.2,
        source: str | None = None,
        owner_id: str | None = None,
    ) -> list[tuple[float, dict[str, Any]]]:
        where, parameters = self._scope_filter(source, owner_id)
        with self.connection() as connection:
            rows = connection.execute(
                "SELECT id, document_id, filename, chunk_index, content, embedding, source, page_number "
                f"FROM document_chunks{where}",
                parameters,
            ).fetchall()

        if not rows:
            return []

        try:
            import numpy as np

            q_arr = np.array(query_embedding, dtype=np.float32)
            q_norm = float(np.linalg.norm(q_arr))
            if q_norm == 0:
                return []
            q_arr = q_arr / q_norm

            matrix = [json.loads(row["embedding"]) for row in rows]
            mat = np.array(matrix, dtype=np.float32)
            norms = np.linalg.norm(mat, axis=1, keepdims=True)
            norms[norms == 0] = 1e-9
            mat = mat / norms
            scores = np.dot(mat, q_arr)

            results: list[tuple[float, dict[str, Any]]] = []
            for score, row in zip(scores, rows):
                score_val = max(0.0, min(1.0, float(score)))
                if score_val >= min_score:
                    results.append(
                        (
                            score_val,
                            {
                                "chunk_id": row["id"],
                                "document_id": row["document_id"],
                                "filename": row["filename"],
                                "chunk_index": row["chunk_index"],
                                "content": row["content"],
                                "source": row["source"],
                                "page_number": row["page_number"],
                            },
                        )
                    )
            results.sort(key=lambda item: item[0], reverse=True)
            return results[:top_k]
        except ImportError:
            q_norm = math.sqrt(sum(x * x for x in query_embedding))
            if q_norm == 0:
                return []

            results = []
            for row in rows:
                emb = json.loads(row["embedding"])
                c_norm = math.sqrt(sum(x * x for x in emb))
                if c_norm == 0:
                    continue
                dot = sum(q * c for q, c in zip(query_embedding, emb))
                score_val = max(0.0, min(1.0, float(dot / (q_norm * c_norm))))
                if score_val >= min_score:
                    results.append(
                        (
                            score_val,
                            {
                                "chunk_id": row["id"],
                                "document_id": row["document_id"],
                                "filename": row["filename"],
                                "chunk_index": row["chunk_index"],
                                "content": row["content"],
                                "source": row["source"],
                                "page_number": row["page_number"],
                            },
                        )
                    )
            results.sort(key=lambda item: item[0], reverse=True)
            return results[:top_k]

    def original_path(self, stored_filename: str) -> Path:
        path = (self.upload_dir / stored_filename).resolve()
        if self.upload_dir.resolve() not in path.parents:
            raise ValueError("Invalid stored filename")
        return path

    def set_index_config(self, config: dict[str, object]) -> None:
        serialized = json.dumps(config, sort_keys=True)
        with self.connection() as connection:
            current = connection.execute(
                "SELECT value FROM app_metadata WHERE key = 'index_config'"
            ).fetchone()
            if current and current[0] != serialized and self.count_documents() > 0:
                raise RuntimeError("Index configuration changed; clear and reindex documents")
            connection.execute(
                "INSERT OR REPLACE INTO app_metadata(key, value) VALUES ('index_config', ?)",
                (serialized,),
            )

    def allow_generation(self, now: int, per_minute: int, per_day: int) -> tuple[bool, int]:
        with self._lock, self.connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute("DELETE FROM generation_events WHERE occurred_at < ?", (now - 86400,))
            minute_count = connection.execute(
                "SELECT COUNT(*) FROM generation_events WHERE occurred_at >= ?", (now - 60,)
            ).fetchone()[0]
            day_count = connection.execute("SELECT COUNT(*) FROM generation_events").fetchone()[0]
            if minute_count >= per_minute:
                return False, 60
            if day_count >= per_day:
                return False, 3600
            connection.execute("INSERT INTO generation_events VALUES (?)", (now,))
            return True, 0
