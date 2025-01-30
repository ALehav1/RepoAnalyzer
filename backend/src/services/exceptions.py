"""Custom exceptions for the repository analyzer service.

This module contains custom exceptions used throughout the repository analyzer
to provide more specific error handling and better error messages.
"""

class RepositoryAnalyzerError(Exception):
    """Base exception for all repository analyzer errors.
    
    All custom exceptions in this module inherit from this base class,
    allowing for catching any repository analyzer specific error.
    
    Example:
        try:
            result = analyzer.analyze_repository(url)
        except RepositoryAnalyzerError as e:
            logger.error(f"Analysis failed: {str(e)}")
    """
    pass

class InvalidRepositoryURLError(RepositoryAnalyzerError):
    """Raised when a repository URL is invalid.
    
    This exception is raised when:
    - The URL does not follow the expected GitHub format
    - The URL is missing required components (owner/repo)
    - The URL contains invalid characters
    
    Example:
        try:
            repo_path = analyzer.clone_or_pull_repo("invalid-url")
        except InvalidRepositoryURLError as e:
            logger.error(f"Invalid URL provided: {str(e)}")
    """
    pass

class RepositoryNotFoundError(RepositoryAnalyzerError):
    """Raised when a repository cannot be found.
    
    This exception is raised when:
    - The repository does not exist on GitHub
    - The user does not have access to the repository
    - The repository has been deleted or moved
    
    Example:
        try:
            repo_info = await github_service.get_repo_info("user/nonexistent-repo")
        except RepositoryNotFoundError as e:
            logger.error(f"Repository not found: {str(e)}")
    """
    pass

class GitOperationError(RepositoryAnalyzerError):
    """Raised when a Git operation fails.
    
    This exception is raised when:
    - Git clone/pull operations fail
    - Authentication errors occur
    - Network issues prevent Git operations
    - File system issues prevent Git operations
    
    Example:
        try:
            await analyzer.clone_or_pull_repo(url)
        except GitOperationError as e:
            logger.error(f"Git operation failed: {str(e)}")
    """
    pass

class AnalysisError(RepositoryAnalyzerError):
    """Raised when repository analysis fails.
    
    This exception is raised when:
    - GitHub API requests fail
    - File analysis encounters errors
    - Cache operations fail
    - Any other analysis-related operation fails
    
    Example:
        try:
            result = await analyzer.analyze_repository(url)
        except AnalysisError as e:
            logger.error(f"Analysis failed: {str(e)}")
    """
    pass
