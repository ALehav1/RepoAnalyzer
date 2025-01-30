"""Pydantic schemas for code analysis."""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum

class AnalysisDimensions(BaseModel):
    """Dimensions for code analysis."""
    architecture_design: bool = Field(default=False, description="Code architecture and design patterns")
    code_quality: bool = Field(default=False, description="Code quality and maintainability")
    documentation: bool = Field(default=False, description="Code documentation and comments")
    testing: bool = Field(default=False, description="Testing and test coverage")
    security: bool = Field(default=False, description="Security considerations")
    performance: bool = Field(default=False, description="Performance considerations")

class CodeAnalysis(BaseModel):
    """Schema for code analysis results."""
    dimensions: AnalysisDimensions
    summary: str = Field(..., description="Brief summary of the code analysis")
    best_practice: bool = Field(default=False, description="Whether this code represents a best practice")
    best_practice_reason: str = Field(default="", description="Reason for considering this a best practice")
    generalization_potential: bool = Field(default=False, description="Whether this code can be generalized")
    generalization_ideas: str = Field(default="", description="Ideas for generalizing this code")
    suggestions: List[str] = Field(default_factory=list, description="Suggestions for improvement")
    patterns_detected: List[str] = Field(default_factory=list, description="Design patterns detected in the code")

class ChunkMetadata(BaseModel):
    """Metadata for code chunks."""
    file_path: str
    start_line: int
    end_line: int
    n_lines: int
    imports: List[str]
    definitions: List[str]
    file_type: str
    n_tokens: int

class CodeChunk(BaseModel):
    """Schema for code chunks."""
    content: str
    metadata: ChunkMetadata
    analysis: Optional[CodeAnalysis] = None

class FileAnalysisResponse(BaseModel):
    """Response schema for file analysis."""
    file_path: str
    chunks: List[CodeChunk]

class AnalysisResponse(BaseModel):
    """Response schema for repository analysis."""
    repo_url: str
    files_analyzed: int
    chunks_analyzed: int
    best_practices_found: int
    file_analyses: List[FileAnalysisResponse]

class SearchMatch(BaseModel):
    """Schema for search results."""
    text: str
    metadata: Dict
    id: str

class SearchResponse(BaseModel):
    """Response schema for search operations."""
    results: List[SearchMatch]

class BestPracticeResponse(BaseModel):
    """Response schema for best practices."""
    id: str
    repo_url: str
    file_path: str
    chunk_text: str
    analysis: CodeAnalysis
    metadata: ChunkMetadata

class BestPracticesResponse(BaseModel):
    """Response schema for multiple best practices."""
    best_practices: List[BestPracticeResponse]
