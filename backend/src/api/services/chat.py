"""Chat service for handling chat-related operations."""

from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import ChatMessage as ChatMessageModel
from ..schemas.chat import ChatMessageCreate

class ChatService:
    """Service for managing chat operations."""

    def __init__(self, db: Session):
        """Initialize chat service with database session."""
        self.db = db

    def create_message(self, message: ChatMessageCreate, repository_id: Optional[str] = None) -> ChatMessageModel:
        """Create a new chat message."""
        db_message = ChatMessageModel(
            content=message.content,
            repository_id=repository_id
        )
        self.db.add(db_message)
        self.db.commit()
        self.db.refresh(db_message)
        return db_message

    def get_messages(self, repository_id: Optional[str] = None) -> List[ChatMessageModel]:
        """Get all chat messages, optionally filtered by repository."""
        query = self.db.query(ChatMessageModel)
        if repository_id:
            query = query.filter(ChatMessageModel.repository_id == repository_id)
        return query.all()
