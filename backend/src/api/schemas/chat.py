"""Chat-related Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessageBase(BaseModel):
    """Base schema for chat messages."""
    content: str

class ChatMessageCreate(ChatMessageBase):
    """Schema for creating chat messages."""
    pass

class ChatMessage(ChatMessageBase):
    """Schema for chat message responses."""
    id: str
    repository_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    """Schema for chat requests."""
    repo_ids: List[str]
    message: str
    context: Optional[Dict[str, Any]]

class ChatResponse(BaseModel):
    """Schema for chat responses."""
    message: str
    context: Optional[Dict[str, Any]]
    references: Optional[List[Dict[str, Any]]]
