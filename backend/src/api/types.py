from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class BaseResponse(BaseModel):
    status: str = "success"
    error: Optional[Dict] = None

class DocumentationQuality(BaseModel):
    readme_quality: float
    api_docs_quality: float
    comments_quality: float

class BestPractices(BaseModel):
    code_organization: float
    testing: float
    security: float
    performance: float

class Summary(BaseModel):
    files_count: int
    lines_of_code: int
    languages: Dict[str, float]

class AnalysisResult(BaseModel):
    id: str
    url: str
    status: str
    summary: Summary
    documentation: DocumentationQuality
    best_practices: BestPractices

class Message(BaseModel):
    id: str
    role: str  # 'user' | 'assistant'
    content: str
    timestamp: str

class FileNode(BaseModel):
    name: str
    path: str
    type: str  # 'file' | 'directory'
    children: Optional[List['FileNode']] = None

class AnalyzeRequest(BaseModel):
    url: str

class BulkAnalyzeRequest(BaseModel):
    urls: List[str]

FileNode.update_forward_refs()
