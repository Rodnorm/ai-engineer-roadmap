"""In-memory request log (process-local, max 100 entries)."""
from __future__ import annotations

from collections import deque
from datetime import datetime, timezone
from threading import Lock
from uuid import uuid4

from models import RequestEntry


_MAX_ENTRIES = 100

_lock = Lock()
_entries: deque[RequestEntry] = deque(maxlen=_MAX_ENTRIES)


def append(*, brief: str, persona: str, tokens: int, cost: float, status: str) -> RequestEntry:
    entry = RequestEntry(
        id=str(uuid4()),
        brief=brief[:120],
        persona=persona,
        tokens=tokens,
        cost=cost,
        status=status,
        createdAt=datetime.now(timezone.utc),
    )
    with _lock:
        _entries.appendleft(entry)
    return entry


def recent(limit: int = 20) -> list[RequestEntry]:
    with _lock:
        return list(_entries)[:limit]
