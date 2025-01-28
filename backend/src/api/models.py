from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum

class CodeDimension(str, Enum):
    ARCHITECTURE_DESIGN = "architecture_design"
    STATE_MANAGEMENT = "state_management"
    API_BACKEND = "api_backend"
    DOCUMENTATION = "documentation"
    TESTING = "testing"
    PERFORMANCE_SECURITY = "performance_security"

class AnalysisDimensions(BaseModel):
    architecture_design: bool = Field(default=False, description="Code architecture and design patterns")
    state_management: bool = Field(default=False, description="State management and data flow")
    api_backend: bool = Field(default=False, description="API and backend integration")
    documentation: bool = Field(default=False, description="Code documentation and comments")
    testing: bool = Field(default=False, description="Testing and test coverage")
    performance_security: bool = Field(default=False, description="Performance and security considerations")

class CodeAnalysis(BaseModel):
    dimensions: AnalysisDimensions
    summary: str = Field(..., description="Brief summary of the code analysis")
    best_practice: bool = Field(default=False, description="Whether this code represents a best practice")
    best_practice_reason: str = Field(default="", description="Reason for considering this a best practice")
    generalization_potential: bool = Field(default=False, description="Whether this code can be generalized")
    generalization_ideas: str = Field(default="", description="Ideas for generalizing this code")
    suggestions: List[str] = Field(default_factory=list, description="Suggestions for improvement")
    patterns_detected: List[str] = Field(default_factory=list, description="Design patterns detected in the code")

class ChunkMetadata(BaseModel):
    file_path: str
    start_line: int
    end_line: int
    n_lines: int
    imports: List[str]
    definitions: List[str]
    file_type: str
    n_tokens: int

class CodeChunk(BaseModel):
    content: str
    metadata: ChunkMetadata
    analysis: Optional[CodeAnalysis] = None

class FileAnalysis(BaseModel):
    file_path: str
    chunks: List[CodeChunk]

class AnalysisResponse(BaseModel):
    repo_url: str
    files_analyzed: int
    chunks_analyzed: int
    best_practices_found: int
    file_analyses: List[FileAnalysis]

class SearchMatch(BaseModel):
    text: str
    metadata: Dict
    id: str

class SearchResponse(BaseModel):
    results: List[SearchMatch]

class BestPractice(BaseModel):
    id: str
    repo_url: str
    file_path: str
    chunk_text: str
    analysis: CodeAnalysis
    metadata: ChunkMetadata

class BestPracticesResponse(BaseModel):
    best_practices: List[BestPractice]
