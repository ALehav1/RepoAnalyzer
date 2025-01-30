"""File analysis-related Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FileAnalysisBase(BaseModel):
    """Base schema for file analysis data."""
    path: str
    short_analysis: Optional[str] = None
    detailed_analysis: Optional[str] = None

class FileAnalysisCreate(FileAnalysisBase):
    """Schema for creating a new file analysis."""
    repo_id: str
    content_hash: str

class FileAnalysis(FileAnalysisBase):
    """Full file analysis schema with all fields."""
    id: str
    repo_id: str
    content_hash: str
    analysis_timestamp: Optional[datetime]

    class Config:
        from_attributes = True
