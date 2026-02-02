from fastapi import WebSocket, WebSocketDisconnect
from app.core.llm import stream_llm_response
from app.core.memory import memory_store
from app.core.stream_manager import stream_manager


async def chat_websocket(websocket: WebSocket):
    await websocket.accept()

    session_id = None
    full_reply = ""

    try:
        while True:
            data = await websocket.receive_json()

            # Support BOTH old (action) and new (type) protocols
            msg_type = data.get("type") or data.get("action")

            # ----------------
            # START CHAT
            # ----------------
            if msg_type in ("start", "user_message"):
                session_id = memory_store.get_session_id(
                    data.get("session_id")
                )

                # Support both formats
                user_message = data.get("message") or data.get("content")

                # 🔥 multi-PDF support
                doc_ids = data.get("doc_ids")

                # mark stream active
                stream_manager.start(session_id)

                # store user message
                memory_store.add_message(
                    session_id=session_id,
                    role="user",
                    content=user_message
                )

                full_reply = ""

                # 🔔 tell frontend assistant has started
                await websocket.send_json({
                    "type": "assistant_start"
                })

                # stream tokens (RAG + multi-PDF)
                for chunk in stream_llm_response(
                    user_message,
                    session_id,
                    doc_ids=doc_ids
                ):
                    if not stream_manager.is_active(session_id):
                        break

                    full_reply += chunk

                    # 🔔 stream token to frontend
                    await websocket.send_json({
                        "type": "assistant_token",
                        "content": chunk
                    })

                # store assistant reply
                memory_store.add_message(
                    session_id=session_id,
                    role="assistant",
                    content=full_reply
                )

                stream_manager.stop(session_id)

                # 🔔 tell frontend assistant is done
                await websocket.send_json({
                    "type": "assistant_end"
                })

            # ----------------
            # CANCEL CHAT
            # ----------------
            elif msg_type == "cancel" and session_id:
                stream_manager.stop(session_id)

                await websocket.send_json({
                    "type": "error",
                    "content": "Generation cancelled"
                })

    except WebSocketDisconnect:
        if session_id:
            stream_manager.stop(session_id)
