"""Test application configuration."""
from fastapi import FastAPI
from src.api.v1.patterns import router as patterns_router

def create_test_app():
    """Create FastAPI test application."""
    app = FastAPI(title="RepoAnalyzer Test API")
    app.include_router(patterns_router)  # Router already has prefix
    return app

# Create test app instance
test_app = create_test_app()
