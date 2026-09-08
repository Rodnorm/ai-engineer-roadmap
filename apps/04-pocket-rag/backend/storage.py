import json
import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

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
                    source TEXT NOT NULL DEFAULT 'upload'
                );
                CREATE INDEX IF NOT EXISTS idx_documents_sha256
                    ON documents(content_sha256);
                CREATE TABLE IF NOT EXISTS app_metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS generation_events (
                    occurred_at INTEGER NOT NULL
                );
                """
            )
            columns = {row[1] for row in connection.execute("PRAGMA table_info(documents)")}
            if "source" not in columns:
                connection.execute(
                    "ALTER TABLE documents ADD COLUMN source TEXT NOT NULL DEFAULT 'upload'"
                )

    def list_documents(self, source: str | None = None) -> list[DocumentItem]:
        where = " WHERE source = ?" if source else ""
        parameters = (source,) if source else ()
        with self.connection() as connection:
            rows = connection.execute(
                "SELECT id, filename, file_type, file_size_bytes, chunks_count, created_at, source "
                f"FROM documents{where} ORDER BY created_at DESC",
                parameters,
            ).fetchall()
        return [DocumentItem(**dict(row)) for row in rows]

    def count_documents(self, source: str | None = None) -> int:
        where = " WHERE source = ?" if source else ""
        parameters = (source,) if source else ()
        with self.connection() as connection:
            return int(connection.execute(f"SELECT COUNT(*) FROM documents{where}", parameters).fetchone()[0])

    def get_record(self, document_id: str) -> sqlite3.Row | None:
        with self.connection() as connection:
            return connection.execute(
                "SELECT * FROM documents WHERE id = ?", (document_id,)
            ).fetchone()

    def find_by_hash(self, content_sha256: str) -> sqlite3.Row | None:
        with self.connection() as connection:
            return connection.execute(
                "SELECT * FROM documents WHERE content_sha256 = ?", (content_sha256,)
            ).fetchone()

    def add(self, item: DocumentItem, stored_filename: str, content_sha256: str) -> None:
        with self._lock, self.connection() as connection:
            connection.execute(
                "INSERT INTO documents "
                "(id, filename, file_type, file_size_bytes, chunks_count, created_at, stored_filename, content_sha256, source) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
                ),
            )

    def delete_metadata(self, document_id: str) -> None:
        with self._lock, self.connection() as connection:
            cursor = connection.execute("DELETE FROM documents WHERE id = ?", (document_id,))
            if cursor.rowcount != 1:
                raise KeyError(document_id)

    def clear_metadata(self, source: str | None = None) -> None:
        with self._lock, self.connection() as connection:
            if source:
                connection.execute("DELETE FROM documents WHERE source = ?", (source,))
            else:
                connection.execute("DELETE FROM documents")

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
