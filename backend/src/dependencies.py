"""Dependencies for FastAPI application."""
from typing import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .database import async_session_maker
from .services.code_quality import CodeQualityService
from .services.documentation_analyzer import DocumentationAnalyzer
from .services.best_practices_analyzer import BestPracticesAnalyzer

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with async_session_maker() as session:
        yield session

def get_code_quality_service() -> CodeQualityService:
    """Get code quality service instance."""
    return CodeQualityService()

def get_documentation_analyzer() -> DocumentationAnalyzer:
    """Get documentation analyzer instance."""
    return DocumentationAnalyzer()

def get_best_practices_analyzer() -> BestPracticesAnalyzer:
    """Get best practices analyzer instance."""
    return BestPracticesAnalyzer()
