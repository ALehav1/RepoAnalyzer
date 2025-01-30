"""Git utilities for repository analyzer."""

import contextlib
import logging
import shutil
from pathlib import Path
from typing import Generator, Optional, Tuple
import re

logger = logging.getLogger(__name__)

@contextlib.contextmanager
def git_cleanup(repo_dir: Path) -> Generator[None, None, None]:
    """Context manager to ensure proper cleanup of Git repositories.
    
    This context manager ensures that if any operation fails within its scope,
    the repository directory is properly cleaned up to prevent partial or
    corrupted repositories from remaining on disk.
    
    Args:
        repo_dir: Path to the repository directory
        
    Yields:
        None
        
    Example:
        with git_cleanup(repo_dir):
            git.Repo.clone_from(url, repo_dir)
    """
    try:
        yield
    except Exception as e:
        logger.warning(f"Error in Git operation, cleaning up {repo_dir}: {str(e)}")
        if repo_dir.exists():
            shutil.rmtree(repo_dir)
        raise

def extract_repo_info(url: str) -> Tuple[str, str]:
    """Extract owner and repository name from a GitHub URL.
    
    Args:
        url: GitHub repository URL
        
    Returns:
        Tuple of (owner, repo_name)
        
    Raises:
        ValueError: If the URL format is invalid
        
    Example:
        owner, repo = extract_repo_info("https://github.com/owner/repo")
    """
    # Validate GitHub URL format
    if not url.startswith(("http://github.com/", "https://github.com/")):
        raise ValueError("Invalid GitHub URL format")
    
    # Match GitHub URL pattern
    pattern = r"https?://github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$"
    match = re.match(pattern, url)
    
    if not match:
        raise ValueError("Invalid GitHub URL format")
        
    owner, repo = match.groups()
    if not owner or not repo:
        raise ValueError("Invalid GitHub URL format")
    
    return owner, repo
