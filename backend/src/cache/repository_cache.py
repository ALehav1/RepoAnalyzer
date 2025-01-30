"""Repository caching functionality."""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.base import Repository
import logging
import json

logger = logging.getLogger(__name__)

class RepositoryCache:
    """Cache manager for repository data."""

    def __init__(self, db: Session, cache_duration: timedelta = timedelta(hours=24)):
        """Initialize repository cache.
        
        Args:
            db: Database session
            cache_duration: How long to cache repository data
        """
        self.db = db
        self.cache_duration = cache_duration

    def get_cached_data(self, repository_id: str) -> Optional[Dict[str, Any]]:
        """Get cached repository data if available and not expired.
        
        Args:
            repository_id: Repository ID
            
        Returns:
            Optional[Dict[str, Any]]: Cached data if available, None otherwise
        """
        try:
            repository = self.db.query(Repository).filter(Repository.id == repository_id).first()
            if not repository:
                logger.warning(f"Repository {repository_id} not found")
                return None

            if not repository.analysis_cache:
                logger.info(f"No cache exists for repository {repository_id}")
                return None

            # Check if cache is expired
            if repository.cached_until and repository.cached_until < datetime.utcnow():
                logger.info(f"Cache expired for repository {repository_id}")
                return None

            logger.info(f"Retrieved cache for repository {repository_id}")
            return repository.analysis_cache

        except Exception as e:
            logger.error(f"Error retrieving cache: {str(e)}")
            raise

    def set_cached_data(self, repository_id: str, data: Dict[str, Any]) -> None:
        """Cache repository data.
        
        Args:
            repository_id: Repository ID
            data: Data to cache
        """
        try:
            repository = self.db.query(Repository).filter(Repository.id == repository_id).first()
            if not repository:
                logger.warning(f"Repository {repository_id} not found")
                return

            repository.analysis_cache = data
            repository.cached_until = datetime.utcnow() + self.cache_duration
            
            self.db.commit()
            logger.info(f"Updated cache for repository {repository_id}")

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating cache: {str(e)}")
            raise

    def invalidate_cache(self, repository_id: str) -> None:
        """Invalidate cached data for a repository.
        
        Args:
            repository_id: Repository ID
        """
        try:
            repository = self.db.query(Repository).filter(Repository.id == repository_id).first()
            if not repository:
                logger.warning(f"Repository {repository_id} not found")
                return

            repository.analysis_cache = None
            repository.cached_until = None
            
            self.db.commit()
            logger.info(f"Invalidated cache for repository {repository_id}")

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error invalidating cache: {str(e)}")
            raise

def cache_repository_data(func):
    """Decorator to cache repository analysis results.
    
    Args:
        func: Function to wrap
        
    Returns:
        Wrapped function that uses cache
    """
    def wrapper(self, repository_id: str, *args, **kwargs):
        try:
            # Try to get cached data
            cached_data = self.cache.get_cached_data(repository_id)
            if cached_data:
                logger.info(f"Using cached data for repository {repository_id}")
                return cached_data

            # If no cache, run analysis
            logger.info(f"Running analysis for repository {repository_id}")
            result = func(self, repository_id, *args, **kwargs)

            # Cache the results
            self.cache.set_cached_data(repository_id, result)
            return result

        except Exception as e:
            logger.error(f"Error in cache wrapper: {str(e)}")
            raise

    return wrapper
