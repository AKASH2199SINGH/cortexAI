from pypdf import PdfReader
from app.core.embeddings import embed_text
from app.core.vector_store import add_vector, init_db
from app.core.embeddings import embed_text
from app.core.vector_store import search_similar

CHUNK_SIZE = 500


def ingest_pdf(file_path: str, doc_id: str):
    init_db()

    reader = PdfReader(file_path)
    full_text = ""

    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    chunks = [
        full_text[i:i + CHUNK_SIZE]
        for i in range(0, len(full_text), CHUNK_SIZE)
    ]

    for chunk in chunks:
        embedding = embed_text(chunk)
        add_vector(doc_id, chunk, embedding)

def get_rag_context(
    question: str,
    doc_ids: list[str] | None = None,
    max_chars=1800
) -> str:

    query_embedding = embed_text(question)
    top_chunks = search_similar(query_embedding, doc_ids)

    context = ""
    for chunk in top_chunks:
        if len(context) + len(chunk) > max_chars:
            break
        context += chunk + "\n\n"

    return context


