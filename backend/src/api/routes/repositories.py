"""Repository routes for managing and analyzing GitHub repositories."""
from fastapi import APIRouter, Depends, BackgroundTasks, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from ...database import get_db
from ...schemas.repository import (
    RepositoryCreate,
    Repository,
    AnalysisResponse,
    AnalysisStatus,
    AnalysisMetrics
)
from ...services.analysis.repo_analyzer import RepoAnalyzer
from ...services.crud.repo_service import RepoCRUDService
from ...core.exceptions import (
    RepoAnalyzerError,
    DatabaseError,
    RepositoryError,
    NotFoundError,
    ValidationError
)
from ...core.metrics import (
    REPOSITORY_COUNT,
    ANALYSIS_DURATION,
    track_time
)
from ...core.logging import get_logger
from ...services.code_quality.code_quality_service import CodeQualityService
from ...dependencies import get_code_quality_service
from ...schemas.documentation import DocumentationMetrics
from ...services.documentation.documentation_analyzer import DocumentationAnalyzer
from ...dependencies import get_documentation_analyzer
from ...schemas.best_practices import BestPracticesReport
from ...services.best_practices.best_practices_analyzer import BestPracticesAnalyzer
from ...dependencies import get_best_practices_analyzer

router = APIRouter()
logger = get_logger(__name__)

@router.post("/repositories", response_model=Repository)
@track_time(ANALYSIS_DURATION.labels(status="create"))
async def create_repository(
    repo: RepositoryCreate,
    db: AsyncSession = Depends(get_db)
) -> Repository:
    """Create a new repository for analysis.
    
    Args:
        repo: Repository creation data
        db: Database session
        
    Returns:
        Created repository
        
    Raises:
        ValidationError: If repository URL is invalid
        RepositoryError: If repository already exists or is inaccessible
        DatabaseError: If database operation fails
    """
    try:
        logger.info(
            "creating_repository",
            repo_url=repo.url
        )
        repo_service = RepoCRUDService(db)
        
        # Validate repository URL
        if not repo.url.startswith(("http://", "https://")):
            raise ValidationError(
                message="Invalid repository URL",
                details={"url": repo.url}
            )
        
        created_repo = await repo_service.create_repository(repo)
        
        # Update metrics
        REPOSITORY_COUNT.labels(status="active").inc()
        
        logger.info(
            "repository_created",
            repo_id=created_repo.id,
            repo_url=created_repo.url
        )
        
        return created_repo
        
    except DatabaseError as e:
        logger.error(
            "repository_creation_failed_database",
            error=str(e),
            error_type="database_error",
            repo_url=repo.url,
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create repository: {str(e)}"
        )
        
    except RepositoryError as e:
        logger.error(
            "repository_creation_failed_validation",
            error=str(e),
            error_type="repository_error",
            repo_url=repo.url,
            exc_info=True
        )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid repository: {str(e)}"
        )

@router.get("/", response_model=List[Repository])
async def list_repositories(
    db: AsyncSession = Depends(get_db)
) -> List[Repository]:
    """List all repositories.
    
    Args:
        db: Database session
        
    Returns:
        List of repositories
        
    Raises:
        DatabaseError: If database query fails
    """
    try:
        logger.info("listing_repositories")
        repo_service = RepoCRUDService(db)
        repositories = await repo_service.list_repositories()
        logger.info(
            "repositories_listed",
            count=len(repositories)
        )
        return repositories
    except DatabaseError as e:
        logger.error(
            "list_repositories_failed",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list repositories: {str(e)}"
        )

@router.get("/{repo_id}", response_model=Repository)
async def get_repository(
    repo_id: str,
    db: AsyncSession = Depends(get_db)
) -> Repository:
    """Get repository by ID.
    
    Args:
        repo_id: Repository ID
        db: Database session
        
    Returns:
        Repository: Repository details
        
    Raises:
        HTTPException: If repository not found or database query fails
    """
    try:
        logger.info(
            "getting_repository",
            repo_id=repo_id
        )
        repo_service = RepoCRUDService(db)
        repository = await repo_service.get_repository(repo_id)
        if not repository:
            logger.warning(
                "repository_not_found",
                repo_id=repo_id
            )
            raise HTTPException(
                status_code=404,
                detail=f"Repository {repo_id} not found"
            )
        logger.info(
            "repository_retrieved",
            repo_id=repo_id,
            repo_url=repository.url
        )
        return repository
    except DatabaseError as e:
        logger.error(
            "repository_retrieval_failed",
            error=str(e),
            error_type=type(e).__name__,
            repo_id=repo_id,
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get repository: {str(e)}"
        )

@router.post("/repositories/{repo_id}/analyze", response_model=AnalysisResponse)
@track_time(ANALYSIS_DURATION.labels(status="analyze"))
async def analyze_repository(
    repo_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> AnalysisResponse:
    """Start repository analysis.
    
    Args:
        repo_id: Repository ID
        background_tasks: FastAPI background tasks
        db: Database session
        
    Returns:
        Analysis response with task ID
        
    Raises:
        NotFoundError: If repository not found
        RepositoryError: If repository is invalid or inaccessible
        AnalysisError: If analysis fails to start
    """
    try:
        repo_service = RepoCRUDService(db)
        repo = await repo_service.get_repository(repo_id)
        
        if not repo:
            raise NotFoundError(
                message=f"Repository {repo_id} not found",
                details={"repo_id": repo_id}
            )
        
        analyzer = RepoAnalyzer(db)
        task_id = await analyzer.start_analysis(repo, background_tasks)
        
        logger.info(
            "analysis_started",
            repo_id=repo_id,
            task_id=task_id
        )
        
        return AnalysisResponse(
            repo_id=repo_id,
            task_id=task_id,
            status="pending",
            started_at=datetime.utcnow()
        )
        
    except NotFoundError:
        logger.error(
            "analysis_failed",
            error="Repository not found",
            error_type="not_found",
            repo_id=repo_id,
            exc_info=True
        )
        raise HTTPException(
            status_code=404,
            detail=f"Repository {repo_id} not found"
        )
        
    except (RepositoryError, RepoAnalyzerError) as e:
        logger.error(
            "analysis_failed",
            error=str(e),
            error_type=type(e).__name__,
            repo_id=repo_id,
            exc_info=True
        )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid repository: {str(e)}"
        )

@router.get("/repositories/{repo_id}/analysis", response_model=AnalysisStatus)
async def get_analysis_status(
    repo_id: str,
    task_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
) -> AnalysisStatus:
    """Get repository analysis status.
    
    Args:
        repo_id: Repository ID
        task_id: Optional task ID to get specific analysis
        db: Database session
        
    Returns:
        Analysis status
        
    Raises:
        NotFoundError: If repository or analysis not found
    """
    try:
        repo_service = RepoCRUDService(db)
        repo = await repo_service.get_repository(repo_id)
        
        if not repo:
            raise NotFoundError(
                message=f"Repository {repo_id} not found",
                details={"repo_id": repo_id}
            )
        
        analyzer = RepoAnalyzer(db)
        status = await analyzer.get_analysis_status(repo, task_id)
        
        if not status and task_id:
            raise NotFoundError(
                message=f"Analysis task {task_id} not found",
                details={
                    "repo_id": repo_id,
                    "task_id": task_id
                }
            )
            
        logger.info(
            "analysis_status_checked",
            repo_id=repo_id,
            task_id=task_id,
            status=status.status if status else "no_analysis"
        )
        
        return status
        
    except NotFoundError:
        logger.error(
            "analysis_status_check_failed",
            error="Repository or analysis not found",
            error_type="not_found",
            repo_id=repo_id,
            task_id=task_id,
            exc_info=True
        )
        raise HTTPException(
            status_code=404,
            detail=f"Repository {repo_id} not found"
        )

@router.post("/repositories/{repo_id}/cancel", response_model=AnalysisStatus)
async def cancel_analysis(
    repo_id: str,
    task_id: str,
    db: AsyncSession = Depends(get_db)
) -> AnalysisStatus:
    """Cancel repository analysis.
    
    Args:
        repo_id: Repository ID
        task_id: Task ID to cancel
        db: Database session
        
    Returns:
        Updated analysis status
        
    Raises:
        NotFoundError: If repository or analysis not found
        AnalysisError: If analysis cannot be cancelled
    """
    try:
        repo_service = RepoCRUDService(db)
        repo = await repo_service.get_repository(repo_id)
        
        if not repo:
            raise NotFoundError(
                message=f"Repository {repo_id} not found",
                details={"repo_id": repo_id}
            )
        
        analyzer = RepoAnalyzer(db)
        status = await analyzer.cancel_analysis(repo, task_id)
        
        if not status:
            raise NotFoundError(
                message=f"Analysis task {task_id} not found",
                details={
                    "repo_id": repo_id,
                    "task_id": task_id
                }
            )
            
        logger.info(
            "analysis_cancelled",
            repo_id=repo_id,
            task_id=task_id,
            status=status.status
        )
        
        return status
        
    except NotFoundError:
        logger.error(
            "analysis_cancellation_failed",
            error="Repository or analysis not found",
            error_type="not_found",
            repo_id=repo_id,
            task_id=task_id,
            exc_info=True
        )
        raise HTTPException(
            status_code=404,
            detail=f"Repository {repo_id} not found"
        )
        
    except RepoAnalyzerError as e:
        logger.error(
            "analysis_cancellation_failed",
            error=str(e),
            error_type="analysis_error",
            repo_id=repo_id,
            task_id=task_id,
            exc_info=True
        )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis: {str(e)}"
        )

@router.get("/repositories/{repo_id}/quality", response_model=AnalysisMetrics)
async def analyze_code_quality(
    repo_id: int,
    db: AsyncSession = Depends(get_db),
    code_quality_service: CodeQualityService = Depends(get_code_quality_service)
) -> AnalysisMetrics:
    """Analyze code quality for a repository."""
    try:
        # Get repository
        repository = await RepoCRUDService(db).get_repository(repo_id)
        if not repository:
            raise HTTPException(
                status_code=404,
                detail=f"Repository {repo_id} not found"
            )

        # Get local path
        if not repository.local_path or not os.path.exists(repository.local_path):
            raise HTTPException(
                status_code=400,
                detail=f"Repository {repo_id} has not been cloned locally"
            )

        # Analyze code quality
        metrics = await code_quality_service.analyze_repository(repository.local_path)
        return metrics

    except AnalysisError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error analyzing code quality: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error analyzing code quality"
        )

@router.get("/repositories/{repo_id}/documentation", response_model=DocumentationMetrics)
async def analyze_documentation(
    repo_id: int,
    db: AsyncSession = Depends(get_db),
    doc_analyzer: DocumentationAnalyzer = Depends(get_documentation_analyzer)
) -> DocumentationMetrics:
    """Analyze documentation coverage for a repository."""
    try:
        # Get repository
        repository = await RepoCRUDService(db).get_repository(repo_id)
        if not repository:
            raise HTTPException(
                status_code=404,
                detail=f"Repository {repo_id} not found"
            )

        # Get local path
        if not repository.local_path or not os.path.exists(repository.local_path):
            raise HTTPException(
                status_code=400,
                detail=f"Repository {repo_id} has not been cloned locally"
            )

        # Analyze documentation
        metrics = await doc_analyzer.analyze_repository(repository.local_path)
        return metrics

    except AnalysisError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error analyzing documentation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error analyzing documentation"
        )

@router.get("/repositories/{repo_id}/best-practices", response_model=BestPracticesReport)
async def analyze_best_practices(
    repo_id: int,
    db: AsyncSession = Depends(get_db),
    practices_analyzer: BestPracticesAnalyzer = Depends(get_best_practices_analyzer)
) -> BestPracticesReport:
    """Analyze best practices implementation in a repository."""
    try:
        # Get repository
        repository = await RepoCRUDService(db).get_repository(repo_id)
        if not repository:
            raise HTTPException(
                status_code=404,
                detail=f"Repository {repo_id} not found"
            )

        # Get local path
        if not repository.local_path or not os.path.exists(repository.local_path):
            raise HTTPException(
                status_code=400,
                detail=f"Repository {repo_id} has not been cloned locally"
            )

        # Analyze best practices
        report = await practices_analyzer.analyze_repository(repository.local_path)
        return report

    except AnalysisError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error analyzing best practices: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error analyzing best practices"
        )
