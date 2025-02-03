"""Task queue management."""
from redis import Redis
from rq import Queue
import logging
from typing import Any, Dict, Optional
from datetime import datetime

from ..config.settings import settings
from ..models.base import Repository
from .session import session_manager

logger = logging.getLogger(__name__)

class TaskQueue:
    """Manages background tasks using Redis Queue."""
    
    _instance = None
    
    def __new__(cls):
        """Create singleton instance."""
        if cls._instance is None:
            cls._instance = super(TaskQueue, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """Initialize task queue."""
        if getattr(self, '_initialized', False):
            return
            
        logger.info("Initializing TaskQueue...")
        self.redis = Redis.from_url(settings.redis_url)
        self.queue = Queue(connection=self.redis)
        self._initialized = True
        logger.info("TaskQueue initialized")

    def enqueue_analysis(self, repo_id: str, timeout: int = 3600) -> str:
        """Enqueue a repository analysis task."""
        try:
            logger.info(f"Enqueueing analysis for repo {repo_id}")
            job = self.queue.enqueue(
                'src.processors.repo_processor.process_repository',
                args=(repo_id,),
                job_timeout=timeout
            )
            logger.info(f"Enqueued analysis job {job.id} for repo {repo_id}")
            
            # Update repository status
            with session_manager.sync_transaction() as session:
                repo = session.query(Repository).filter(Repository.id == repo_id).first()
                if repo:
                    repo.analysis_status = "pending"
                    repo.analysis_progress = 0.0
                    repo.job_id = job.id
                    logger.info(f"Updated repository {repo_id} status to pending")
                
            return job.id
        except Exception as e:
            logger.error(f"Error enqueueing analysis for repo {repo_id}: {str(e)}")
            raise

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get status of a job."""
        try:
            job = self.queue.fetch_job(job_id)
            if not job:
                return {"status": "not_found"}
                
            status = {
                "id": job.id,
                "status": job.get_status(),
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "started_at": job.started_at.isoformat() if job.started_at else None,
                "ended_at": job.ended_at.isoformat() if job.ended_at else None,
                "result": job.result,
                "error": str(job.exc_info) if job.exc_info else None
            }
            
            logger.debug(f"Job {job_id} status: {status}")
            return status
        except Exception as e:
            logger.error(f"Error getting job {job_id} status: {str(e)}")
            return {"status": "error", "error": str(e)}

    def cancel_job(self, job_id: str) -> bool:
        """Cancel a job."""
        try:
            job = self.queue.fetch_job(job_id)
            if job and not job.is_finished:
                job.cancel()
                logger.info(f"Cancelled job {job_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error cancelling job {job_id}: {str(e)}")
            return False

task_queue = TaskQueue()
