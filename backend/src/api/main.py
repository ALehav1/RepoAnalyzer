"""Main FastAPI application module."""
import logging
import os
import sys
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from .routes import health, repositories, chat
from .schemas.health import HealthResponse, ComponentStatus
from ..utils.logging import setup_logging
from ..middleware.error_handler import handle_errors, AppError
from ..database import get_db, engine, init_db
from ..models.base import Base
from ..core.config import get_settings
from ..core.cors import configure_cors

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Repository Analyzer API",
    description="API for analyzing GitHub repositories and detecting patterns",
    version="1.0.0",
)

# Initialize settings
settings = get_settings()

# Configure CORS
configure_cors(app, settings)

# Add error handling middleware
@app.exception_handler(AppError)
async def app_error_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc)}
    )

app.add_middleware(BaseHTTPMiddleware, dispatch=handle_errors)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(repositories.router, prefix="/repos", tags=["Repositories"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.on_event("startup")
def startup():
    """Initialize application on startup."""
    try:
        # Log Python path and working directory
        logger.info(f"Python path: {sys.path}")
        logger.info(f"Working directory: {os.getcwd()}")
        
        # Initialize database
        init_db()
        
    except Exception as e:
        logger.error(f"Failed to initialize application: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown():
    """Clean up resources on shutdown."""
    try:
        await engine.dispose()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

@app.get("/api/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """Check API health status."""
    try:
        # Check database connection
        await db.execute(text("SELECT 1"))
        await db.commit()
        
        return HealthResponse(
            status="healthy",
            components={
                "database": ComponentStatus(
                    status="healthy",
                    details="Connected successfully"
                )
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthResponse(
            status="unhealthy",
            components={
                "database": ComponentStatus(
                    status="unhealthy",
                    details=str(e)
                )
            }
        )

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Repository Analyzer API"}
