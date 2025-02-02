"""API endpoints for pattern detection and analysis."""
import os
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ...services.pattern_detectors.advanced_pattern_detector import AdvancedPatternDetector
from ...schemas.patterns import PatternAnalysisRequest, PatternAnalysisResponse
from ...core.exceptions import PatternDetectionError, FileAccessError

router = APIRouter(prefix="/api/v1/patterns", tags=["patterns"])
detector = AdvancedPatternDetector()

@router.post("/analyze", response_model=PatternAnalysisResponse)
async def analyze_patterns(request: PatternAnalysisRequest) -> PatternAnalysisResponse:
    """Analyze code for design patterns.
    
    Args:
        request: Pattern analysis request containing code to analyze
        
    Returns:
        PatternAnalysisResponse: Analysis results with detected patterns
        
    Raises:
        FileAccessError: If file cannot be accessed or does not exist
        PatternDetectionError: If pattern analysis fails
        HTTPException: For other errors
    """
    try:
        # Validate file exists and is readable
        if not os.path.exists(request.file_path):
            raise FileAccessError(
                message="File not found",
                file_path=str(request.file_path)
            )
        
        if not os.path.isfile(request.file_path):
            raise FileAccessError(
                message="Path is not a file",
                file_path=str(request.file_path)
            )
            
        if not os.access(request.file_path, os.R_OK):
            raise FileAccessError(
                message="File is not readable",
                file_path=str(request.file_path)
            )
            
        # Validate file extension
        if not str(request.file_path).endswith('.py'):
            raise FileAccessError(
                message="Only Python files are supported",
                file_path=str(request.file_path),
                details={"supported_extensions": [".py"]}
            )
        
        # Analyze patterns
        patterns = await detector.analyze_file(request.file_path)
        
        return PatternAnalysisResponse(patterns=patterns)
        
    except FileAccessError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "FILE_ACCESS_ERROR",
                "message": str(e),
                "details": e.details if hasattr(e, 'details') else None
            }
        )
    except PatternDetectionError as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "PATTERN_DETECTION_ERROR",
                "message": str(e),
                "details": e.details if hasattr(e, 'details') else None
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "details": str(e)
            }
        )
