"""Repository-related Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from .file_analysis import FileAnalysis
from .best_practice import BestPractice

class RepositoryBase(BaseModel):
    """Base schema for repository data."""
    url: str

class RepositoryCreate(RepositoryBase):
    """Schema for creating a new repository."""
    pass

class Repository(RepositoryBase):
    """Full repository schema with all fields."""
    id: str
    name: str
    is_valid: bool
    local_path: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_analyzed_at: Optional[datetime]
    analysis_cache: Optional[Dict[str, Any]]
    files: List[FileAnalysis] = []
    best_practices: List[BestPractice] = []

    class Config:
        from_attributes = True

class RepositoryAnalysisResponse(BaseModel):
    """Response schema for repository analysis."""
    repository: Repository
    summary: Optional[str]
    structure: Optional[Dict[str, Any]]
    best_practices: List[BestPractice]

class RepositoryStructureResponse(BaseModel):
    """Response schema for repository structure."""
    files: List[Dict[str, Any]]
    directories: List[str]
    total_files: int
    total_size: int
