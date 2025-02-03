"""Repository analysis service."""
from typing import Dict, Any, Optional
from pathlib import Path
import tempfile
import shutil
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential
from git import Repo, GitCommandError
import asyncio
from datetime import datetime

from ...core.exceptions import RepositoryError, AnalysisError
from ...services.crud.repo_service import RepoCRUDService
from ...schemas.metrics import AnalysisMetrics, MetricDetails
from ...config.settings import settings

logger = structlog.get_logger(__name__)

class RepoAnalyzer:
    """Handles repository analysis workflows."""
    
    def __init__(self, db):
        """Initialize analyzer.
        
        Args:
            db: Database session
        """
        self.db = db
        self.repo_service = RepoCRUDService(db)
        self.temp_dir = None

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def clone_repository(self, url: str, branch: Optional[str] = None) -> str:
        """Clone repository with retry logic.
        
        Args:
            url: Repository URL
            branch: Optional branch name
            
        Returns:
            str: Path to cloned repository
            
        Raises:
            RepositoryError: If cloning fails
        """
        try:
            # Create temp directory
            self.temp_dir = tempfile.mkdtemp()
            
            # Clone options
            options = ['--depth', '1']
            if branch:
                options.extend(['--branch', branch])
            
            # Clone repository
            Repo.clone_from(url, self.temp_dir, multi_options=options)
            return self.temp_dir
            
        except GitCommandError as e:
            logger.error("Failed to clone repository", error=str(e))
            raise RepositoryError(f"Failed to clone repository: {str(e)}")

    def cleanup(self):
        """Clean up temporary files."""
        if self.temp_dir and Path(self.temp_dir).exists():
            shutil.rmtree(self.temp_dir)
            self.temp_dir = None

    async def analyze_code_quality(self, repo_path: str) -> MetricDetails:
        """Analyze code quality metrics.
        
        Args:
            repo_path: Path to repository
            
        Returns:
            MetricDetails: Code quality analysis results
        """
        # TODO: Implement detailed code quality analysis
        return MetricDetails(
            score=85,
            details=["Good code organization", "Low complexity"],
            recommendations=["Add more inline comments", "Consider breaking down large functions"]
        )

    async def analyze_documentation(self, repo_path: str) -> MetricDetails:
        """Analyze documentation metrics.
        
        Args:
            repo_path: Path to repository
            
        Returns:
            MetricDetails: Documentation analysis results
        """
        # TODO: Implement detailed documentation analysis
        return MetricDetails(
            score=75,
            details=["README present", "Some docstrings found"],
            recommendations=["Add more function documentation", "Include API documentation"]
        )

    async def analyze_best_practices(self, repo_path: str) -> MetricDetails:
        """Analyze best practices metrics.
        
        Args:
            repo_path: Path to repository
            
        Returns:
            MetricDetails: Best practices analysis results
        """
        # TODO: Implement detailed best practices analysis
        return MetricDetails(
            score=90,
            details=["Follows style guide", "Good project structure"],
            recommendations=["Consider adding type hints"]
        )

    async def analyze_repository(self, repo) -> None:
        """Analyze repository and update metrics.
        
        Args:
            repo: Repository object
        """
        try:
            # Clone repository
            repo_path = await self.clone_repository(repo.url, repo.branch)

            try:
                # Perform analysis
                metrics = AnalysisMetrics(
                    code_quality=await self.analyze_code_quality(repo_path),
                    documentation=await self.analyze_documentation(repo_path),
                    best_practices=await self.analyze_best_practices(repo_path)
                )

                # Update repository with results
                await self.repo_service.update_repository_status(
                    repo.id,
                    status="completed",
                    metrics=metrics.dict()
                )

            except Exception as e:
                logger.error("Analysis failed", error=str(e))
                await self.repo_service.update_repository_status(
                    repo.id,
                    status="failed",
                    error=f"Analysis failed: {str(e)}"
                )
                raise AnalysisError(f"Analysis failed: {str(e)}")

        except Exception as e:
            logger.error("Repository processing failed", error=str(e))
            await self.repo_service.update_repository_status(
                repo.id,
                status="failed",
                error=str(e)
            )
            raise

        finally:
            self.cleanup()


# Create a factory function to get analyzer instance
def get_analyzer(db):
    """Get repository analyzer instance."""
    return RepoAnalyzer(db)
