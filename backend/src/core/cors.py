"""CORS configuration for FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import Settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

def configure_cors(app: FastAPI, settings: Settings):
    """
    Configure CORS middleware for the FastAPI application
    
    Args:
        app (FastAPI): The FastAPI application instance
        settings (Settings): Application settings with CORS configuration
    """
    origins = settings.get_cors_origins()
    if origins:
        logger.debug(f"Setting up CORS with origins: {origins}")
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],  # Allows all methods
            allow_headers=["*"],  # Allows all headers
        )
