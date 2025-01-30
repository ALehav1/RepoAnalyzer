import os
from pathlib import Path
import json
import asyncio
from datetime import datetime, timedelta
import httpx
from typing import Dict, List, Any, Optional
import logging
import ssl
import certifi
from concurrent.futures import ThreadPoolExecutor
import functools
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import git
from git.exc import GitCommandError, InvalidGitRepositoryError, NoSuchPathError

from .exceptions import (
    RepositoryAnalyzerError,
    InvalidRepositoryURLError,
    RepositoryNotFoundError,
    GitOperationError,
    AnalysisError
)
from .git_utils import git_cleanup, extract_repo_info
from .github import GithubService
from ..models.base import Repository
from ..cache.repository_cache import RepositoryCache, cache_repository_data
from ..cache.analysis_cache import AnalysisCache
from ..utils.progress import AnalysisProgress

logger = logging.getLogger(__name__)

class AnalysisProgress:
    """Tracks the progress of repository analysis."""
    def __init__(self):
        self._progress: Dict[str, Dict[str, Any]] = {}

    def start_analysis(self, repo_id: str) -> None:
        self._progress[repo_id] = {
            'status': 'in_progress',
            'progress': 0,
            'started_at': datetime.utcnow().isoformat(),
            'completed_at': None,
            'error': None
        }

    def update_progress(self, repo_id: str, progress: float) -> None:
        if repo_id in self._progress:
            self._progress[repo_id]['progress'] = min(progress, 100)

    def complete_analysis(self, repo_id: str) -> None:
        if repo_id in self._progress:
            self._progress[repo_id].update({
                'status': 'completed',
                'progress': 100,
                'completed_at': datetime.utcnow().isoformat()
            })

    def fail_analysis(self, repo_id: str, error: str) -> None:
        if repo_id in self._progress:
            self._progress[repo_id].update({
                'status': 'failed',
                'error': error,
                'completed_at': datetime.utcnow().isoformat()
            })

    def get_progress(self, repo_id: str) -> Optional[Dict[str, Any]]:
        return self._progress.get(repo_id)

class AnalysisCache:
    """Caches analysis results with TTL."""
    def __init__(self, ttl_minutes: int = 30):
        self.cache = {}
        self.ttl = timedelta(minutes=ttl_minutes)

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        if key in self.cache:
            data, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.ttl:
                return data
            del self.cache[key]
        return None

    def set(self, key: str, data: Dict[str, Any]):
        self.cache[key] = (data, datetime.now())

class RepositoryAnalyzer:
    """Main service for analyzing repositories."""
    def __init__(self, db: AsyncSession, github_service: Optional[GithubService] = None, cache: Optional[RepositoryCache] = None):
        """Initialize repository analyzer.
        
        Args:
            db: Database session
            github_service: Optional GitHub service instance
            cache: Optional repository cache instance
        """
        self.db = db
        self.github = github_service or GithubService()
        self.data_dir = Path("data/repos")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.analysis_cache = AnalysisCache()
        self.progress_tracker = AnalysisProgress()
        self.repo_cache = cache
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # SSL context for secure GitHub API requests
        self.ssl_context = ssl.create_default_context(cafile=certifi.where())

    async def get_repository(self, repo_id: str) -> Optional[Repository]:
        """Get repository from database."""
        query = select(Repository).where(Repository.id == repo_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def clone_or_pull_repo(self, repo_url: str) -> str:
        """Clone a new repository or pull latest changes if it exists.
        
        Args:
            repo_url: The URL of the repository to clone or pull
            
        Returns:
            str: Path to the local repository
            
        Raises:
            InvalidRepositoryURLError: If the repository URL is invalid
            RepositoryNotFoundError: If the repository cannot be found
            GitOperationError: If Git operations fail
        """
        # Validate URL format
        if not repo_url.startswith(("http://github.com/", "https://github.com/")):
            raise InvalidRepositoryURLError("Invalid GitHub repository URL. Must start with http(s)://github.com/")

        try:
            # Extract owner and repo name
            try:
                owner, repo_name = extract_repo_info(repo_url)
            except ValueError:
                raise InvalidRepositoryURLError("Invalid GitHub repository URL. Must be in format: http(s)://github.com/owner/repo")

            repo_dir = self.data_dir / repo_name

            def _git_operation():
                with git_cleanup(repo_dir):
                    try:
                        if (repo_dir / '.git').exists():
                            try:
                                # Repository exists, pull latest changes
                                repo = git.Repo(repo_dir)
                                origin = repo.remotes.origin
                                origin.pull()
                                logger.info(f"Pulled latest changes for {repo_url}")
                            except (InvalidGitRepositoryError, NoSuchPathError) as e:
                                # Invalid or corrupt repository, remove and clone again
                                logger.warning(f"Invalid repository at {repo_dir}, removing and cloning again: {str(e)}")
                                if repo_dir.exists():
                                    import shutil
                                    shutil.rmtree(repo_dir)
                                repo_dir.mkdir(exist_ok=True)
                                git.Repo.clone_from(repo_url, repo_dir)
                                logger.info(f"Re-cloned repository {repo_url}")
                        else:
                            # Clone new repository
                            repo_dir.mkdir(exist_ok=True)
                            git.Repo.clone_from(repo_url, repo_dir)
                            logger.info(f"Cloned repository {repo_url}")
                        return str(repo_dir)
                    except GitCommandError as e:
                        if "Repository not found" in str(e):
                            raise RepositoryNotFoundError(f"Repository not found: {repo_url}")
                        raise GitOperationError(f"Git operation failed: {str(e)}")
                    except Exception as e:
                        raise GitOperationError(f"Unexpected error in Git operation: {str(e)}")

            # Run git operations in thread pool to avoid blocking
            return await asyncio.get_event_loop().run_in_executor(
                self.executor, _git_operation
            )

        except (InvalidRepositoryURLError, RepositoryNotFoundError, GitOperationError):
            raise
        except Exception as e:
            logger.error(f"Error in clone_or_pull_repo: {str(e)}")
            raise GitOperationError(f"Git operation failed: {str(e)}")

    async def analyze_repository(self, repo_url: str, background_tasks: Optional[Any] = None) -> Dict[str, Any]:
        """Analyze a repository and return its data.
        
        Args:
            repo_url: URL of the repository to analyze
            background_tasks: Optional background tasks for async operations
            
        Returns:
            Dict containing repository analysis results
            
        Raises:
            InvalidRepositoryURLError: If the repository URL is invalid
            RepositoryNotFoundError: If the repository cannot be found
            GitOperationError: If Git operations fail
            AnalysisError: If analysis fails
        """
        # Extract repo name from URL for cache key
        try:
            repo_name = repo_url.split("/")[-1].replace(".git", "")
            if not repo_name:
                raise InvalidRepositoryURLError("Invalid GitHub repository URL. Must include repository name")

            # Start analysis
            self.progress_tracker.start_analysis(repo_name)

            try:
                # Check cache first
                cached_data = self.analysis_cache.get(repo_name)
                if cached_data:
                    logger.info(f"Using cached data for {repo_url}")
                    self.progress_tracker.complete_analysis(repo_name)
                    return cached_data
                
                # Get repository info from GitHub
                self.progress_tracker.update_progress(repo_name, 5)
                try:
                    repo_info = await self.github.get_repo_info(repo_url)
                except Exception as e:
                    raise AnalysisError(f"Failed to get repository info: {str(e)}")
                
                try:
                    # Clone or update repository
                    self.progress_tracker.update_progress(repo_name, 10)
                    local_path = await self.clone_or_pull_repo(repo_url)
                    
                    # Store results
                    result = {
                        "repository": repo_info,
                        "files": repo_info.get("files", []),  # Use files from GitHub API
                        "analyzed_at": datetime.utcnow().isoformat()
                    }
                    
                    # Cache results
                    self.analysis_cache.set(repo_name, result)
                    self.progress_tracker.complete_analysis(repo_name)
                    
                    return result
                except (InvalidRepositoryURLError, RepositoryNotFoundError, GitOperationError) as e:
                    # Handle Git errors separately to avoid caching failed results
                    error_msg = str(e)
                    logger.error(f"Git error analyzing repository {repo_url}: {error_msg}")
                    self.progress_tracker.fail_analysis(repo_name, error_msg)
                    raise
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Error analyzing repository {repo_url}: {error_msg}")
                self.progress_tracker.fail_analysis(repo_name, error_msg)
                raise AnalysisError(f"Analysis failed: {error_msg}")
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error analyzing repository {repo_url}: {error_msg}")
            if isinstance(e, (InvalidRepositoryURLError, RepositoryNotFoundError, GitOperationError, AnalysisError)):
                raise
            raise AnalysisError(f"Analysis failed: {error_msg}")

    def _determine_file_type(self, file_path: str) -> str:
        """Determine the type of file based on extension."""
        ext = Path(file_path).suffix.lower()
        return {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'react',
            '.tsx': 'react-typescript',
            '.md': 'markdown',
            '.yml': 'yaml',
            '.yaml': 'yaml',
            '.json': 'json',
        }.get(ext, 'unknown')

    def _is_generated_file(self, file_path: str) -> bool:
        """Check if a file is likely generated."""
        generated_patterns = [
            'generated', 'auto-generated', 'build/', 'dist/',
            '.min.', '.bundle.', '.generated.'
        ]
        return any(pattern in str(file_path).lower() for pattern in generated_patterns)

    def _is_test_file(self, file_path: str) -> bool:
        """Check if a file is a test file."""
        test_patterns = ['test_', '_test', '.test.', '.spec.', '/tests/']
        return any(pattern in str(file_path).lower() for pattern in test_patterns)

    def get_analysis_progress(self, repo_id: str) -> Optional[Dict[str, Any]]:
        """Get the current progress of repository analysis."""
        return self.progress_tracker.get_progress(repo_id)
