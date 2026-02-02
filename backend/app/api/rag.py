from fastapi import APIRouter, UploadFile, File
import os
from app.core.rag import ingest_pdf

router = APIRouter(prefix="/rag", tags=["RAG"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    doc_id: str = "default"
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    ingest_pdf(file_path, doc_id)

    return {
        "success": True,
        "message": "PDF ingested successfully",
        "doc_id": doc_id
    }
