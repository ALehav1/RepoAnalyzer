"""Service for handling bulk repository uploads via CSV."""
import csv
import io
import uuid
from typing import Dict, List, Tuple
from datetime import datetime
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import ValidationError
from ..services.crud.repo_service import RepoCRUDService
from ..schemas.repository import RepositoryCreate
from ..schemas.upload import CSVUploadStatus

logger = structlog.get_logger(__name__)

class CSVUploadService:
    """Service for processing CSV uploads of repositories."""
    
    def __init__(self, db: AsyncSession):
        """Initialize the service.
        
        Args:
            db: Database session
        """
        self.db = db
        self.repo_service = RepoCRUDService(db)
        self._upload_statuses: Dict[str, CSVUploadStatus] = {}
        
    def _validate_csv_headers(self, headers: List[str]) -> None:
        """Validate CSV headers.
        
        Args:
            headers: List of CSV headers
            
        Raises:
            ValidationError: If headers are invalid
        """
        required_headers = {"url", "name", "description"}
        headers_set = set(h.lower().strip() for h in headers)
        
        if not required_headers.issubset(headers_set):
            missing = required_headers - headers_set
            raise ValidationError(
                message="Invalid CSV headers",
                details={
                    "missing_headers": list(missing),
                    "required_headers": list(required_headers)
                }
            )
            
    def _validate_repository_url(self, url: str) -> bool:
        """Validate repository URL.
        
        Args:
            url: Repository URL to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        return (
            url
            and isinstance(url, str)
            and url.strip()
            and url.startswith(("http://", "https://"))
            and "github.com" in url.lower()
        )
        
    async def process_csv(self, file_content: bytes) -> Tuple[str, CSVUploadStatus]:
        """Process a CSV file containing repository information.
        
        Args:
            file_content: Raw CSV file content
            
        Returns:
            Tuple containing task ID and initial status
            
        Raises:
            ValidationError: If CSV format is invalid
        """
        # Generate task ID
        task_id = str(uuid.uuid4())
        
        try:
            # Read CSV content
            text_content = file_content.decode('utf-8')
            csv_file = io.StringIO(text_content)
            reader = csv.DictReader(csv_file)
            
            # Validate headers
            if not reader.fieldnames:
                raise ValidationError(
                    message="Empty CSV file",
                    details={"content_length": len(text_content)}
                )
                
            self._validate_csv_headers(reader.fieldnames)
            
            # Initialize repositories list
            repositories = list(reader)
            if not repositories:
                raise ValidationError(
                    message="No repositories found in CSV",
                    details={"content_length": len(text_content)}
                )
                
            # Create initial status
            status = CSVUploadStatus(
                task_id=task_id,
                status="pending",
                total_repositories=len(repositories),
                processed_repositories=0,
                started_at=datetime.utcnow()
            )
            self._upload_statuses[task_id] = status
            
            # Start processing in background
            self._process_repositories(task_id, repositories)
            
            return task_id, status
            
        except UnicodeDecodeError as e:
            raise ValidationError(
                message="Invalid CSV file encoding",
                details={"error": str(e)}
            )
        except csv.Error as e:
            raise ValidationError(
                message="Invalid CSV format",
                details={"error": str(e)}
            )
            
    async def _process_repositories(self, task_id: str, repositories: List[Dict[str, str]]) -> None:
        """Process repositories from CSV in background.
        
        Args:
            task_id: Upload task ID
            repositories: List of repository data from CSV
        """
        status = self._upload_statuses[task_id]
        status.status = "processing"
        
        try:
            for repo_data in repositories:
                try:
                    # Clean and validate URL
                    url = repo_data.get("url", "").strip()
                    if not self._validate_repository_url(url):
                        status.failed_repositories.append({
                            "url": url,
                            "reason": "Invalid repository URL"
                        })
                        continue
                        
                    # Create repository
                    repo = RepositoryCreate(
                        url=url,
                        name=repo_data.get("name", "").strip() or None,
                        description=repo_data.get("description", "").strip() or None
                    )
                    
                    await self.repo_service.create_repository(repo)
                    status.processed_repositories += 1
                    
                except Exception as e:
                    logger.error(
                        "repository_creation_failed",
                        task_id=task_id,
                        url=url,
                        error=str(e),
                        exc_info=True
                    )
                    status.failed_repositories.append({
                        "url": url,
                        "reason": str(e)
                    })
                    
            # Update final status
            status.status = "completed"
            status.completed_at = datetime.utcnow()
            
        except Exception as e:
            logger.error(
                "csv_processing_failed",
                task_id=task_id,
                error=str(e),
                exc_info=True
            )
            status.status = "failed"
            status.error = str(e)
            status.completed_at = datetime.utcnow()
            
    def get_upload_status(self, task_id: str) -> CSVUploadStatus:
        """Get the status of a CSV upload task.
        
        Args:
            task_id: Upload task ID
            
        Returns:
            Current status of the upload task
            
        Raises:
            ValidationError: If task ID is not found
        """
        status = self._upload_statuses.get(task_id)
        if not status:
            raise ValidationError(
                message="Upload task not found",
                details={"task_id": task_id}
            )
        return status
