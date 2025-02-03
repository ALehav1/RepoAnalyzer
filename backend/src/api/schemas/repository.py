"""Repository-related Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from .file_analysis import FileAnalysis
from .best_practice import BestPractice
from .metrics import AnalysisMetrics

class RepositoryBase(BaseModel):
    """Base schema for repository data."""
    url: str
    branch: Optional[str] = Field(default="main", description="Repository branch to analyze")
    depth: Optional[int] = Field(default=1, ge=1, le=10, description="Depth of analysis")

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
    status: Literal["pending", "in_progress", "completed", "failed"] = Field(
        default="pending",
        description="Current status of the repository analysis"
    )
    error: Optional[str] = None
    metrics: Optional[AnalysisMetrics] = None

    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    """Response schema for repository analysis."""
    repository: Repository
    status: Literal["pending", "in_progress", "completed", "failed"]
    data: Optional[AnalysisMetrics] = None
    error: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "repository": {
                    "id": "123",
                    "url": "https://github.com/user/repo",
                    "name": "repo",
                    "is_valid": True,
                    "status": "completed",
                    "created_at": "2025-01-31T14:00:00Z",
                    "updated_at": "2025-01-31T14:05:00Z",
                    "last_analyzed_at": "2025-01-31T14:05:00Z"
                },
                "status": "completed",
                "data": {
                    "code_quality": {
                        "score": 85,
                        "details": ["Good code organization"],
                        "recommendations": ["Add more comments"]
                    },
                    "documentation": {
                        "score": 75,
                        "details": ["Documentation present"],
                        "recommendations": ["Add more docstrings"]
                    },
                    "best_practices": {
                        "score": 90,
                        "details": ["Follows style guide"],
                        "recommendations": []
                    }
                }
            }
        }

class RepositoryStructureResponse(BaseModel):
    """Response schema for repository structure."""
    files: List[Dict[str, Any]]
    directories: List[str]
    total_files: int
    total_size: int
