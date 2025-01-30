from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
import logging
import uuid

from src.database import get_db
from src.services.repo_processor import RepoProcessor
from src.services.task_manager import TaskManager
from src.schemas.repository import (
    RepositoryCreate,
    File,
    ChatMessage,
    BestPractice,
    AnalysisResponse,
    JobStatus,
    Repository as RepositorySchema
)
from src.models.base import Repository

logger = logging.getLogger(__name__)

router = APIRouter()
task_manager = TaskManager()

@router.post("/process-repo", response_model=RepositorySchema)
async def process_repo(
    repo_data: RepositoryCreate,
    db: AsyncSession = Depends(get_db)
) -> RepositorySchema:
    """Process a new repository."""
    try:
        # Log request
        logger.info(f"Processing repository request: {repo_data.model_dump_json()}")
        
        # Validate input
        if not repo_data.url:
            raise HTTPException(status_code=400, detail="URL is required")
            
        if not isinstance(repo_data.url, str):
            raise HTTPException(status_code=400, detail="Invalid URL format")
            
        # Create processor
        processor = RepoProcessor(db)
        
        # Create repository
        repo = Repository(
            id=str(uuid.uuid4()),
            url=repo_data.url,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_valid=True,
            analysis_status="pending",
            analysis_progress=0.0
        )
        db.add(repo)
        await db.commit()
        logger.info(f"Created new repository: {repo.id}")

        # Queue analysis task
        task_id = task_manager.enqueue_repo_analysis(
            processor.process_repository,
            repo.id
        )
        logger.info(f"Successfully queued repository: {repo.id} (Job: {task_id})")

        return RepositorySchema.model_validate(repo)
        
    except Exception as e:
        logger.exception("Error processing repository")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}", response_model=RepositorySchema)
async def get_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> RepositorySchema:
    """Get repository by ID."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
        return RepositorySchema.model_validate(repo)
    except Exception as e:
        logger.exception(f"Error getting repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[RepositorySchema])
async def list_repos(
    db: AsyncSession = Depends(get_db)
) -> List[RepositorySchema]:
    """List all repositories."""
    try:
        processor = RepoProcessor(db)
        repos = await processor._list_repositories()
        return [RepositorySchema.model_validate(repo) for repo in repos]
    except Exception as e:
        logger.exception("Error listing repositories")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}/status", response_model=JobStatus)
async def get_repo_status(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> JobStatus:
    """Get repository processing status."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        return JobStatus(
            status=repo.analysis_status,
            progress=repo.analysis_progress,
            last_updated=repo.updated_at
        )
    except Exception as e:
        logger.exception(f"Error getting repository status {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{repo_id}/refresh")
async def refresh_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> RepositorySchema:
    """Refresh a repository's data."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        # Queue analysis task
        task_id = task_manager.enqueue_repo_analysis(
            processor.process_repository,
            repo.id
        )
        logger.info(f"Successfully queued repository refresh: {repo.id} (Job: {task_id})")
        
        return RepositorySchema.model_validate(repo)
    except Exception as e:
        logger.exception(f"Error refreshing repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{repo_id}/cancel")
async def cancel_processing(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> RepositorySchema:
    """Cancel repository processing."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        # Update status
        repo.analysis_status = "cancelled"
        repo.analysis_progress = 0.0
        repo.updated_at = datetime.utcnow()
        db.add(repo)
        await db.commit()
        
        return RepositorySchema.model_validate(repo)
    except Exception as e:
        logger.exception(f"Error cancelling repository processing {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{repo_id}")
async def delete_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a repository."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        await processor._delete_repository(repo)
        return {"status": "success", "message": "Repository deleted"}
    except Exception as e:
        logger.exception(f"Error deleting repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}/analysis", response_model=AnalysisResponse)
async def analyze_repo(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> AnalysisResponse:
    """Analyze a repository's code."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        analysis = await processor._get_analysis(repo)
        return AnalysisResponse(
            repository=RepositorySchema.model_validate(repo),
            analysis=analysis
        )
    except Exception as e:
        logger.exception(f"Error analyzing repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}/files/{file_path:path}")
async def get_file(
    repo_id: str,
    file_path: str,
    detailed: bool = False,
    db: AsyncSession = Depends(get_db)
) -> File:
    """Get file contents and analysis."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        file = await processor._get_file(repo, file_path)
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
            
        return File.model_validate(file)
    except Exception as e:
        logger.exception(f"Error getting file {file_path} from repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{repo_id}/chat")
async def create_chat_message(
    repo_id: str,
    message: str,
    db: AsyncSession = Depends(get_db)
) -> ChatMessage:
    """Create a new chat message and get AI response."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        response = await processor._process_chat_message(repo, message)
        return ChatMessage.model_validate(response)
    except Exception as e:
        logger.exception(f"Error processing chat message for repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}/chat")
async def get_chat_history(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> List[ChatMessage]:
    """Get chat history for a repository."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        messages = await processor._get_chat_history(repo)
        return [ChatMessage.model_validate(msg) for msg in messages]
    except Exception as e:
        logger.exception(f"Error getting chat history for repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_id}/practices")
async def get_repo_practices(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> List[BestPractice]:
    """Get best practices for a repository."""
    try:
        processor = RepoProcessor(db)
        repo = await processor._get_repository(repo_id)
        if not repo:
            raise HTTPException(status_code=404, detail="Repository not found")
            
        practices = await processor._get_best_practices(repo)
        return [BestPractice.model_validate(practice) for practice in practices]
    except Exception as e:
        logger.exception(f"Error getting best practices for repository {repo_id}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/practices/global")
async def get_global_practices(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> List[BestPractice]:
    """Get global best practices."""
    try:
        processor = RepoProcessor(db)
        practices = await processor._get_global_practices(category)
        return [BestPractice.model_validate(practice) for practice in practices]
    except Exception as e:
        logger.exception("Error getting global best practices")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/practices/{practice_id}/generalize")
async def mark_practice_generalizable(
    practice_id: str,
    db: AsyncSession = Depends(get_db)
) -> BestPractice:
    """Mark a best practice as generalizable."""
    try:
        processor = RepoProcessor(db)
        practice = await processor._mark_practice_generalizable(practice_id)
        return BestPractice.model_validate(practice)
    except Exception as e:
        logger.exception(f"Error marking practice {practice_id} as generalizable")
        raise HTTPException(status_code=500, detail=str(e))
