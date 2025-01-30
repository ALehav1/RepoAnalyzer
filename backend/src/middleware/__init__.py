"""Middleware package."""

from .error_handler import handle_errors, AppError

__all__ = ["handle_errors", "AppError"]
