"""Main FastAPI application module."""
import logging
import os
import sys
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from .routes import chat, practices, repositories
from ..utils.logging import setup_logging
from ..middleware.error_handler import handle_errors, AppError
from ..database import get_db, engine, init_db
from ..models.base import Base

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RepoAnalyzer API",
    description="API for analyzing GitHub repositories",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
@app.exception_handler(AppError)
async def app_error_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc)}
    )

app.add_middleware(BaseHTTPMiddleware, dispatch=handle_errors)

# Include routers
app.include_router(repositories.router, prefix="/api/repositories", tags=["repositories"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(practices.router, prefix="/api/practices", tags=["practices"])

@app.on_event("startup")
async def startup():
    """Initialize application on startup."""
    try:
        # Log Python path and working directory
        logger.info(f"Python path: {sys.path}")
        logger.info(f"Working directory: {os.getcwd()}")
        
        # Initialize database
        await init_db()
        
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

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Check API health status."""
    try:
        # Check database connection
        await db.execute(text("SELECT 1"))
        await db.commit()
        
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Health check failed"
        )
