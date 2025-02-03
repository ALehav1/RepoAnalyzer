"""Health check endpoints."""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging
from redis.exceptions import RedisError

from ..infrastructure.session import session_manager
from ..infrastructure.task_queue import task_queue
from ..config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()

async def check_database() -> Dict[str, Any]:
    """Check database connection."""
    try:
        async with session_manager.async_session() as session:
            await session.execute("SELECT 1")
        return {"status": "healthy"}
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}

def check_redis() -> Dict[str, Any]:
    """Check Redis connection."""
    try:
        task_queue.redis.ping()
        return {"status": "healthy"}
    except RedisError as e:
        logger.error(f"Redis health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}

def check_storage() -> Dict[str, Any]:
    """Check storage paths."""
    try:
        repo_path = settings.repo_storage_path
        log_path = settings.log_dir
        
        if not repo_path.exists():
            return {"status": "unhealthy", "error": "Repository storage path not found"}
        if not log_path.exists():
            return {"status": "unhealthy", "error": "Log directory not found"}
            
        return {"status": "healthy"}
    except Exception as e:
        logger.error(f"Storage health check failed: {str(e)}")
        return {"status": "unhealthy", "error": str(e)}

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Perform health check."""
    try:
        db_status = await check_database()
        redis_status = check_redis()
        storage_status = check_storage()
        
        overall_status = (
            db_status["status"] == "healthy" and
            redis_status["status"] == "healthy" and
            storage_status["status"] == "healthy"
        )
        
        return {
            "status": "healthy" if overall_status else "unhealthy",
            "version": settings.app_version,
            "checks": {
                "database": db_status,
                "redis": redis_status,
                "storage": storage_status
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
