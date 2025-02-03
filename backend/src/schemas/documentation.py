"""Pydantic schemas for documentation analysis."""
from typing import Dict, List
from pydantic import BaseModel, Field

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
