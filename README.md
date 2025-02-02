# Repository Analyzer

A powerful knowledge management platform that analyzes GitHub repositories for code quality, documentation, and best practices. The platform extracts key, reusable code sections—termed "business outcomes" or "skills"—which represent important building blocks for future development.

## Current State & Progress

### 1. Core Infrastructure [IN PROGRESS]

- [x] Project structure setup
- [x] FastAPI backend with async support
- [x] Pattern detection service
- [x] Database integration with SQLAlchemy
- [x] Environment configuration
- [x] API endpoint testing
- [ ] Complete API documentation
- [ ] Frontend development

### 2. Pattern Detection Features [IN PROGRESS]

- [x] AST-based code analysis
- [x] Pattern confidence scoring
- [x] Pattern relationship tracking
- [x] Context-aware analysis
- [x] Input validation and error handling
- [ ] Additional pattern support
- [ ] Pattern visualization

## Project Structure

```
backend/
├── src/
│   ├── api/              # API endpoints
│   │   └── v1/
│   │       └── patterns.py   # Pattern detection endpoints
│   ├── services/         # Business logic
│   │   └── pattern_detectors/
│   │       └── advanced_pattern_detector.py
│   ├── models/          # Database models
│   ├── schemas/         # Pydantic schemas
│   │   └── patterns.py  # Pattern API schemas
│   └── core/           # Core functionality
├── tests/              # Test files
├── data/              # Data storage
├── vector_store/      # Vector embeddings
├── repos/            # Cloned repositories
├── outputs/          # Analysis outputs
└── logs/            # Application logs
```

## Technology Stack

### Backend

- Python 3.11
- FastAPI with async support
- SQLAlchemy (Async)
- AST for pattern detection
- Custom pattern matching engine
- Structured JSON logging

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/RepoAnalyzer.git
cd RepoAnalyzer
```

2. Set up the virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database:

```bash
alembic upgrade head
```

6. Start the server:

```bash
python -m uvicorn start_server:app --host 0.0.0.0 --port 9999 --reload
```

## Features

### Pattern Detection

- AST-based code analysis
- Multiple pattern support:
  - Factory Pattern
  - Singleton Pattern
  - Observer Pattern
  - Chain Pattern
- Pattern relationship detection
- Confidence scoring
- Context extraction

### Code Analysis

- Method call tracking
- Dependency analysis
- Complexity calculation
- Internal method tracking

## API Endpoints

### Pattern Analysis

```http
POST /api/v1/patterns/analyze
```

Analyzes code for design patterns.

#### Request Body

```json
{
  "file_path": "path/to/file.py"
}
```

#### Response

```json
{
  "patterns": [
    {
      "name": "factory",
      "confidence": 0.85,
      "line_number": 10,
      "context": {
        "complexity": 3,
        "dependencies": ["module1", "module2"],
        "methods": ["create", "build"],
        "attributes": ["_instance"],
        "related_patterns": ["singleton"]
      }
    }
  ]
}
```

## Logic Flow

### Pattern Detection Flow

1. User selects repository for analysis
2. Backend analyzes:
   - Python files for design patterns
   - Pattern relationships and confidence scoring
3. Frontend displays:
   - Pattern detection results
   - Confidence scores and context

### Code Analysis Flow

1. User selects repository for analysis
2. Backend analyzes:
   - Method calls and dependencies
   - Complexity and internal methods
3. Frontend displays:
   - Code analysis results
   - Complexity metrics and recommendations

## Code Quality Analysis

The code quality analysis service (`src/services/code_quality.py`) provides comprehensive metrics for Python codebases:

### Metrics

1. **Code Quality Score** (0-100)

   - Weighted combination of complexity (30%), maintainability (30%), and documentation (40%)
   - Higher scores indicate better code quality

2. **Complexity Metrics**

   - Cyclomatic complexity per function
   - Overall complexity score based on average complexity
   - Flags functions with complexity > 10 as high-complexity issues

3. **Maintainability Index** (0-100)

   - Based on Halstead Volume, Cyclomatic Complexity, and Lines of Code
   - Scores < 65 are flagged as low maintainability issues

4. **Documentation Score** (0-100)

   - Based on comment-to-code ratio and docstring coverage
   - Includes both inline comments and docstrings
   - Target ratio is configurable (default: 0.1 or 10%)

5. **Duplicate Code Detection**
   - Identifies duplicate code blocks (minimum 3 lines)
   - Normalizes code by removing whitespace and comments
   - Reports line ranges for each duplicate block

### Implementation Notes

1. **Comment Analysis**

   - Uses AST parsing to detect docstrings in functions, classes, and modules
   - Combines docstring count with inline comments for total documentation coverage
   - Handles both single-line and multi-line comments

2. **Duplicate Detection**

   - Uses sliding window approach with normalized code blocks
   - Skips empty lines and comments to focus on actual code duplication
   - Reports both occurrences of each duplicate block

3. **Error Handling**
   - Gracefully handles invalid Python files
   - Reports specific errors for missing files and syntax errors
   - Provides detailed logging for debugging

### Best Practices

1. **Documentation**

   - Add docstrings to all public functions, classes, and modules
   - Maintain a comment ratio of at least 10%
   - Use descriptive variable names to improve code clarity

2. **Code Structure**

   - Keep function complexity below 10
   - Maintain a maintainability index above 65
   - Break down complex functions into smaller, focused units

3. **Code Reuse**
   - Avoid code duplication by extracting common functionality
   - Use inheritance and composition appropriately
   - Create utility functions for repeated operations

### Usage Example

```python
from src.services.code_quality import CodeQualityService

# Create service instance
service = CodeQualityService()

# Analyze repository
metrics = await service.analyze_repository("/path/to/repo")

# Access metrics
print(f"Code Quality Score: {metrics.code_quality_score}")
print(f"Issues Found: {metrics.issues_count}")
print(f"Recommendations: {metrics.recommendations}")
```

## Development

### Running Tests

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/api/v1/test_patterns.py

# Run tests with coverage
python -m pytest --cov=src tests/
```

### Test Structure

```
tests/
├── __init__.py
├── conftest.py          # Shared test fixtures
├── test_app.py          # Test application setup
└── api/
    └── v1/
        └── test_patterns.py  # Pattern API tests
```

### Test Coverage

- API endpoint tests
  - Success scenarios
  - Error handling
  - Input validation
- Pattern detection tests
  - Pattern matching accuracy
  - Confidence scoring
  - Context extraction

### Error Handling

The application implements comprehensive error handling:

1. **Input Validation**

   - File path validation
   - File extension checking
   - Required field validation

2. **Custom Exceptions**

   - `PatternDetectionError`: Pattern analysis failures
   - `FileAccessError`: File access issues
   - Proper error codes and messages

3. **HTTP Status Codes**
   - 200: Successful operation
   - 400: Invalid input or file access error
   - 422: Request validation error
   - 500: Pattern detection or server error

## Contributing

1. Follow code style guidelines
2. Add tests for new functionality
3. Update documentation
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Error Handling

The API implements comprehensive error handling through middleware and custom exceptions:

1. **Validation Errors** (422 Unprocessable Entity)

   - Invalid file type
   - Empty file
   - Missing required headers
   - Malformed CSV
   - Invalid repository URLs
   - Duplicate repository URLs

2. **Not Found Errors** (404 Not Found)

   - Task ID not found
   - Repository not found

3. **Server Errors** (500 Internal Server Error)
   - Database errors
   - External service failures
   - Unexpected exceptions

Error Response Format:

```json
{
  "error": "Error type",
  "detail": "Detailed error message",
  "timestamp": "2025-02-02T19:03:32.186316",
  "request_id": "unique-request-id",
  "correlation_id": "correlation-id"
}
```

### Logging

The system implements structured JSON logging with the following features:

1. **Request Tracking**

   - Each request gets a unique request ID
   - Correlation IDs for tracing related operations
   - Timestamps for all operations

2. **Event Types**

   - `csv_upload_started`: CSV upload initiated
   - `csv_upload_completed`: CSV processing completed
   - `csv_upload_failed`: CSV processing failed
   - `upload_status_check`: Upload status check
   - `upload_status_check_failed`: Status check failed

3. **Log Format**

```json
{
  "event": "event_type",
  "level": "info|error",
  "timestamp": "ISO-8601 timestamp",
  "request_id": "unique-request-id",
  "correlation_id": "correlation-id",
  "data": {
    "task_id": "task-id",
    "filename": "file.csv",
    "total_repositories": 42,
    "error": "error message (if applicable)"
  }
}
```

## Troubleshooting

1. Port already in use:

```bash
# Find and kill the process
lsof -i :9999
kill -9 <PID>
```

2. Database issues:

```bash
# Reset the database
rm backend/data/repoanalyzer.db
# Restart the server - tables will be recreated
```

3. Log inspection:

```bash
# View error logs
tail -f backend/logs/error.log

# View info logs
tail -f backend/logs/info.log
```

## Next Steps

1. **Error Handling Enhancement**

   - Add error handling for all remaining endpoints
   - Implement request validation
   - Add rate limiting
   - Enhance error logging and monitoring

2. **Analysis Features**

   - Implement code quality metrics
   - Add documentation analysis
   - Create best practices extraction
   - Set up cross-repository learning

3. **Frontend Development**
   - Complete repository management UI
   - Implement analysis dashboard
   - Add error handling and loading states
   - Create documentation viewer

## Error Handling Best Practices

Our error handling approach follows several key principles designed to improve debugging, maintainability, and user experience:

#### 1. Custom Exception Hierarchy

```python
# Instead of generic exceptions:
try:
    do_something()
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# We use specific, categorized exceptions:
try:
    do_something()
except DatabaseError as e:
    logger.error("database_operation_failed", error=str(e), exc_info=True)
    raise  # Original exception with context preserved
```

Benefits:

- Clear error categorization (Database, Validation, NotFound, etc.)
- Preserved stack traces for better debugging
- Consistent error handling across the application
- Easier error filtering and monitoring

#### 2. Structured Logging

```python
# Instead of basic string logging:
logger.error(f"Failed to create repository: {str(e)}")

# We use structured logging with context:
logger.error(
    "repository_creation_failed",
    error=str(e),
    error_type="database_error",
    repo_id=repo.id,
    url=repo.url,
    exc_info=True
)
```

Benefits:

- Machine-parseable JSON logs
- Consistent log format across the application
- Rich context for debugging
- Easy log aggregation and analysis
- Better error tracking and metrics

#### 3. Input Validation

```python
# Instead of late validation:
async def create_repository(repo: RepositoryCreate):
    # Error discovered only during database operation
    return await repo_service.create_repository(repo)

# We validate early:
async def create_repository(repo: RepositoryCreate):
    # Validate before any expensive operations
    if not repo.url.startswith(("http://", "https://")):
        raise ValidationError(
            message="Invalid repository URL",
            details={"url": repo.url}
        )
    return await repo_service.create_repository(repo)
```

Benefits:

- Early error detection
- Clear validation messages
- Reduced unnecessary processing
- Better user feedback
- Consistent validation across endpoints

#### 4. Async Database Operations

```python
# Instead of synchronous sessions:
def get_repository(repo_id: str, db: Session):
    return db.query(Repository).filter_by(id=repo_id).first()

# We use async sessions:
async def get_repository(repo_id: str, db: AsyncSession):
    result = await db.execute(
        select(Repository).filter_by(id=repo_id)
    )
    return result.scalar_one_or_none()
```

Benefits:

- Better resource utilization
- Improved application scalability
- Reduced blocking operations
- Better handling of concurrent requests

#### 5. Error Response Structure

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid repository URL",
    "details": {
      "url": "invalid-url",
      "allowed_schemes": ["http", "https"]
    },
    "timestamp": "2025-02-02T18:45:58.269945",
    "request_id": "req-123-abc"
  }
}
```

Benefits:

- Consistent error format
- Detailed error information
- Machine-parseable structure
- Request tracking for debugging
- Clear user feedback

#### 6. Error Documentation

```python
@router.post("/repositories", response_model=Repository)
async def create_repository(repo: RepositoryCreate):
    """Create a new repository for analysis.

    Args:
        repo: Repository creation data

    Returns:
        Created repository

    Raises:
        ValidationError: If repository URL is invalid
        RepositoryError: If repository already exists
        DatabaseError: If database operation fails
    """
```

Benefits:

- Clear documentation of possible errors
- Better API understanding
- Easier client-side error handling
- Improved maintainability
- Better developer experience

### Error Handling Flow

1. **Validation Layer** (First Defense)

   - Schema validation (Pydantic)
   - Business rule validation
   - Early error detection

2. **Service Layer** (Business Logic)

   - Domain-specific validation
   - Business operation errors
   - External service errors

3. **Data Layer** (Storage)

   - Database operation errors
   - Constraint violations
   - Connection issues

4. **Global Error Handlers**
   - Consistent error formatting
   - Error logging
   - Client response generation

### Monitoring and Debugging

- Each error is logged with:

  - Unique request ID
  - Timestamp
  - Error category
  - Stack trace
  - Request context
  - User context (if applicable)

- Error metrics are tracked for:
  - Error rates by category
  - Error rates by endpoint
  - Response times
  - Failed operations

### Future Improvements

- [ ] Add error rate alerting
- [ ] Implement retry mechanisms for transient failures
- [ ] Add circuit breakers for external services
- [ ] Enhance error reporting dashboard
- [ ] Add error correlation across services
