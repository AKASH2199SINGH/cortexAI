# app/core/memory.py

from datetime import datetime
import uuid
from typing import List

from app.core.db import get_connection, init_db


class MemoryStore:
    def __init__(self):
        init_db()

    def get_session_id(self, session_id: str | None) -> str:
        if session_id is None:
            return str(uuid.uuid4())
        return session_id

    def add_message(self, session_id: str, role: str, content: str):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO messages (session_id, role, content, timestamp)
            VALUES (?, ?, ?, ?)
            """,
            (
                session_id,
                role,
                content,
                datetime.utcnow().isoformat()
            )
        )

        conn.commit()
        conn.close()

    def get_history(self, session_id: str) -> List[dict]:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT role, content, timestamp
            FROM messages
            WHERE session_id = ?
            ORDER BY id ASC
            """,
            (session_id,)
        )

        rows = cursor.fetchall()
        conn.close()

        return [
            {
                "role": row["role"],
                "content": row["content"],
                "timestamp": row["timestamp"]
            }
            for row in rows
        ]


memory_store = MemoryStore()
