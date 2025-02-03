"""Best practices routes for managing repository-specific and global best practices."""
from fastapi import APIRouter, Depends
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from ...schemas.practices import (
    BestPractice,
    BestPracticeCreate
)
from ...services.practices import BestPracticesService
from ...database import get_db
from ...core.exceptions import (
    DatabaseError,
    NotFoundError,
    ValidationError
)
from ...core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.get("/practices", response_model=List[BestPractice])
async def get_global_practices(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> List[BestPractice]:
    """Get all global best practices, optionally filtered by category.
    
    Args:
        category: Optional category to filter practices
        db: Database session
        
    Returns:
        List of best practices
        
    Raises:
        DatabaseError: If database operation fails
    """
    try:
        practices_service = BestPracticesService(db)
        practices = await practices_service.get_practices(category=category)
        
        logger.info(
            "global_practices_retrieved",
            category=category,
            practice_count=len(practices)
        )
        
        return practices
        
    except DatabaseError as e:
        logger.error(
            "practices_retrieval_failed",
            error=str(e),
            error_type="database_error",
            category=category,
            exc_info=True
        )
        raise

@router.get("/repos/{repo_id}/practices", response_model=List[BestPractice])
async def get_repo_practices(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> List[BestPractice]:
    """Get all best practices for a specific repository.
    
    Args:
        repo_id: Repository ID
        db: Database session
        
    Returns:
        List of best practices
        
    Raises:
        NotFoundError: If repository not found
        DatabaseError: If database operation fails
    """
    try:
        practices_service = BestPracticesService(db)
        practices = await practices_service.get_practices(repo_id=repo_id)
        
        logger.info(
            "repo_practices_retrieved",
            repo_id=repo_id,
            practice_count=len(practices)
        )
        
        return practices
        
    except NotFoundError:
        logger.error(
            "practices_retrieval_failed",
            error="Repository not found",
            error_type="not_found",
            repo_id=repo_id,
            exc_info=True
        )
        raise
        
    except DatabaseError as e:
        logger.error(
            "practices_retrieval_failed",
            error=str(e),
            error_type="database_error",
            repo_id=repo_id,
            exc_info=True
        )
        raise

@router.post("/practices/{practice_id}/generalize", response_model=BestPractice)
async def mark_practice_as_generalizable(
    practice_id: str,
    db: AsyncSession = Depends(get_db)
) -> BestPractice:
    """Mark a best practice as generalizable.
    
    Args:
        practice_id: Practice ID to mark as generalizable
        db: Database session
        
    Returns:
        Updated best practice
        
    Raises:
        NotFoundError: If practice not found
        ValidationError: If practice is already generalizable
        DatabaseError: If database operation fails
    """
    try:
        practices_service = BestPracticesService(db)
        practice = await practices_service.mark_generalizable(practice_id)
        
        logger.info(
            "practice_marked_generalizable",
            practice_id=practice_id
        )
        
        return practice
        
    except NotFoundError:
        logger.error(
            "practice_generalization_failed",
            error="Practice not found",
            error_type="not_found",
            practice_id=practice_id,
            exc_info=True
        )
        raise
        
    except ValidationError:
        logger.error(
            "practice_generalization_failed",
            error="Practice is already generalizable",
            error_type="validation_error",
            practice_id=practice_id,
            exc_info=True
        )
        raise
        
    except DatabaseError as e:
        logger.error(
            "practice_generalization_failed",
            error=str(e),
            error_type="database_error",
            practice_id=practice_id,
            exc_info=True
        )
        raise

@router.post("/repos/{repo_id}/practices", response_model=BestPractice)
async def create_repo_practice(
    repo_id: str,
    practice: BestPracticeCreate,
    db: AsyncSession = Depends(get_db)
) -> BestPractice:
    """Create a new best practice for a specific repository.
    
    Args:
        repo_id: Repository ID
        practice: Practice data to create
        db: Database session
        
    Returns:
        Created best practice
        
    Raises:
        NotFoundError: If repository not found
        ValidationError: If practice data is invalid
        DatabaseError: If database operation fails
    """
    try:
        if not practice.title.strip():
            raise ValidationError(
                message="Practice title cannot be empty",
                details={"title": practice.title}
            )
            
        if not practice.description.strip():
            raise ValidationError(
                message="Practice description cannot be empty",
                details={"description": practice.description}
            )
            
        practices_service = BestPracticesService(db)
        created_practice = await practices_service.create_practice(
            repo_id=repo_id,
            practice=practice
        )
        
        logger.info(
            "repo_practice_created",
            practice_id=created_practice.id,
            repo_id=repo_id,
            title=practice.title
        )
        
        return created_practice
        
    except ValidationError:
        logger.error(
            "practice_creation_failed",
            error="Invalid practice data",
            error_type="validation_error",
            repo_id=repo_id,
            title=practice.title,
            exc_info=True
        )
        raise
        
    except NotFoundError:
        logger.error(
            "practice_creation_failed",
            error="Repository not found",
            error_type="not_found",
            repo_id=repo_id,
            exc_info=True
        )
        raise
        
    except DatabaseError as e:
        logger.error(
            "practice_creation_failed",
            error=str(e),
            error_type="database_error",
            repo_id=repo_id,
            exc_info=True
        )
        raise
