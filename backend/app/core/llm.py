# app/core/llm.py

from openai import OpenAI
from app.core.rag import get_rag_context
from app.core.stream_manager import stream_manager
from app.core.memory import memory_store
from app.core.config import settings
from app.core.rag import get_rag_context
from app.core.rag import get_rag_context

# Initialize OpenAI client using settings
client = OpenAI(api_key=settings.OPENAI_API_KEY)


# def build_messages(session_id: str, user_message: str):
#     """
#     Convert stored history into OpenAI chat format.
#     """
#     history = memory_store.get_history(session_id)

#     messages = [
#         {
#             "role": "system",
#             "content": "You are a helpful, concise assistant."
#         }
#     ]

#     for msg in history:
#         messages.append({
#             "role": msg["role"],
#             "content": msg["content"]
#         })

#     messages.append({
#         "role": "user",
#         "content": user_message
#     })

#     return messages
def build_messages(session_id: str, user_message: str, context: str | None = None):

    history = memory_store.get_history(session_id)

    messages = [{
        "role": "system",
        "content": "You are a helpful assistant. Use the provided context to answer."
    }]

    if context:
        messages.append({
            "role": "system",
            "content": f"Context:\n{context}"
        })

    for msg in history:
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    messages.append({
        "role": "user",
        "content": user_message
    })

    return messages



# def get_llm_response(message: str, session_id: str) -> str:
#     """
#     Non-streaming LLM response.
#     """

#     if not settings.OPENAI_API_KEY:
#         return "OPENAI_API_KEY is not set. Please configure it in the .env file."

#     messages = build_messages(session_id, message)

#     response = client.chat.completions.create(
#         model=settings.OPENAI_MODEL,
#         messages=messages,
#         temperature=0.7
#     )

#     return response.choices[0].message.content
def get_llm_response(message: str, session_id: str) -> str:
    if not settings.OPENAI_API_KEY:
        return "OPENAI_API_KEY not set"

    context = get_rag_context(message)

    messages = build_messages(
        session_id=session_id,
        user_message=message,
        context=context
    )

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7
    )

    return response.choices[0].message.content

def stream_llm_response(message: str, session_id: str, doc_ids=None):

    context = get_rag_context(message, doc_ids)
    messages = build_messages(session_id, message, context)

    stream = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        stream=True
    )

    for chunk in stream:
        delta = chunk.choices[0].delta
        if delta and delta.content:
            yield delta.content
