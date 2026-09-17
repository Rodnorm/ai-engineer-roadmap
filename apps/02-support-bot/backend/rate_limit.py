"""SQLite-backed request quotas for single-host public AI demos."""

from __future__ import annotations

import math
import sqlite3
import threading
from dataclasses import dataclass
from pathlib import Path
from time import time
from typing import Callable


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    scope: str | None = None
    retry_after: int = 0


class PersistentRateLimiter:
    """Atomic sliding-window quotas shared by workers using the same SQLite file."""

    def __init__(
        self,
        requests_per_minute: int,
        requests_per_day_per_ip: int,
        global_requests_per_day: int,
        database_path: str,
        clock: Callable[[], float] = time,
    ) -> None:
        self.requests_per_minute = requests_per_minute
        self.requests_per_day_per_ip = requests_per_day_per_ip
        self.global_requests_per_day = global_requests_per_day
        self.database_path = database_path
        self._clock = clock
        self._setup_lock = threading.Lock()
        self._initialized = False
        if database_path != ":memory:":
            Path(database_path).expanduser().resolve().parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(
            self.database_path,
            timeout=5,
            isolation_level=None,
            check_same_thread=False,
        )
        connection.execute("PRAGMA busy_timeout = 5000")
        if self.database_path != ":memory:":
            connection.execute("PRAGMA journal_mode = WAL")
            connection.execute("PRAGMA synchronous = NORMAL")
        return connection

    def _initialize(self) -> None:
        with self._setup_lock:
            if self._initialized:
                return
            connection = self._connect()
            try:
                connection.execute(
                    """
                    CREATE TABLE IF NOT EXISTS rate_limit_events (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        client_key TEXT NOT NULL,
                        created_at REAL NOT NULL
                    )
                    """
                )
                connection.execute(
                    "CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at "
                    "ON rate_limit_events(created_at)"
                )
                connection.execute(
                    "CREATE INDEX IF NOT EXISTS idx_rate_limit_client_created "
                    "ON rate_limit_events(client_key, created_at)"
                )
            finally:
                connection.close()
            self._initialized = True

    def reset(self) -> None:
        connection = self._connect()
        try:
            connection.execute("DELETE FROM rate_limit_events")
        finally:
            connection.close()

    def check_and_record(self, client_key: str) -> RateLimitDecision:
        now = self._clock()
        minute_cutoff = now - 60
        day_cutoff = now - 86400
        connection = self._connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute(
                "DELETE FROM rate_limit_events WHERE created_at <= ?",
                (day_cutoff,),
            )

            minute_count, minute_oldest = connection.execute(
                """
                SELECT COUNT(*), MIN(created_at)
                FROM rate_limit_events
                WHERE client_key = ? AND created_at > ?
                """,
                (client_key, minute_cutoff),
            ).fetchone()
            if minute_count >= self.requests_per_minute:
                connection.execute("COMMIT")
                retry_after = max(1, math.ceil(60 - (now - minute_oldest)))
                return RateLimitDecision(False, "minute_per_ip", retry_after)

            day_count, day_oldest = connection.execute(
                """
                SELECT COUNT(*), MIN(created_at)
                FROM rate_limit_events
                WHERE client_key = ? AND created_at > ?
                """,
                (client_key, day_cutoff),
            ).fetchone()
            if day_count >= self.requests_per_day_per_ip:
                connection.execute("COMMIT")
                retry_after = max(1, math.ceil(86400 - (now - day_oldest)))
                return RateLimitDecision(False, "day_per_ip", retry_after)

            global_count, global_oldest = connection.execute(
                """
                SELECT COUNT(*), MIN(created_at)
                FROM rate_limit_events
                WHERE created_at > ?
                """,
                (day_cutoff,),
            ).fetchone()
            if global_count >= self.global_requests_per_day:
                connection.execute("COMMIT")
                retry_after = max(1, math.ceil(86400 - (now - global_oldest)))
                return RateLimitDecision(False, "global_day", retry_after)

            connection.execute(
                "INSERT INTO rate_limit_events(client_key, created_at) VALUES (?, ?)",
                (client_key, now),
            )
            connection.execute("COMMIT")
            return RateLimitDecision(True)
        except Exception:
            if connection.in_transaction:
                connection.execute("ROLLBACK")
            raise
        finally:
            connection.close()
