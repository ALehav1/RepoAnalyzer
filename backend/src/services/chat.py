"""Chat service for handling chat operations."""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from ..models.base import Repository, ChatMessage
from ..schemas.chat import ChatMessageCreate
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class ChatService:
    """Service for managing chat operations."""

    def __init__(self, db: Session):
        """Initialize chat service with database session."""
        self.db = db

    def create_message(
        self,
        repository_id: str,
        content: str,
        role: str = "user",
        context: Optional[Dict] = None
    ) -> ChatMessage:
        """Create a new chat message."""
        try:
            message = ChatMessage(
                id=str(uuid.uuid4()),
                repository_id=repository_id,
                content=content,
                role=role,
                context=context,
                timestamp=datetime.utcnow()
            )
            self.db.add(message)
            self.db.commit()
            self.db.refresh(message)
            logger.info(f"Created chat message {message.id}")
            if role == "user":
                # Generate AI response
                response = self._generate_response(repository_id, content, context)
                return response
            return message
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create chat message: {str(e)}")
            raise

    def _generate_response(
        self,
        repository_id: str,
        user_message: str,
        context: Optional[Dict] = None
    ) -> ChatMessage:
        """Generate an AI response to the user's message."""
        try:
            # TODO: Implement actual LLM chat response
            response_content = "AI response placeholder"
            
            message = ChatMessage(
                id=str(uuid.uuid4()),
                repository_id=repository_id,
                content=response_content,
                role="assistant",
                context=context,
                timestamp=datetime.utcnow()
            )
            
            self.db.add(message)
            self.db.commit()
            self.db.refresh(message)
            
            return message
            
        except Exception as e:
            logger.error(f"Error generating chat response: {e}")
            raise

    def get_chat_history(self, repository_id: str) -> List[ChatMessage]:
        """Get chat history for a repository."""
        try:
            query = self.db.query(ChatMessage)
            messages = query.filter(ChatMessage.repository_id == repository_id).order_by(ChatMessage.timestamp).all()
            logger.info(f"Retrieved {len(messages)} chat messages")
            return messages
        except Exception as e:
            logger.error(f"Failed to get chat messages: {str(e)}")
            raise
