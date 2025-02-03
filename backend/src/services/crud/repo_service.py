"""Repository CRUD service."""
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from ...core.exceptions import DatabaseError, RepositoryError
from ...core.logging import get_logger
from ...models.repository import Repository
from ...schemas.repository import Repository as RepositorySchema, RepositoryCreate

logger = get_logger(__name__)

class RepoCRUDService:
    """Service for repository CRUD operations."""
    
    def __init__(self, db: AsyncSession):
        """Initialize repository service.
        
        Args:
            db (AsyncSession): Database session for async operations
        """
        self.db = db

    async def create_repository(self, repo: RepositoryCreate) -> RepositorySchema:
        """Create a new repository.
        
        Args:
            repo (RepositoryCreate): Repository creation data
            
        Returns:
            RepositorySchema: Created repository
            
        Raises:
            DatabaseError: If repository creation fails
            RepositoryError: If repository URL is invalid
        """
        try:
            db_repo = Repository(
                url=repo.url,
                name=repo.name,
                description=repo.description,
                analysis_status="pending",
                analysis_progress=0.0
            )
            self.db.add(db_repo)
            await self.db.commit()
            await self.db.refresh(db_repo)
            
            logger.info(
                "repository_created",
                repo_id=db_repo.id,
                repo_url=db_repo.url
            )
            return RepositorySchema.model_validate(db_repo)
            
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(
                "repository_creation_failed",
                error=str(e),
                error_type=type(e).__name__,
                repo_url=repo.url,
                exc_info=True
            )
            raise DatabaseError(f"Failed to create repository: {str(e)}")

    async def get_repository(self, repo_id: str) -> Optional[RepositorySchema]:
        """Get repository by ID.
        
        Args:
            repo_id (str): Repository ID
            
        Returns:
            Optional[RepositorySchema]: Repository if found, None otherwise
            
        Raises:
            DatabaseError: If database query fails
        """
        try:
            stmt = select(Repository).where(Repository.id == repo_id)
            result = await self.db.execute(stmt)
            db_repo = result.scalar_one_or_none()
            
            if db_repo:
                logger.debug(
                    "repository_retrieved",
                    repo_id=repo_id,
                    repo_url=db_repo.url
                )
                return RepositorySchema.model_validate(db_repo)
            
            logger.warning(
                "repository_not_found",
                repo_id=repo_id
            )
            return None
            
        except SQLAlchemyError as e:
            logger.error(
                "repository_retrieval_failed",
                error=str(e),
                error_type=type(e).__name__,
                repo_id=repo_id,
                exc_info=True
            )
            raise DatabaseError(f"Failed to get repository: {str(e)}")

    async def list_repositories(self) -> List[RepositorySchema]:
        """List all repositories.
        
        Returns:
            List[RepositorySchema]: List of all repositories
            
        Raises:
            DatabaseError: If database query fails
        """
        try:
            stmt = select(Repository).order_by(Repository.created_at.desc())
            result = await self.db.execute(stmt)
            repositories = result.scalars().all()
            
            logger.info(
                "repositories_listed",
                count=len(repositories)
            )
            return [RepositorySchema.model_validate(repo) for repo in repositories]
            
        except SQLAlchemyError as e:
            logger.error(
                "repository_listing_failed",
                error=str(e),
                error_type=type(e).__name__,
                exc_info=True
            )
            raise DatabaseError(f"Failed to list repositories: {str(e)}")

    async def update_repository(
        self,
        repo_id: str,
        status: Optional[str] = None,
        progress: Optional[float] = None,
        error: Optional[str] = None,
        metrics: Optional[dict] = None
    ) -> RepositorySchema:
        """Update repository status and metrics.
        
        Args:
            repo_id (str): Repository ID
            status (Optional[str]): New analysis status
            progress (Optional[float]): Analysis progress (0-100)
            error (Optional[str]): Error message if analysis failed
            metrics (Optional[dict]): Analysis metrics
            
        Returns:
            RepositorySchema: Updated repository
            
        Raises:
            DatabaseError: If database update fails
            RepositoryError: If repository not found
        """
        try:
            stmt = select(Repository).where(Repository.id == repo_id)
            result = await self.db.execute(stmt)
            db_repo = result.scalar_one_or_none()
            
            if not db_repo:
                logger.error(
                    "repository_not_found",
                    repo_id=repo_id
                )
                raise RepositoryError(f"Repository {repo_id} not found")
            
            if status is not None:
                db_repo.analysis_status = status
            if progress is not None:
                db_repo.analysis_progress = progress
            if error is not None:
                db_repo.analysis_error = error
            if metrics is not None:
                db_repo.analysis_metrics = metrics
            
            await self.db.commit()
            await self.db.refresh(db_repo)
            
            logger.info(
                "repository_updated",
                repo_id=repo_id,
                status=status,
                progress=progress
            )
            return RepositorySchema.model_validate(db_repo)
            
        except SQLAlchemyError as e:
            await self.db.rollback()
            logger.error(
                "repository_update_failed",
                error=str(e),
                error_type=type(e).__name__,
                repo_id=repo_id,
                exc_info=True
            )
            raise DatabaseError(f"Failed to update repository: {str(e)}")

# Create a singleton instance
repo_crud = RepoCRUDService(None)
