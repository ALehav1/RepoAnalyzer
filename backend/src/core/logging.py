"""Logging configuration for the application.

This module provides a comprehensive logging setup with the following features:
- Structured logging using structlog
- JSON format for machine readability
- Console and file outputs
- Request ID tracking
- Error stack traces
- Performance metrics
- Configurable log levels
"""
import logging
import sys
import time
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path
import structlog
from fastapi import Request
from contextvars import ContextVar

from ..config.settings import settings

# Context variables for request tracking
request_id: ContextVar[str] = ContextVar("request_id", default="")
correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")

class RequestTrackingProcessor:
    """Add request tracking information to log entries."""

    def __call__(self, logger: Any, name: str, event_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Add request_id and correlation_id to the event dict."""
        try:
            event_dict["request_id"] = request_id.get()
        except LookupError:
            pass
        
        try:
            event_dict["correlation_id"] = correlation_id.get()
        except LookupError:
            pass
        
        return event_dict

class PerformanceProcessor:
    """Add performance metrics to log entries."""

    def __call__(self, logger: Any, name: str, event_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Add timing information to the event dict."""
        event_dict["timestamp"] = datetime.utcnow().isoformat()
        if "duration_ms" in event_dict:
            event_dict["duration_ms"] = float(f"{event_dict['duration_ms']:.2f}")
        return event_dict

def setup_logging() -> None:
    """Configure logging for the application.
    
    Features:
    - Structured JSON logging
    - Console and file outputs
    - Request tracking
    - Performance metrics
    - Error stack traces
    - Different log levels for different environments
    """
    # Create log directory if it doesn't exist
    log_dir = Path(settings.log_dir)
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=settings.log_level,
    )
    
    # Add file handlers for different log levels
    handlers = {
        "error": logging.FileHandler(log_dir / "error.log"),
        "info": logging.FileHandler(log_dir / "info.log"),
        "debug": logging.FileHandler(log_dir / "debug.log")
    }
    
    for handler in handlers.values():
        handler.setFormatter(logging.Formatter("%(message)s"))
        logging.getLogger().addHandler(handler)
    
    # Configure structlog pre-processors
    pre_chain = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        RequestTrackingProcessor(),
        PerformanceProcessor(),
    ]
    
    # Configure structlog
    structlog.configure(
        processors=[
            *pre_chain,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(indent=None)
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.getLevelName(settings.log_level)),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True
    )

def get_logger(name: str) -> Any:
    """Get a structured logger.
    
    Args:
        name: The name of the logger (usually __name__)
        
    Returns:
        A structured logger instance
    """
    return structlog.get_logger(name)

async def log_request_middleware(request: Request, call_next: Any) -> Any:
    """Middleware to log request details and timing.
    
    Args:
        request: The FastAPI request
        call_next: The next middleware or route handler
        
    Returns:
        The response from the next handler
    """
    # Generate request ID if not present
    req_id = request.headers.get("X-Request-ID", str(time.time_ns()))
    request_id.set(req_id)
    
    # Get correlation ID if present
    corr_id = request.headers.get("X-Correlation-ID", "")
    if corr_id:
        correlation_id.set(corr_id)
    
    logger = get_logger(__name__)
    
    # Log request
    logger.info(
        "request_started",
        http_method=request.method,
        url=str(request.url),
        client_ip=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
    )
    
    # Time the request
    start_time = time.time()
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        
        # Log response
        logger.info(
            "request_completed",
            duration_ms=duration_ms,
            status_code=response.status_code,
            http_method=request.method,
            url=str(request.url),
        )
        return response
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error(
            "request_failed",
            duration_ms=duration_ms,
            error=str(e),
            error_type=type(e).__name__,
            http_method=request.method,
            url=str(request.url),
            exc_info=True,
        )
        raise
