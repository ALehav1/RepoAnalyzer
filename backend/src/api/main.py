from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ..ingestor.repo_manager import RepoManager
from ..ingestor.chunker import CodeChunker
from ..analysis.analyzer import CodeAnalyzer
from ..storage.vector_store import VectorStore
from .stream import analysis_stream
from .types import AnalysisResponse, SearchResponse, BestPracticesResponse
import asyncio
import json
from pathlib import Path
import shutil
import os
import uuid

app = FastAPI(
    title="RepoAnalyzer API",
    description="API for analyzing code repositories and finding best practices",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "System",
            "description": "System-related endpoints"
        },
        {
            "name": "Repositories",
            "description": "Endpoints for managing repositories"
        },
        {
            "name": "Analysis",
            "description": "Endpoints for analyzing repositories"
        },
        {
            "name": "Search",
            "description": "Endpoints for searching across code"
        },
        {
            "name": "Chat",
            "description": "Endpoints for chatting with the AI"
        }
    ]
)

# Initialize services
repo_manager = RepoManager()
code_chunker = CodeChunker()
code_analyzer = CodeAnalyzer()
vector_store = VectorStore()

# Configure CORS
origins = [
    "http://localhost:5173",  # Development server
]

# Add production origins based on environment
if os.getenv("ENVIRONMENT") == "production":
    origins.extend([
        os.getenv("FRONTEND_URL", ""),  # Production frontend URL
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

class AnalyzeRepoRequest(BaseModel):
    url: str

class SearchRequest(BaseModel):
    query: str
    best_practices_only: Optional[bool] = False

class ChatRequest(BaseModel):
    message: str
    repo_urls: Optional[List[str]] = None

class RepoRequest(BaseModel):
    repo_url: str

@app.get("/api/health", tags=["System"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        dict: Status message indicating the API is operational
    """
    return {"status": "healthy"}

@app.get("/api/list-repos", tags=["Repositories"])
async def list_repos():
    """
    List all analyzed repositories.
    
    Returns:
        list: List of repository information including analysis status
        
    Raises:
        HTTPException: If there's an error accessing the repository data
    """
    try:
        repos_dir = Path("repos")
        if not repos_dir.exists():
            return {"repos": []}
        
        repos = []
        for repo_dir in repos_dir.iterdir():
            if repo_dir.is_dir():
                meta_file = repo_dir / "meta.json"
                if meta_file.exists():
                    with open(meta_file) as f:
                        meta = json.load(f)
                        repos.append({
                            "repo_url": meta.get("url"),
                            "last_analyzed": meta.get("last_analyzed")
                        })
        return {"repos": repos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/refresh-repo", tags=["Repositories"])
async def refresh_repo(request: RepoRequest):
    """
    Refresh analysis for a repository.
    
    Args:
        request (RepoRequest): Repository refresh request containing the repository URL
        
    Returns:
        dict: Status message indicating the refresh operation was successful
        
    Raises:
        HTTPException: If the repository cannot be refreshed
    """
    try:
        local_path = await repo_manager.clone_or_pull_repo(request.repo_url)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/delete-repo", tags=["Repositories"])
async def delete_repo(request: RepoRequest):
    """
    Delete a repository.
    
    Args:
        request (RepoRequest): Repository delete request containing the repository URL
        
    Returns:
        dict: Status message indicating the delete operation was successful
        
    Raises:
        HTTPException: If the repository cannot be deleted
    """
    try:
        repo_dir = Path("repos") / Path(request.repo_url).name
        if repo_dir.exists():
            shutil.rmtree(repo_dir)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Chat with the AI about repositories.
    
    Args:
        request (ChatRequest): Chat request containing the message and optional repository context
        
    Returns:
        dict: AI response to the chat message
        
    Raises:
        HTTPException: If the chat operation fails
    """
    try:
        # For now, just echo back the message
        return {"answer": f"You asked: {request.message}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stream", tags=["Analysis"])
async def stream_analysis(request: Request):
    return await analysis_stream.subscribe(request)

@app.post("/api/analyze-repo", tags=["Analysis"])
async def analyze_repo(request: AnalyzeRepoRequest):
    """
    Analyze a GitHub repository.
    
    Args:
        request (AnalyzeRepoRequest): Repository analysis request containing the repository URL
        
    Returns:
        AnalysisResponse: Detailed analysis of the repository
            
    Raises:
        HTTPException: If the repository cannot be accessed or analyzed
    """
    try:
        # Clone/pull repository
        await analysis_stream.publish({
            "status": "cloning",
            "message": f"Cloning repository {request.url}..."
        })
        
        try:
            local_path = await repo_manager.clone_or_pull_repo(request.url)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Collect all code files
        try:
            code_files = repo_manager.collect_code_files(local_path)
        except ValueError as e:
            raise HTTPException(status_code=500, detail=f"Failed to collect code files: {str(e)}")
        
        file_analyses = []
        total_chunks = 0
        best_practices = []
        
        # Split code into chunks
        await analysis_stream.publish({
            "status": "chunking",
            "message": "Splitting code into analyzable chunks..."
        })
        
        for file_path in code_files:
            content = repo_manager.get_file_content(file_path)
            if not content:
                continue
            
            # Split into chunks
            try:
                chunks = code_chunker.split_into_chunks(content, file_path)
                total_chunks += len(chunks)
                
                file_chunks = []
                # Analyze each chunk
                for i, chunk in enumerate(chunks, 1):
                    await analysis_stream.publish({
                        "status": "analyzing",
                        "message": f"Analyzing chunk {i}/{total_chunks}...",
                        "progress": i / total_chunks
                    })
                    
                    # Analyze the chunk
                    try:
                        analysis = await code_analyzer.analyze_chunk(chunk)
                        if analysis.get("best_practice"):
                            best_practices.append(analysis)
                        file_chunks.append(analysis)
                    except Exception as e:
                        print(f"Warning: Failed to analyze chunk {i} in {file_path}: {str(e)}")
                        continue
                
                if file_chunks:
                    file_analyses.append({
                        "file_path": str(file_path),
                        "chunks": file_chunks
                    })
            except Exception as e:
                print(f"Warning: Failed to process file {file_path}: {str(e)}")
                continue
        
        # Create final response
        response = {
            "repository_url": request.url,
            "local_path": str(local_path),
            "total_files": len(code_files),
            "total_chunks": total_chunks,
            "file_analyses": file_analyses,
            "best_practices": best_practices
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/search", tags=["Search"], response_model=SearchResponse)
async def search(request: SearchRequest):
    """
    Search across analyzed code using semantic similarity.
    
    Args:
        request (SearchRequest): Search request containing the query and search options
        
    Returns:
        SearchResponse: Search results including:
            - Matching code snippets
            - Relevance scores
            - File locations
            
    Raises:
        HTTPException: If the search operation fails
    """
    try:
        results = await vector_store.search_similar(
            request.query,
            n_results=10,
            best_practices_only=request.best_practices_only
        )
        
        if results.get("error"):
            raise HTTPException(status_code=500, detail=results["error"])
            
        return SearchResponse(results=results["matches"])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/best-practices", tags=["Analysis"], response_model=BestPracticesResponse)
async def get_best_practices():
    """
    Get all stored best practices.
    
    Returns:
        BestPracticesResponse: List of best practices including:
            - Code snippets
            - Analysis results
            - File locations
            
    Raises:
        HTTPException: If the best practices cannot be retrieved
    """
    try:
        practices = vector_store.load_best_practices()
        return BestPracticesResponse(best_practices=practices)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
