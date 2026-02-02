from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket
from app.api.websocket import chat_websocket
from app.api.rag import router as rag_router

from app.api.chat import router as chat_router

app = FastAPI(title="Personal AI Assistant Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend-friendly (dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(rag_router)

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await chat_websocket(websocket)
