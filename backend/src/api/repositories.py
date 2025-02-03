from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import git
from typing import Optional
from ..core.logging import get_logger
from ..core.exceptions import RepoAnalyzerError
import structlog

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/repositories", tags=["repositories"])

class RepositoryRequest(BaseModel):
    """
    Request model for repository operations.
    
    Attributes:
        url: Git repository URL
        name: Name to identify the repository
        branch: Optional branch name, defaults to main
    """
    url: str
    name: str
    branch: Optional[str] = "main"

class RepositoryResponse(BaseModel):
    """
    Response model for repository operations.
    
    Attributes:
        id: Unique identifier for the repository
        name: Repository name
        url: Git repository URL
        local_path: Path where repository is stored locally
        status: Current status of the repository
    """
    id: str
    name: str
    url: str
    local_path: str
    status: str

@router.post("", response_model=RepositoryResponse)
async def create_repository(request: RepositoryRequest) -> RepositoryResponse:
    """
    Clone a repository and prepare it for analysis.
    
    Args:
        request: Repository request containing URL and name
        
    Returns:
        RepositoryResponse with repository details
        
    Raises:
        HTTPException: If repository cannot be cloned or accessed
    """
    log = logger.bind(
        repository_name=request.name,
        repository_url=request.url,
        branch=request.branch
    )
    
    try:
        log.info("Creating repository", operation="create_repository")
        
        # Create repos directory if it doesn't exist
        repos_dir = os.path.join(os.getcwd(), "repos")
        os.makedirs(repos_dir, exist_ok=True)
        
        # Create directory for this specific repo
        repo_path = os.path.join(repos_dir, request.name)
        
        # Clone the repository
        if not os.path.exists(repo_path):
            log.info("Cloning repository", operation="git_clone")
            git.Repo.clone_from(request.url, repo_path, branch=request.branch)
            status = "cloned"
        else:
            # Pull latest changes if repo exists
            log.info("Updating existing repository", operation="git_pull")
            repo = git.Repo(repo_path)
            origin = repo.remotes.origin
            origin.pull()
            status = "updated"
        
        response = RepositoryResponse(
            id=request.name,
            name=request.name,
            url=request.url,
            local_path=repo_path,
            status=status
        )
        log.info("Repository operation successful", 
                operation="create_repository",
                status=status)
        return response
        
    except git.exc.GitCommandError as e:
        log.error("Git operation failed", 
                error=str(e),
                operation="git_operation",
                exc_info=True)
        raise RepoAnalyzerError(
            status_code=400,
            detail=f"Git error: {str(e)}",
            error_code="GIT_ERROR"
        )
    except Exception as e:
        log.error("Unexpected error during repository operation",
                error=str(e),
                operation="create_repository",
                exc_info=True)
        raise RepoAnalyzerError(
            status_code=500,
            detail=f"Server error: {str(e)}",
            error_code="SERVER_ERROR"
        )

@router.get("/{repo_id}", response_model=RepositoryResponse)
async def get_repository(repo_id: str) -> RepositoryResponse:
    """
    Get repository information.
    
    Args:
        repo_id: Repository identifier
        
    Returns:
        RepositoryResponse with repository details
        
    Raises:
        HTTPException: If repository not found or cannot be accessed
    """
    log = logger.bind(repository_id=repo_id)
    repo_path = os.path.join(os.getcwd(), "repos", repo_id)
    
    if not os.path.exists(repo_path):
        log.error("Repository not found", 
                operation="get_repository",
                path=repo_path)
        raise RepoAnalyzerError(
            status_code=404,
            detail="Repository not found",
            error_code="REPO_NOT_FOUND"
        )
    
    try:
        log.info("Retrieving repository information", 
                operation="get_repository")
        repo = git.Repo(repo_path)
        response = RepositoryResponse(
            id=repo_id,
            name=repo_id,
            url=repo.remotes.origin.url,
            local_path=repo_path,
            status="exists"
        )
        log.info("Repository information retrieved successfully",
                operation="get_repository")
        return response
        
    except Exception as e:
        log.error("Error accessing repository",
                error=str(e),
                operation="get_repository",
                exc_info=True)
        raise RepoAnalyzerError(
            status_code=500,
            detail=f"Server error: {str(e)}",
            error_code="SERVER_ERROR"
        )
