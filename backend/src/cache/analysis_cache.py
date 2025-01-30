"""Cache module for repository analysis results."""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class AnalysisCache:
    """Cache for repository analysis results.
    
    This class provides a simple in-memory cache for repository analysis results
    to avoid unnecessary recomputation of analysis data.
    
    Attributes:
        _cache (Dict[str, Dict[str, Any]]): Internal cache storage
        _cache_ttl (timedelta): Time-to-live for cache entries
    """
    
    def __init__(self, ttl_hours: int = 24):
        """Initialize analysis cache.
        
        Args:
            ttl_hours: Number of hours to keep cache entries valid
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = timedelta(hours=ttl_hours)
    
    def get(self, repo_name: str) -> Optional[Dict[str, Any]]:
        """Get cached analysis results for a repository.
        
        Args:
            repo_name: Name of the repository
            
        Returns:
            Optional[Dict[str, Any]]: Cached data if available and valid, None otherwise
        """
        if repo_name not in self._cache:
            return None
            
        cache_entry = self._cache[repo_name]
        analyzed_at = datetime.fromisoformat(cache_entry["analyzed_at"])
        
        if datetime.utcnow() - analyzed_at > self._cache_ttl:
            logger.info(f"Cache entry for {repo_name} has expired")
            del self._cache[repo_name]
            return None
            
        logger.info(f"Cache hit for {repo_name}")
        return cache_entry
    
    def set(self, repo_name: str, data: Dict[str, Any]) -> None:
        """Set cache entry for a repository.
        
        Args:
            repo_name: Name of the repository
            data: Analysis data to cache
        """
        if "analyzed_at" not in data:
            data["analyzed_at"] = datetime.utcnow().isoformat()
            
        self._cache[repo_name] = data
        logger.info(f"Cached analysis results for {repo_name}")
    
    def invalidate(self, repo_name: str) -> None:
        """Invalidate cache entry for a repository.
        
        Args:
            repo_name: Name of the repository
        """
        if repo_name in self._cache:
            del self._cache[repo_name]
            logger.info(f"Invalidated cache for {repo_name}")
    
    def clear(self) -> None:
        """Clear all cache entries."""
        self._cache.clear()
        logger.info("Cleared analysis cache")
