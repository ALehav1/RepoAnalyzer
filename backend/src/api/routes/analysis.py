"""API routes for repository analysis."""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from ...services.analyzers.documentation import DocumentationAnalyzer
from ...services.analyzers.best_practices import BestPracticesAnalyzer
from ...schemas.analyzers.documentation import RepoDocumentation
from ...schemas.analyzers.patterns import CodePattern
from ...schemas.best_practices import BestPracticesReport
from ...schemas.analyzers.progress import AnalysisProgress, AnalysisStatus
from ...core.exceptions import AnalysisError
from ...core.logging import get_logger
from ...database import get_db

logger = get_logger(__name__)
router = APIRouter()

class AnalysisRequest(BaseModel):
    """Request body for repository analysis."""
    repo_path: str
    analysis_types: List[str]

class AnalysisResponse(BaseModel):
    """Response body for repository analysis."""
    task_id: str
    status: str
    progress: float
    results: Optional[Dict] = None
    error: Optional[str] = None

@router.post("/analyze")
async def analyze_repository(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Start repository analysis in the background."""
    # Validate repository path exists
    repo_path = Path(request.repo_path)
    if not repo_path.exists():
        return JSONResponse(
            status_code=400,
            content={"error": f"Repository path {request.repo_path} does not exist"}
        )

    # Create progress tracker
    progress = AnalysisProgress()
    status = AnalysisStatus(progress)

    # Start background analysis
    background_tasks.add_task(
        _run_analysis,
        repo_path=request.repo_path,
        analysis_types=request.analysis_types,
        db=db,
        progress=progress,
        status=status
    )

    return JSONResponse(
        status_code=202,
        content={
            "status": "accepted",
            "message": "Analysis started"
        }
    )

@router.get("/status/{task_id}", response_model=AnalysisResponse)
async def get_analysis_status(task_id: str) -> AnalysisResponse:
    """Get analysis task status.
    
    Args:
        task_id: Analysis task ID
        
    Returns:
        AnalysisResponse with current status and results if complete
        
    Raises:
        HTTPException: If task not found
    """
    progress = AnalysisProgress.get_progress(task_id)
    if not progress:
        return JSONResponse(
            status_code=404,
            content={"error": "Analysis task not found"}
        )
        
    return AnalysisResponse(
        task_id=task_id,
        status=progress.status.status,
        progress=progress.status.progress,
        results=progress.metadata,
        error=progress.status.error
    )

async def _run_analysis(repo_path: str, analysis_types: List[str], db: AsyncSession, progress: AnalysisProgress, status: AnalysisStatus) -> None:
    """Run repository analysis in background.
    
    Args:
        repo_path: Path to repository
        analysis_types: Types of analysis to run
        db: Database session
        progress: Analysis progress
        status: Analysis status
    """
    try:
        results = {}
        
        if "documentation" in analysis_types:
            doc_analyzer = DocumentationAnalyzer()
            results["documentation"] = await doc_analyzer.analyze(repo_path)
            status.progress = 50.0
            status.status = "in_progress"
            progress.save_progress()
            
        if "best_practices" in analysis_types:
            bp_analyzer = BestPracticesAnalyzer()
            results["best_practices"] = await bp_analyzer.analyze(repo_path)
            status.progress = 100.0
            status.status = "complete"
            progress.save_progress()
            
        progress.metadata.update(results)
        progress.save_progress()
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        status.error = str(e)
        status.status = "failed"
        progress.save_progress()
