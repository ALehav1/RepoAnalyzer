"""Main application module."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import socket
from contextlib import asynccontextmanager

from .api.routes import (
    repositories,
    health,
    upload
)
from .api.v1 import patterns
from .database import init_db
from .core.logging import setup_logging, get_logger, log_request_middleware
from .core.exceptions import RepoAnalyzerError

# Set up logging
setup_logging()
logger = get_logger(__name__)

def is_port_in_use(port: int) -> bool:
    """Check if a port is in use.
    
    Args:
        port (int): Port number to check
        
    Returns:
        bool: True if port is in use, False otherwise
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('localhost', port))
            return False
        except socket.error:
            return True

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Function that handles startup and shutdown events.
    """
    try:
        logger.info("application_startup", message="Starting up database...")
        init_db()
        yield
    except Exception as e:
        logger.error(
            "startup_failed",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        raise
    finally:
        logger.info("application_shutdown", message="Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="RepoAnalyzer API",
    description="API for analyzing GitHub repositories",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add logging middleware
app.middleware("http")(log_request_middleware)

# Exception handler for our custom exceptions
@app.exception_handler(RepoAnalyzerError)
async def repo_analyzer_exception_handler(request: Request, exc: RepoAnalyzerError):
    """Handle RepoAnalyzerError exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
                "timestamp": exc.timestamp
            }
        }
    )

# Register routes
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(repositories.router, prefix="/api/repositories", tags=["repositories"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(patterns.router, tags=["patterns"])

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "RepoAnalyzer API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10004)
