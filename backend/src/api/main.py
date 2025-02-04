"""Main application module."""
import socket
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .routes import health, repositories, chat
from .schemas.health import HealthResponse, ComponentStatus
from ..core.config import settings
from ..core.cors import configure_cors
from ..core.logging import setup_logging, get_logger, log_request_middleware
from ..core.exceptions import RepoAnalyzerError
from ..database import init_db, get_db, engine
from ..models.base import Base

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

app = FastAPI(
    title="Repository Analyzer API",
    description="API for analyzing GitHub repositories and detecting patterns",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
configure_cors(app, settings)

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

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(repositories.router, prefix="/repos", tags=["Repositories"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to the Repository Analyzer API"}

@app.on_event("shutdown")
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        await engine.dispose()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
