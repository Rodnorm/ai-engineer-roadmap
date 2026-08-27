"""SQLite request log persistent per client_id."""
from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from models import RequestEntry

# 1. Definir onde o arquivo .db será salvo:
# Na Vercel, o único diretório com permissão de escrita é o /tmp
# Localmente, usamos o próprio diretório do backend.
if os.getenv("VERCEL"):
    DB_PATH = Path("/tmp/prompt_forge.db")
else:
    DB_PATH = Path(__file__).parent / "prompt_forge.db"


def _get_connection() -> sqlite3.Connection:
    """Cria e retorna uma conexão configurada com o SQLite."""
    conn = sqlite3.connect(str(DB_PATH))
    # Permite acessar colunas pelo nome (ex: row["brief"]):
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Cria a tabela e índices se ainda não existirem."""
    with _get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS request_logs (
                id TEXT PRIMARY KEY,
                client_id TEXT NOT NULL,
                brief TEXT NOT NULL,
                persona TEXT NOT NULL,
                tokens INTEGER NOT NULL,
                cost REAL NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        # Índice para acelerar a busca dos logs por usuário em ordem decrescente de data:
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_logs_client
            ON request_logs(client_id, created_at DESC);
        """)


def append(
    *,
    client_id: str,
    brief: str,
    persona: str,
    tokens: int,
    cost: float,
    status: str,
) -> RequestEntry:
    """Insere um novo log atrelado ao client_id do usuário."""
    log_id = str(uuid4())
    now_utc = datetime.now(timezone.utc)
    created_at_iso = now_utc.isoformat()

    with _get_connection() as conn:
        conn.execute(
            """
            INSERT INTO request_logs (id, client_id, brief, persona, tokens, cost, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (log_id, client_id, brief[:120], persona, tokens, cost, status, created_at_iso),
        )

    return RequestEntry(
        id=log_id,
        brief=brief[:120],
        persona=persona,
        tokens=tokens,
        cost=cost,
        status=status,
        createdAt=now_utc,
    )


def recent(client_id: str, limit: int = 20) -> list[RequestEntry]:
    """Retorna os logs mais recentes de um client_id específico."""
    with _get_connection() as conn:
        cursor = conn.execute(
            """
            SELECT id, brief, persona, tokens, cost, status, created_at
            FROM request_logs
            WHERE client_id = ?
            ORDER BY created_at DESC
            LIMIT ?;
            """,
            (client_id, limit),
        )
        rows = cursor.fetchall()

    entries = []
    for row in rows:
        entries.append(
            RequestEntry(
                id=row["id"],
                brief=row["brief"],
                persona=row["persona"],
                tokens=row["tokens"],
                cost=row["cost"],
                status=row["status"],
                createdAt=datetime.fromisoformat(row["created_at"]),
            )
        )
    return entries


def delete_entry(client_id: str, entry_id: str) -> bool:
    """Deleta um log específico garantindo que pertença ao client_id."""
    with _get_connection() as conn:
        cursor = conn.execute(
            """
            DELETE FROM request_logs
            WHERE id = ? AND client_id = ?;
            """,
            (entry_id, client_id),
        )
        # rowcount indica quantas linhas foram deletadas (0 se não achou ou não pertencia ao usuário)
        return cursor.rowcount > 0


def clear_all(client_id: str) -> int:
    """Deleta todos os logs daquele client_id."""
    with _get_connection() as conn:
        cursor = conn.execute(
            """
            DELETE FROM request_logs
            WHERE client_id = ?;
            """,
            (client_id,),
        )
        return cursor.rowcount

# Inicializa o banco automaticamente ao importar o módulo
init_db()
