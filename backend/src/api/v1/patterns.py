"""API endpoints for pattern detection and analysis."""
import os
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from ...services.pattern_detectors.advanced_pattern_detector import AdvancedPatternDetector
from ...schemas.patterns import PatternAnalysisRequest, PatternAnalysisResponse, PatternMatch
from ...core.exceptions import PatternDetectionError, FileAccessError
from ...core.logging import get_logger
import time

router = APIRouter(prefix="/api/v1/patterns", tags=["patterns"])
detector = AdvancedPatternDetector()
logger = get_logger(__name__)

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
    start_time = time.time()
    logger.info("pattern_analysis.started", file_path=str(request.file_path))
    
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
        detector_matches = await detector.analyze_file(request.file_path)
        
        # Convert detector matches to Pydantic models
        patterns = [
            PatternMatch(
                name=match.name,
                confidence=match.confidence,
                line_number=match.line_number,
                context={
                    "complexity": match.context.complexity,
                    "dependencies": match.context.dependencies,
                    "methods": match.context.methods,
                    "attributes": match.context.attributes,
                    "related_patterns": match.context.related_patterns
                }
            )
            for match in detector_matches
        ]
        
        duration = time.time() - start_time
        logger.info(
            "pattern_analysis.completed",
            file_path=str(request.file_path),
            pattern_count=len(patterns),
            duration_ms=round(duration * 1000, 2)
        )
        
        return PatternAnalysisResponse(patterns=patterns)
        
    except FileAccessError as e:
        logger.error(
            "pattern_analysis.file_access_error",
            file_path=str(request.file_path),
            error=str(e),
            exc_info=True
        )
        raise HTTPException(status_code=404, detail=str(e))
        
    except SyntaxError as e:
        logger.error(
            "pattern_analysis.syntax_error",
            file_path=str(request.file_path),
            error=str(e),
            exc_info=True
        )
        raise HTTPException(status_code=422, detail=f"Syntax error: {str(e)}")
        
    except PatternDetectionError as e:
        logger.error(
            "pattern_analysis.detection_error",
            file_path=str(request.file_path),
            error=str(e),
            exc_info=True
        )
        raise HTTPException(status_code=500, detail=str(e))
        
    except Exception as e:
        logger.error(
            "pattern_analysis.unexpected_error",
            file_path=str(request.file_path),
            error=str(e),
            exc_info=True
        )
        raise HTTPException(status_code=500, detail=str(e))
