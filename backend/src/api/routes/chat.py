"""Chat routes for managing repository-related conversations."""
from fastapi import APIRouter, Depends
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.chat import (
    ChatMessage,
    ChatMessageCreate
)
from ...services.chat import ChatService
from ...database import get_db
from ...core.exceptions import (
    DatabaseError,
    NotFoundError,
    ValidationError
)
from ...core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("/chat", response_model=ChatMessage)
async def create_global_chat_message(
    message: ChatMessageCreate,
    repository_ids: Optional[List[str]] = None,
    db: AsyncSession = Depends(get_db),
) -> ChatMessage:
    """Create a new chat message in the global context.
    
    Args:
        message: Message content
        repository_ids: Optional list of repository IDs to associate with
        db: Database session
        
    Returns:
        Created chat message
        
    Raises:
        ValidationError: If message content is invalid
        DatabaseError: If database operation fails
    """
    try:
        if not message.content.strip():
            raise ValidationError(
                message="Message content cannot be empty",
                details={"content": message.content}
            )
            
        chat_service = ChatService(db)
        created_message = await chat_service.create_message(
            message.content,
            repository_ids
        )
        
        logger.info(
            "chat_message_created",
            message_id=created_message.id,
            repository_ids=repository_ids
        )
        
        return created_message
        
    except ValidationError:
        logger.error(
            "message_creation_failed",
            error="Invalid message content",
            error_type="validation_error",
            content=message.content,
            exc_info=True
        )
        raise
        
    except DatabaseError as e:
        logger.error(
            "message_creation_failed",
            error=str(e),
            error_type="database_error",
            repository_ids=repository_ids,
            exc_info=True
        )
        raise

@router.get("/chat", response_model=List[ChatMessage])
async def get_global_chat_history(
    db: AsyncSession = Depends(get_db)
) -> List[ChatMessage]:
    """Get all global chat messages.
    
    Args:
        db: Database session
        
    Returns:
        List of chat messages
        
    Raises:
        DatabaseError: If database operation fails
    """
    try:
        chat_service = ChatService(db)
        messages = await chat_service.get_messages()
        
        logger.info(
            "global_chat_history_retrieved",
            message_count=len(messages)
        )
        
        return messages
        
    except DatabaseError as e:
        logger.error(
            "chat_history_retrieval_failed",
            error=str(e),
            error_type="database_error",
            exc_info=True
        )
        raise

@router.post("/repos/{repo_id}/chat", response_model=ChatMessage)
async def create_repo_chat_message(
    repo_id: str,
    message: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
) -> ChatMessage:
    """Create a new chat message for a specific repository.
    
    Args:
        repo_id: Repository ID
        message: Message content
        db: Database session
        
    Returns:
        Created chat message
        
    Raises:
        ValidationError: If message content is invalid
        NotFoundError: If repository not found
        DatabaseError: If database operation fails
    """
    try:
        if not message.content.strip():
            raise ValidationError(
                message="Message content cannot be empty",
                details={"content": message.content}
            )
            
        chat_service = ChatService(db)
        created_message = await chat_service.create_message(
            message.content,
            [repo_id]
        )
        
        logger.info(
            "repo_chat_message_created",
            message_id=created_message.id,
            repo_id=repo_id
        )
        
        return created_message
        
    except ValidationError:
        logger.error(
            "message_creation_failed",
            error="Invalid message content",
            error_type="validation_error",
            content=message.content,
            repo_id=repo_id,
            exc_info=True
        )
        raise
        
    except NotFoundError:
        logger.error(
            "message_creation_failed",
            error="Repository not found",
            error_type="not_found",
            repo_id=repo_id,
            exc_info=True
        )
        raise
        
    except DatabaseError as e:
        logger.error(
            "message_creation_failed",
            error=str(e),
            error_type="database_error",
            repo_id=repo_id,
            exc_info=True
        )
        raise

@router.get("/repos/{repo_id}/chat", response_model=List[ChatMessage])
async def get_repo_chat_history(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> List[ChatMessage]:
    """Get all chat messages for a specific repository.
    
    Args:
        repo_id: Repository ID
        db: Database session
        
    Returns:
        List of chat messages
        
    Raises:
        NotFoundError: If repository not found
        DatabaseError: If database operation fails
    """
    try:
        chat_service = ChatService(db)
        messages = await chat_service.get_messages(repo_id)
        
        logger.info(
            "repo_chat_history_retrieved",
            repo_id=repo_id,
            message_count=len(messages)
        )
        
        return messages
        
    except NotFoundError:
        logger.error(
            "chat_history_retrieval_failed",
            error="Repository not found",
            error_type="not_found",
            repo_id=repo_id,
            exc_info=True
        )
        raise
        
    except DatabaseError as e:
        logger.error(
            "chat_history_retrieval_failed",
            error=str(e),
            error_type="database_error",
            repo_id=repo_id,
            exc_info=True
        )
        raise
