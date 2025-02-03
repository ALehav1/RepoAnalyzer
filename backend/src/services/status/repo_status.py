"""Repository status management."""
from typing import Optional, Literal
import logging
from datetime import datetime

from ...infrastructure.session import session_manager
from ...models.base import Repository
from ...schemas.repository import JobStatus

logger = logging.getLogger(__name__)

StatusType = Literal["pending", "processing", "completed", "failed"]

class RepoStatusService:
    """Handles repository status updates."""

    async def update_status(
        self,
        repo_id: str,
        status: StatusType,
        progress: float,
        error: Optional[str] = None
    ) -> bool:
        """Update repository status."""
        async with session_manager.async_transaction() as session:
            try:
                repo = await session.query(Repository).filter(Repository.id == repo_id).first()
                if repo:
                    repo.analysis_status = status
                    repo.analysis_progress = progress
                    if error:
                        repo.last_error = error
                    repo.updated_at = datetime.utcnow()
                    
                    logger.info(
                        f"Updated repository {repo_id} status",
                        extra={
                            "repo_id": repo_id,
                            "status": status,
                            "progress": progress,
                            "error": error
                        }
                    )
                    return True
                return False
            except Exception as e:
                logger.error(f"Error updating repository {repo_id} status: {str(e)}")
                raise

    async def get_status(self, repo_id: str) -> Optional[JobStatus]:
        """Get repository status."""
        async with session_manager.async_session() as session:
            try:
                repo = await session.query(Repository).filter(Repository.id == repo_id).first()
                if repo:
                    return JobStatus(
                        id=repo.id,
                        status=repo.analysis_status,
                        progress=repo.analysis_progress,
                        error=repo.last_error,
                        created_at=repo.created_at,
                        updated_at=repo.updated_at
                    )
                return None
            except Exception as e:
                logger.error(f"Error getting repository {repo_id} status: {str(e)}")
                raise

    async def reset_status(self, repo_id: str) -> bool:
        """Reset repository status."""
        return await self.update_status(repo_id, "pending", 0.0)

repo_status = RepoStatusService()
