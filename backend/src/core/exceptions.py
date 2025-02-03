"""Custom exception classes for the application."""
import logging
from typing import Optional, Any, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class RepoAnalyzerError(Exception):
    """Base exception for all application errors."""
    
    def __init__(
        self,
        message: str,
        error_code: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize error."""
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.timestamp = datetime.utcnow().isoformat()
        
        # Log the error with details
        log_data = {
            "error_code": self.error_code,
            "status_code": self.status_code,
            "message": self.message,
            "details": self.details,
            "timestamp": self.timestamp
        }
        logger.error(
            f"{self.__class__.__name__}: {self.message}",
            extra={"error_data": log_data},
            exc_info=True
        )
        super().__init__(self.message)

class DatabaseError(RepoAnalyzerError):
    """Database operation errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        """Initialize database error."""
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            status_code=status_code,
            details=details
        )

class RepositoryError(RepoAnalyzerError):
    """Repository-related errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 400
    ):
        """Initialize repository error."""
        super().__init__(
            message=message,
            error_code="REPOSITORY_ERROR",
            status_code=status_code,
            details=details
        )

class AnalysisError(RepoAnalyzerError):
    """Analysis-related errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        """Initialize analysis error."""
        super().__init__(
            message=message,
            error_code="ANALYSIS_ERROR",
            status_code=status_code,
            details=details
        )

class ValidationError(RepoAnalyzerError):
    """Validation errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize validation error."""
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )

class NotFoundError(RepoAnalyzerError):
    """Resource not found errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize not found error."""
        super().__init__(
            message=message,
            error_code="NOT_FOUND",
            status_code=404,
            details=details
        )

class AuthenticationError(RepoAnalyzerError):
    """Authentication-related errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize authentication error."""
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=401,
            details=details
        )

class AuthorizationError(RepoAnalyzerError):
    """Authorization-related errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize authorization error."""
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            status_code=403,
            details=details
        )

class RateLimitError(RepoAnalyzerError):
    """Rate limit exceeded errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize rate limit error."""
        super().__init__(
            message=message,
            error_code="RATE_LIMIT_ERROR",
            status_code=429,
            details=details
        )

class ExternalServiceError(RepoAnalyzerError):
    """External service (GitHub, OpenAI, etc.) related errors."""
    
    def __init__(
        self,
        message: str,
        service_name: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize external service error."""
        details = details or {}
        details["service_name"] = service_name
        super().__init__(
            message=message,
            error_code="EXTERNAL_SERVICE_ERROR",
            status_code=502,
            details=details
        )

class PatternDetectionError(RepoAnalyzerError):
    """Pattern detection related errors."""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        """Initialize pattern detection error."""
        super().__init__(
            message=message,
            error_code="PATTERN_DETECTION_ERROR",
            status_code=status_code,
            details=details
        )

class FileAccessError(RepoAnalyzerError):
    """File access related errors."""
    
    def __init__(
        self,
        message: str,
        file_path: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """Initialize file access error."""
        details = details or {}
        details["file_path"] = file_path
        super().__init__(
            message=message,
            error_code="FILE_ACCESS_ERROR",
            status_code=400,
            details=details
        )

class AsyncOperationError(Exception):
    """Exception raised when an async operation fails.
    
    Attributes:
        message: Explanation of the error
        operation: Name of the async operation that failed
        cause: Original exception that caused this error
    """
    
    def __init__(
        self,
        message: str,
        operation: str,
        cause: Optional[Exception] = None
    ) -> None:
        self.message = message
        self.operation = operation
        self.cause = cause
        super().__init__(f"{message} in operation '{operation}'" + 
                        (f": {str(cause)}" if cause else ""))
