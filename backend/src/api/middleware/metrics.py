"""Prometheus metrics middleware."""
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

from ...core.metrics import HTTP_REQUEST_COUNT, HTTP_REQUEST_DURATION
from ...core.logging import get_logger

logger = get_logger(__name__)

class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware for collecting Prometheus metrics."""

    def __init__(self, app: ASGIApp) -> None:
        """Initialize middleware."""
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Process request and collect metrics."""
        method = request.method
        path = request.url.path
        
        # Start timer
        start_time = time.time()
        
        try:
            # Process request
            response = await call_next(request)
            
            # Record metrics
            status = response.status_code
            duration = time.time() - start_time
            
            HTTP_REQUEST_COUNT.labels(
                method=method,
                endpoint=path,
                status=status
            ).inc()
            
            HTTP_REQUEST_DURATION.labels(
                method=method,
                endpoint=path
            ).observe(duration)
            
            return response
            
        except Exception as e:
            # Record error metrics
            duration = time.time() - start_time
            
            HTTP_REQUEST_COUNT.labels(
                method=method,
                endpoint=path,
                status=500
            ).inc()
            
            HTTP_REQUEST_DURATION.labels(
                method=method,
                endpoint=path
            ).observe(duration)
            
            logger.error(
                "Request failed",
                method=method,
                path=path,
                error=str(e),
                exc_info=True
            )
            raise
