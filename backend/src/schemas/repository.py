"""Repository schemas."""
from datetime import datetime
from typing import Optional, Dict, Any, List, Literal
from pydantic import BaseModel, Field, HttpUrl, ConfigDict

class RepositoryBase(BaseModel):
    """Base schema for repository data."""
    url: str = Field(..., description="Repository URL")
    name: str = Field(..., min_length=1, max_length=255, description="Repository name")
    description: Optional[str] = Field(None, max_length=1000, description="Repository description")

class RepositoryCreate(RepositoryBase):
    """Schema for creating a new repository."""
    pass

class Repository(RepositoryBase):
    """Full repository schema with all fields."""
    id: str
    is_valid: bool = True
    local_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_analyzed_at: Optional[datetime] = None
    analysis_status: Optional[str] = Field(None, description="Current analysis status")
    analysis_progress: Optional[float] = Field(None, description="Analysis progress (0-100)")
    analysis_error: Optional[str] = Field(None, description="Error message if analysis failed")
    analysis_metrics: Optional[Dict[str, Any]] = Field(None, description="Analysis metrics")

    class Config:
        """Pydantic model configuration."""
        from_attributes = True  # This is the new way to enable ORM mode in Pydantic v2
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "url": "https://github.com/user/repo",
                "name": "repo",
                "description": "A sample repository",
                "is_valid": True,
                "created_at": "2025-02-03T00:00:00Z",
                "updated_at": "2025-02-03T00:00:00Z",
                "analysis_status": "pending",
                "analysis_progress": 0.0
            }
        }

class RepositoryResponse(Repository):
    """Repository response schema."""
    pass

class JobStatus(BaseModel):
    """Job status schema."""
    id: str = Field(..., description="Job ID")
    status: Literal["pending", "processing", "completed", "failed"] = Field(
        ..., description="Job status"
    )
    progress: float = Field(
        ..., ge=0.0, le=100.0, description="Job progress percentage"
    )
    error: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(..., description="Job creation timestamp")
    updated_at: datetime = Field(..., description="Last status update timestamp")

class FileInfo(BaseModel):
    """File information schema."""
    path: str = Field(..., description="File path relative to repository root")
    type: Literal["file", "directory"] = Field(..., description="Item type")
    size: Optional[int] = Field(None, description="File size in bytes")
    language: Optional[str] = Field(None, description="Programming language")
    last_modified: datetime = Field(..., description="Last modification timestamp")

class AnalysisMetric(BaseModel):
    """Analysis metric schema."""
    category: str = Field(..., description="Metric category")
    value: Any = Field(..., description="Metric value")
    description: str = Field(..., description="Metric description")
    trend: Optional[str] = Field(None, description="Trend direction if applicable")

class AnalysisResult(BaseModel):
    """Analysis result schema."""
    summary: str = Field(..., description="Analysis summary")
    strengths: List[str] = Field(default_factory=list, description="Repository strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Areas for improvement")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations")
    metrics: Dict[str, List[AnalysisMetric]] = Field(
        default_factory=dict, description="Analysis metrics"
    )
    structure: List[FileInfo] = Field(default_factory=list, description="Repository structure")
    last_updated: datetime = Field(..., description="Analysis timestamp")
    analysis_version: str = Field(..., description="Analysis version number")

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

class BulkRepositoryCreate(BaseModel):
    """Schema for bulk repository creation."""
    repositories: List[RepositoryCreate] = Field(
        ...,
        min_items=1,
        max_items=10,
        description="List of repositories to create. Maximum 10 at a time."
    )

class BulkRepositoryResponse(BaseModel):
    """Response schema for bulk repository creation."""
    successful: List[RepositoryResponse] = Field(
        default_factory=list,
        description="Successfully created repositories"
    )
    failed: List[Dict[str, str]] = Field(
        default_factory=list,
        description="Failed repository creations with error messages"
    )
    total_count: int = Field(..., description="Total number of repositories processed")
    success_count: int = Field(..., description="Number of successfully created repositories")
    failure_count: int = Field(..., description="Number of failed repository creations")

class AnalysisResponse(BaseModel):
    """Response model for repository analysis endpoints."""
    status: str
    message: str
    analysis: Optional[RepositoryAnalysis] = None
    error: Optional[str] = None

class AnalysisStatus(BaseModel):
    """Status model for repository analysis."""
    repo_id: str = Field(..., description="Repository ID")
    task_id: str = Field(..., description="Analysis task ID")
    status: str = Field(..., description="Analysis status (pending, processing, completed, failed)")
    progress: Optional[float] = Field(None, description="Analysis progress (0-100)")
    metrics: Optional[Dict[str, Any]] = Field(None, description="Analysis metrics")
    started_at: datetime = Field(..., description="When the analysis started")
    completed_at: Optional[datetime] = Field(None, description="When the analysis completed")
    error: Optional[str] = Field(None, description="Error message if analysis failed")
    warnings: List[str] = Field(default_factory=list, description="List of warnings during analysis")

class AnalysisMetrics(BaseModel):
    """Metrics from repository analysis."""
    total_files: int
    total_lines: int
    average_file_size: float
    complexity_score: float
    maintainability_score: float
    test_coverage: Optional[float]
    documentation_coverage: Optional[float]
    security_score: Optional[float]
    performance_score: Optional[float]
    created_at: datetime
    updated_at: datetime

class DocCoverageSchema(BaseModel):
    """Schema for documentation coverage metrics of a single file."""
    file_path: str = Field(..., description="Path to the analyzed file")
    total_items: int = Field(..., description="Total number of documentable items")
    documented_items: int = Field(..., description="Number of items with docstrings")
    type_hint_coverage: float = Field(
        ...,
        description="Percentage of function parameters with type hints",
        ge=0,
        le=1
    )
    example_count: int = Field(..., description="Number of code examples in docstrings")
    todos_count: int = Field(..., description="Number of TODO comments")
    missing_docs: List[str] = Field(..., description="List of items missing documentation")

class DocumentationMetrics(BaseModel):
    """Schema for repository-wide documentation metrics."""
    coverage_score: float = Field(
        ...,
        description="Overall documentation coverage score (0-100)",
        ge=0,
        le=100
    )
    type_hint_score: float = Field(
        ...,
        description="Type hint coverage score (0-100)",
        ge=0,
        le=100
    )
    example_score: float = Field(
        ...,
        description="Code example coverage score (0-100)",
        ge=0,
        le=100
    )
    readme_score: float = Field(
        ...,
        description="README.md completeness score (0-100)",
        ge=0,
        le=100
    )
    api_doc_score: float = Field(
        ...,
        description="API documentation score (0-100)",
        ge=0,
        le=100
    )
    file_scores: Dict[str, DocCoverageSchema] = Field(
        ...,
        description="Individual file documentation scores"
    )
    recommendations: List[str] = Field(
        ...,
        description="List of documentation improvement recommendations"
    )
    analyzed_at: str = Field(
        ...,
        description="ISO format timestamp of when the analysis was performed"
    )
