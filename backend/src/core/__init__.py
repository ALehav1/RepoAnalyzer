"""Core functionality for the application."""
from .config import settings
from .paths import ensure_dirs, get_repo_path, get_output_path

__all__ = ['settings', 'ensure_dirs', 'get_repo_path', 'get_output_path']
