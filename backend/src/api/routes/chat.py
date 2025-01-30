from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..schemas import chat
from ..services.chat import ChatService
from ..database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/chat", response_model=chat.ChatMessage)
async def create_global_chat_message(
    message: chat.ChatMessageCreate,
    repository_ids: Optional[List[str]] = None,
    db: Session = Depends(get_db),
):
    """Create a new chat message in the global context"""
    try:
        chat_service = ChatService(db)
        return await chat_service.create_message(message.content, repository_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat", response_model=List[chat.ChatMessage])
async def get_global_chat_history(db: Session = Depends(get_db)):
    """Get all global chat messages"""
    try:
        chat_service = ChatService(db)
        return await chat_service.get_messages()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/repos/{repo_id}/chat", response_model=chat.ChatMessage)
async def create_repo_chat_message(
    repo_id: str,
    message: chat.ChatMessageCreate,
    db: Session = Depends(get_db),
):
    """Create a new chat message for a specific repository"""
    try:
        chat_service = ChatService(db)
        return await chat_service.create_message(message.content, [repo_id])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/repos/{repo_id}/chat", response_model=List[chat.ChatMessage])
async def get_repo_chat_history(repo_id: str, db: Session = Depends(get_db)):
    """Get all chat messages for a specific repository"""
    try:
        chat_service = ChatService(db)
        return await chat_service.get_messages(repo_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
