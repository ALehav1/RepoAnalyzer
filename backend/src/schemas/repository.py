"""Repository schemas."""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Union
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    """Status of a repository analysis job."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class RepositoryBase(BaseModel):
    """Base repository schema."""
    url: str

class RepositoryCreate(RepositoryBase):
    """Schema for creating a repository."""
    pass

class RepositoryUpdate(RepositoryBase):
    """Schema for updating a repository."""
    pass

class ContributorInfo(BaseModel):
    username: str
    contributions: int
    avatar_url: str
    profile_url: str

class ActivityItem(BaseModel):
    type: str
    title: str
    description: str
    author: str
    timestamp: str
    url: str

class FileInfo(BaseModel):
    path: str
    type: str
    size: int
    language: Optional[str] = None
    last_modified: str
    children: Optional[List['FileInfo']] = None
    preview: Optional[str] = None

class DependencyInfo(BaseModel):
    name: str
    version: str
    type: str

class SecurityIssue(BaseModel):
    severity: str
    title: str
    description: str
    location: str
    recommendation: str

class PerformanceMetric(BaseModel):
    name: str
    value: float
    unit: str
    threshold: float
    status: str

class MetricItem(BaseModel):
    category: str
    value: float
    description: str
    trend: Optional[float] = None

class CodePattern(BaseModel):
    name: str
    frequency: int
    examples: List[Dict[str, str]]
    impact: str
    recommendation: str

class ChatMessage(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    context: Optional[Dict[str, str]] = None
    related_files: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)

class RepositoryMetrics(BaseModel):
    complexity: List[MetricItem]
    quality: List[MetricItem]
    patterns: List[CodePattern]
    dependencies: List[DependencyInfo]
    security: List[SecurityIssue]
    performance: List[PerformanceMetric]

class RepositoryAnalysis(BaseModel):
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    metrics: RepositoryMetrics
    last_updated: str
    analysis_version: str

class RepositoryStats(BaseModel):
    files_count: int
    total_lines: int
    languages: Dict[str, int]
    stars: int
    forks: int
    contributors: List[ContributorInfo]
    recent_activity: List[ActivityItem]

class Repository(BaseModel):
    """Repository schema."""
    id: str
    url: str
    name: Optional[str] = None
    description: Optional[str] = None
    is_valid: bool = Field(default=False)
    created_at: datetime
    updated_at: datetime
    last_analyzed: Optional[datetime] = None
    analysis_status: str = Field(default="pending")
    analysis_progress: float = Field(default=0.0)
    cached_until: Optional[datetime] = None
    local_path: Optional[str] = None
    stats: Optional[RepositoryStats] = None
    analysis: Optional[RepositoryAnalysis] = None
    structure: Optional[List[FileInfo]] = None
    readme: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class FileBase(BaseModel):
    path: str
    content: Optional[str] = None
    language: Optional[str] = None
    size: Optional[int] = None
    last_modified: Optional[datetime] = None
    short_analysis: Optional[Dict] = None
    detailed_analysis: Optional[Dict] = None
    analysis_timestamp: Optional[datetime] = None

class File(FileBase):
    id: str
    repository_id: str

    model_config = ConfigDict(from_attributes=True)

class BestPractice(BaseModel):
    id: str
    repository_id: Optional[str] = None
    title: str
    description: str
    code_snippet: Optional[str] = None
    file_path: Optional[str] = None
    category: str
    created_at: datetime
    is_generalizable: bool = Field(default=False)

    model_config = ConfigDict(from_attributes=True)

class AnalysisResponse(BaseModel):
    """Response model for repository analysis endpoints."""
    status: str
    message: str
    analysis: Optional[RepositoryAnalysis] = None
    error: Optional[str] = None
