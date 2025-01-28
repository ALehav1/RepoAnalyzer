from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class BaseResponse(BaseModel):
    status: str = "success"
    error: Optional[Dict] = None

class ChunkAnalysis(BaseModel):
    complexity: str
    best_practice: bool
    suggestions: List[str]
    metadata: Dict[str, Any]

class FileAnalysis(BaseModel):
    file_path: str
    chunks: List[ChunkAnalysis]

class AnalysisResponse(BaseModel):
    repository_url: str
    local_path: str
    total_files: int
    total_chunks: int
    file_analyses: List[FileAnalysis]
    best_practices: List[ChunkAnalysis]
    status: str = "success"
    error: Optional[Dict] = None

class SearchResponse(BaseModel):
    results: List[Dict]
    status: str = "success"
    error: Optional[Dict] = None

class BestPracticesResponse(BaseModel):
    practices: List[Dict]
    status: str = "success"
    error: Optional[Dict] = None
