import sqlite3
import json
import math

DB_PATH = "rag_vectors.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vectors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT,
            chunk TEXT,
            embedding TEXT
        )
    """)
    conn.commit()
    conn.close()


def add_vector(doc_id: str, chunk: str, embedding: list[float]):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO vectors (doc_id, chunk, embedding) VALUES (?, ?, ?)",
        (doc_id, chunk, json.dumps(embedding))
    )
    conn.commit()
    conn.close()


def cosine_similarity(a, b):
    dot = sum(x*y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x*x for x in a))
    mag_b = math.sqrt(sum(y*y for y in b))
    return dot / (mag_a * mag_b)
def get_all_vectors(doc_ids: list[str] | None = None):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    if doc_ids:
        placeholders = ",".join("?" * len(doc_ids))
        cur.execute(
            f"SELECT chunk, embedding FROM vectors WHERE doc_id IN ({placeholders})",
            doc_ids
        )
    else:
        # ALL PDFs
        cur.execute("SELECT chunk, embedding FROM vectors")

    rows = cur.fetchall()
    conn.close()

    return [(chunk, json.loads(emb)) for chunk, emb in rows]



def search_similar(query_embedding, doc_ids=None, top_k=4):
    vectors = get_all_vectors(doc_ids)

    scored = []
    for chunk, embedding in vectors:
        score = cosine_similarity(query_embedding, embedding)
        scored.append((score, chunk))

    scored.sort(reverse=True, key=lambda x: x[0])
    return [chunk for _, chunk in scored[:top_k]]

