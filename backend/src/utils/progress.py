"""Progress tracking utilities for repository analysis."""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class AnalysisProgress:
    """Track progress of repository analysis.
    
    This class provides functionality to track and report the progress
    of repository analysis operations.
    
    Attributes:
        _progress (Dict[str, Dict[str, Any]]): Internal progress storage
    """
    
    def __init__(self):
        """Initialize progress tracker."""
        self._progress: Dict[str, Dict[str, Any]] = {}
    
    def start_analysis(self, repo_name: str) -> None:
        """Start tracking analysis progress for a repository.
        
        Args:
            repo_name: Name of the repository
        """
        self._progress[repo_name] = {
            "status": "running",
            "progress": 0,
            "error": None,
            "started_at": datetime.utcnow().isoformat()
        }
        logger.info(f"Started analysis for {repo_name}")
    
    def update_progress(self, repo_name: str, progress: int) -> None:
        """Update analysis progress for a repository.
        
        Args:
            repo_name: Name of the repository
            progress: Progress percentage (0-100)
        """
        if repo_name in self._progress:
            self._progress[repo_name]["progress"] = progress
            logger.info(f"Analysis progress for {repo_name}: {progress}%")
    
    def complete_analysis(self, repo_name: str) -> None:
        """Mark analysis as complete for a repository.
        
        Args:
            repo_name: Name of the repository
        """
        if repo_name in self._progress:
            self._progress[repo_name].update({
                "status": "completed",
                "progress": 100,
                "completed_at": datetime.utcnow().isoformat()
            })
            logger.info(f"Completed analysis for {repo_name}")
    
    def fail_analysis(self, repo_name: str, error: str) -> None:
        """Mark analysis as failed for a repository.
        
        Args:
            repo_name: Name of the repository
            error: Error message
        """
        if repo_name in self._progress:
            self._progress[repo_name].update({
                "status": "failed",
                "error": error,
                "failed_at": datetime.utcnow().isoformat()
            })
            logger.error(f"Analysis failed for {repo_name}: {error}")
    
    def get_progress(self, repo_name: str) -> Optional[Dict[str, Any]]:
        """Get progress information for a repository.
        
        Args:
            repo_name: Name of the repository
            
        Returns:
            Optional[Dict[str, Any]]: Progress information if available
        """
        return self._progress.get(repo_name)
    
    def clear_progress(self, repo_name: str) -> None:
        """Clear progress information for a repository.
        
        Args:
            repo_name: Name of the repository
        """
        if repo_name in self._progress:
            del self._progress[repo_name]
            logger.info(f"Cleared progress for {repo_name}")
    
    def clear_all(self) -> None:
        """Clear all progress information."""
        self._progress.clear()
        logger.info("Cleared all progress information")
