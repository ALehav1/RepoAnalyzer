"""Chat service for handling chat operations."""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from ..models.base import Repository, ChatMessage
from ..schemas.chat import ChatMessageCreate
import logging
import uuid
from datetime import datetime
from openai import AsyncOpenAI
from ..core.config import get_settings
from ..models.base import Repository

logger = logging.getLogger(__name__)
settings = get_settings()

class ChatService:
    """Service for managing chat operations."""

    def __init__(self, db: Session):
        """Initialize chat service with database session."""
        self.db = db
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def create_message(
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
                response = await self._generate_response(repository_id, content, context)
                return response
            return message
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create chat message: {str(e)}")
            raise

    async def _generate_response(
        self,
        repository_id: str,
        user_message: str,
        context: Optional[Dict] = None
    ) -> ChatMessage:
        """Generate an AI response to the user's message."""
        try:
            # Get repository information
            repository = self.db.query(Repository).filter(Repository.id == repository_id).first()
            if not repository:
                raise ValueError(f"Repository with id {repository_id} not found")

            # Build system prompt
            system_prompt = f"""You are an AI assistant helping with the GitHub repository: {repository.name}.
This repository is written in {repository.primary_language or 'multiple languages'}.
Your task is to help users understand and work with this repository.

Repository description: {repository.description or 'No description available'}

Please provide helpful, accurate, and concise responses about this repository.
If you're not sure about something, say so rather than making assumptions."""

            # Get chat history for context
            history = self.get_chat_history(repository_id)
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add recent history (last 5 messages)
            for msg in history[-5:]:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            # Add current message
            messages.append({
                "role": "user",
                "content": user_message
            })

            # Get response from OpenAI
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )

            response_content = response.choices[0].message.content

            # Create and save assistant message
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
