"""Main entry point for the RepoAnalyzer application."""
import uvicorn
from src.api.main import app
from src.utils.logging import setup_logging

if __name__ == "__main__":
    # Set up logging
    setup_logging()
    
    # Run the application
    uvicorn.run(
        "src.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_config=None  # Use our custom logging config
    )
