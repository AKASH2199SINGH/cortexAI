from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from typing import List



class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponseData(BaseModel):
    reply: str
    session_id: Optional[str]


class ChatResponse(BaseModel):
    success: bool
    data: Optional[ChatResponseData]
    error: Optional[Dict]
    timestamp: datetime
from typing import List


class HistoryMessage(BaseModel):
    role: str
    content: str
    timestamp: str


class HistoryResponseData(BaseModel):
    session_id: str
    messages: List[HistoryMessage]
