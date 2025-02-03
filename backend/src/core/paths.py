"""Path utilities for the application."""
from pathlib import Path
from typing import Dict
import logging
from .config import settings

logger = logging.getLogger(__name__)

# Base directories
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
REPO_STORAGE_DIR = DATA_DIR / settings.REPOS_DIR
CHROMA_DB_DIR = DATA_DIR / settings.CHROMADB_PATH
OUTPUT_DIR = DATA_DIR / settings.OUTPUT_DIR
VECTOR_STORE_DIR = DATA_DIR / settings.VECTOR_STORE_DIR

# Dictionary of all managed directories
MANAGED_DIRS: Dict[str, Path] = {
    "data": DATA_DIR,
    "repos": REPO_STORAGE_DIR,
    "chroma_db": CHROMA_DB_DIR,
    "output": OUTPUT_DIR,
    "vector_store": VECTOR_STORE_DIR
}

def ensure_dirs() -> None:
    """Create all necessary directories if they don't exist."""
    logger.info("Ensuring all required directories exist...")
    for name, path in MANAGED_DIRS.items():
        try:
            path.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Ensured directory exists: {name} at {path}")
        except Exception as e:
            logger.error(f"Failed to create directory {name} at {path}: {e}")
            raise

def get_repo_path(repo_name: str) -> Path:
    """Get the path for a specific repository."""
    return REPO_STORAGE_DIR / repo_name

def get_output_path(filename: str) -> Path:
    """Get the path for an output file."""
    return OUTPUT_DIR / filename
