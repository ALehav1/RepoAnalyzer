"""Routes for handling bulk repository uploads."""
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from ...database import get_db
from ...services.upload import CSVUploadService
from ...schemas.upload import CSVUploadResponse, CSVUploadStatus
from ...core.exceptions import ValidationError
from ...core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

def get_upload_service(db: AsyncSession = Depends(get_db)) -> CSVUploadService:
    """Get an instance of the CSVUploadService.
    
    Args:
        db: Database session
        
    Returns:
        CSVUploadService instance
    """
    return CSVUploadService(db)

@router.post("/upload/repositories", response_model=CSVUploadResponse)
async def upload_repositories_csv(
    file: UploadFile = File(...),
    upload_service: CSVUploadService = Depends(get_upload_service)
) -> CSVUploadResponse:
    """Upload a CSV file containing repository information for bulk processing.
    
    The CSV must have the following headers:
    - url (required): Repository URL
    - name (optional): Repository name
    - description (optional): Repository description
    
    Args:
        file: CSV file upload
        upload_service: Service for handling CSV uploads
        
    Returns:
        Upload response with task ID for status tracking
        
    Raises:
        ValidationError: If file format or content is invalid
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith('.csv'):
            raise ValidationError(
                message="Invalid file type",
                details={
                    "filename": file.filename,
                    "expected": "CSV file"
                }
            )
            
        # Read file content
        content = await file.read()
        if not content:
            raise ValidationError(
                message="Empty file",
                details={
                    "filename": file.filename
                }
            )
        
        # Process CSV file
        task_id, status = await upload_service.process_csv(content)
        
        # Log upload started
        logger.info(
            "csv_upload_started",
            task_id=task_id,
            filename=file.filename,
            total_repositories=status.total_repositories
        )
        
        return CSVUploadResponse(
            task_id=task_id,
            total_repositories=status.total_repositories,
            accepted_repositories=status.total_repositories - len(status.failed_repositories),
            rejected_repositories=len(status.failed_repositories),
            started_at=status.started_at
        )
        
    except ValidationError as e:
        # Log validation error
        logger.error(
            "csv_upload_failed",
            error="Validation error",
            filename=file.filename,
            exc_info=True
        )
        raise
    except Exception as e:
        # Log unexpected error
        logger.error(
            "csv_upload_failed",
            error=str(e),
            filename=file.filename,
            exc_info=True
        )
        raise ValidationError(
            message="Failed to process CSV file",
            details={"error": str(e)}
        )

@router.get("/upload/repositories/{task_id}", response_model=CSVUploadStatus)
async def get_upload_status(
    task_id: str,
    upload_service: CSVUploadService = Depends(get_upload_service)
) -> CSVUploadStatus:
    """Get the status of a CSV upload task.
    
    Args:
        task_id: Upload task ID
        upload_service: Service for handling CSV uploads
        
    Returns:
        Current status of the upload task
        
    Raises:
        ValidationError: If task ID is not found
    """
    try:
        status = upload_service.get_upload_status(task_id)
        return status
    except ValidationError:
        # Log task not found
        logger.error(
            "upload_status_check_failed",
            error="Task not found",
            task_id=task_id,
            exc_info=True
        )
        raise
    except Exception as e:
        # Log unexpected error
        logger.error(
            "upload_status_check_failed",
            error=str(e),
            task_id=task_id,
            exc_info=True
        )
        raise ValidationError(
            message="Failed to get upload status",
            details={"error": str(e)}
        )
