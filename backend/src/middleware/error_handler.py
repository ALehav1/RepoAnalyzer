"""Error handling middleware for the application."""

from typing import Dict, Any
from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class AppError(Exception):
    """Base application error."""
    def __init__(self, message: str, status_code: int = 500, details: Dict[str, Any] = None):
        """Initialize app error.
        
        Args:
            message: Error message
            status_code: HTTP status code
            details: Additional error details
        """
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

async def handle_errors(request: Request, call_next):
    """Error handling middleware.
    
    Args:
        request: FastAPI request
        call_next: Next middleware in chain
        
    Returns:
        Response: FastAPI response
    """
    try:
        return await call_next(request)
    except AppError as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=e.status_code,
            content={
                "error": e.message,
                "details": e.details,
                "status_code": e.status_code
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal server error",
                "details": {"message": str(e)},
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
            }
        )
