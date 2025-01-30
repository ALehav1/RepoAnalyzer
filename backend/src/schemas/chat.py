from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ChatMessageBase(BaseModel):
    content: str
    repository_ids: Optional[List[str]] = None

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: str
    response: str
    created_at: datetime

    class Config:
        from_attributes = True
