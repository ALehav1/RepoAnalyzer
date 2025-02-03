"""Error handling middleware for the API."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
import structlog

from ...core.exceptions import ValidationError
from ...core.logging import get_logger

logger = get_logger(__name__)

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware for handling errors and exceptions."""
    
    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ):
        """Handle exceptions and convert them to appropriate responses.
        
        Args:
            request: The incoming request
            call_next: The next middleware or endpoint to call
            
        Returns:
            Response with appropriate status code and error details
        """
        try:
            return await call_next(request)
        except ValidationError as e:
            # Handle validation errors
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "message": str(e),
                    "details": e.details if hasattr(e, "details") else None
                }
            )
        except Exception as e:
            # Handle unexpected errors
            logger.error(
                "unexpected_error",
                error=str(e),
                exc_info=True
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "message": "Internal server error",
                    "details": str(e)
                }
            )
