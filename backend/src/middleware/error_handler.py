"""Error handling middleware for the FastAPI application."""
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class AppError(Exception):
    """Base application error class."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

async def handle_errors(request: Request, call_next: Callable) -> Response:
    """Middleware to catch and handle all application errors."""
    try:
        return await call_next(request)
    except AppError as e:
        logger.error(f"Application error: {str(e)}", exc_info=True)
        return Response(
            content={"detail": str(e)},
            status_code=e.status_code,
            media_type="application/json"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return Response(
            content={"detail": "Internal server error"},
            status_code=500,
            media_type="application/json"
        )
