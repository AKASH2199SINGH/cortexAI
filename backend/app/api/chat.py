# app/api/chat.py

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from datetime import datetime

from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm import get_llm_response, stream_llm_response
from app.core.memory import memory_store
from app.core.stream_manager import stream_manager

router = APIRouter()


# -------------------------
# NORMAL CHAT (NON-STREAM)
# -------------------------
@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):

    # 1. Get or create session_id
    session_id = memory_store.get_session_id(request.session_id)

    # 2. Store user message
    memory_store.add_message(
        session_id=session_id,
        role="user",
        content=request.message
    )

    # 3. Get LLM reply
    reply = get_llm_response(
        message=request.message,
        session_id=session_id
    )

    # 4. Store assistant reply
    memory_store.add_message(
        session_id=session_id,
        role="assistant",
        content=reply
    )

    return {
        "success": True,
        "data": {
            "reply": reply,
            "session_id": session_id
        },
        "error": None,
        "timestamp": datetime.utcnow()
    }


# -------------------------
# CHAT HISTORY
# -------------------------
@router.get("/history/{session_id}", response_model=dict)
def get_chat_history(session_id: str):

    messages = memory_store.get_history(session_id)

    return {
        "success": True,
        "data": {
            "session_id": session_id,
            "messages": messages
        },
        "error": None,
        "timestamp": datetime.utcnow()
    }


# -------------------------
# STREAMING CHAT (SSE)
# -------------------------
@router.post("/chat/stream")
def chat_stream(request: ChatRequest):

    session_id = memory_store.get_session_id(request.session_id)

    # mark stream as active
    stream_manager.start(session_id)

    # store user message
    memory_store.add_message(
        session_id=session_id,
        role="user",
        content=request.message
    )

    def event_generator():
        full_reply = ""

        for chunk in stream_llm_response(request.message, session_id):
            if not stream_manager.is_active(session_id):
                break

            full_reply += chunk
            yield f"data: {chunk}\n\n"

        # store assistant message after stream completes or cancel
        memory_store.add_message(
            session_id=session_id,
            role="assistant",
            content=full_reply
        )

        stream_manager.stop(session_id)
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


# -------------------------
# CANCEL STREAM
# -------------------------
@router.post("/chat/cancel/{session_id}")
def cancel_stream(session_id: str):
    stream_manager.stop(session_id)

    return {
        "success": True,
        "data": {
            "message": "Stream cancelled",
            "session_id": session_id
        },
        "error": None,
        "timestamp": datetime.utcnow()
    }
