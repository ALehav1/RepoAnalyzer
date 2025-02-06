# Repository Analyzer

A powerful knowledge management platform that analyzes GitHub repositories for code quality, documentation, and best practices. The platform extracts key, reusable code sections—termed "business outcomes" or "skills"—which represent important building blocks for future development.

## Version and Release Notes

Current Version: 0.1.0

### Latest Changes (2025-02-06)

- Fixed Frontend Issues:
  - Resolved duplicate Router components for proper React Router setup
  - Added ToastProvider for notification system
  - Updated environment variable handling with Vite
  - Improved component exports consistency
  - Enhanced error handling with ErrorBoundary
- Enhanced API Integration Tests:
  - Added comprehensive schema validation tests
  - Improved async operation handling with proper 202 status codes
  - Standardized error response format
  - Added test coverage for error cases
- Enhanced VectorStore component:
  - Improved metadata filtering with exact matching
  - Added robust collection cleanup between operations
  - Fixed duplicate chunk handling
  - Added comprehensive test coverage
  - Improved error handling and logging
- Implemented robust database initialization with SQLAlchemy
- Added core analysis components:
  - `CodeChunker`: Splits code into meaningful chunks with metadata
  - `CodeAnalyzer`: Analyzes code chunks for quality, complexity, and security
  - `VectorStore`: Stores and retrieves code chunks using vector embeddings
- Added comprehensive test suite for all components

### API Endpoints

The API provides the following endpoints:

#### Analysis

- `POST /api/analysis/analyze`

  - Start repository analysis
  - Request body: `{ "repo_path": string, "analysis_types": string[] }`
  - Returns:
    - 202 Accepted if analysis started successfully
    - 400 Bad Request if repository path is invalid
    - Response format: `{ "status": "accepted", "message": string }` or `{ "error": string }`

- `GET /api/analysis/status/{task_id}`
  - Get analysis task status
  - Returns:
    - 200 OK with task status and results if available
    - 404 Not Found if task doesn't exist
    - Response format: `{ "task_id": string, "status": string, "progress": number, "results"?: object, "error"?: string }`

### Environment Setup

The project uses environment variables for configuration. Both frontend and backend have their own `.env` files:

#### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1

# Feature Flags (true/false)
VITE_ENABLE_CODE_QUALITY=true
VITE_ENABLE_DOCUMENTATION=true
VITE_ENABLE_BEST_PRACTICES=true
VITE_ENABLE_DEPENDENCY_GRAPH=true
VITE_ENABLE_CHAT=true

# UI Configuration
VITE_MAX_CHAT_MESSAGES=100
VITE_CODE_PREVIEW_MAX_LINES=50

# Analysis Configuration
VITE_ANALYSIS_POLL_INTERVAL=1000
VITE_MAX_FILE_SIZE=5242880  # 5MB in bytes
```

#### Backend (.env)

```env
# Database Configuration
DATABASE_URL=sqlite+aiosqlite:///./data/repo_analyzer.db

# Backend Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
LOG_LEVEL=DEBUG

# Directory Configuration
VECTOR_STORE_DIR=vector_store
REPOS_DIR=repos
OUTPUT_DIR=outputs
```

Copy the contents from `.env.example` to `.env` in both frontend and backend directories and adjust values as needed.

### Component Structure

```
backend/
├── src/
│   ├── api/              # FastAPI endpoints
│   ├── analysis/         # Code analysis components
│   │   ├── analyzer.py   # Code quality analysis
│   │   └── chunker.py    # Code chunking logic
│   ├── storage/          # Data persistence
│   │   └── vector_store.py  # Vector-based code storage
│   ├── models/          # SQLAlchemy models
│   └── database.py      # Database configuration
├── tests/              # Test suite
│   └── test_components.py  # Component tests
└── data/              # Database and file storage
    └── repo_analyzer.db   # SQLite database
```

#### Frontend Components

- `App.tsx`: Main application component with routing and providers
  - `ThemeProvider`: Manages application theme
  - `ToastProvider`: Handles notification system
  - `ErrorBoundary`: Catches and handles React errors
  - `AppShell`: Main layout component
    - `Header`: Navigation and branding
    - `RepositoryInput`: Repository URL input and validation
    - `AnalysisView`: Shows analysis results
      - `CodeQualityView`: Code quality metrics
      - `DocumentationView`: Documentation analysis
      - `BestPracticesView`: Best practices evaluation
      - `DependencyGraph`: Package dependencies visualization

### Database Schema

1. **Repository**

   - Stores repository metadata
   - Fields:
     - id: UUID primary key
     - name: Repository name
     - owner: Repository owner
     - url: Repository URL
     - created_at: Timestamp
     - updated_at: Timestamp

2. **CodeChunk**

   - Stores code segments with metadata
   - Fields:
     - id: UUID primary key
     - content: Code content
     - file_path: Path to source file
     - start_line: Starting line number
     - end_line: Ending line number
     - language: Programming language
     - repository_id: Foreign key to Repository
     - metadata: JSONB field for additional metadata
     - created_at: Timestamp
     - updated_at: Timestamp

3. **AnalysisResult**
   - Stores code analysis results
   - Fields:
     - id: UUID primary key
     - analysis_type: Type of analysis
     - score: Analysis score
     - details: JSONB field for detailed results
     - repository_id: Foreign key to Repository
     - created_at: Timestamp
     - updated_at: Timestamp

### Core Components

1. **CodeChunker**

   - Splits code files into logical chunks
   - Extracts metadata (file path, line numbers, size)
   - Handles multiple programming languages

2. **CodeAnalyzer**

   - Analyzes code quality metrics:
     - Complexity (cyclomatic, nested functions)
     - Quality (documentation, naming)
     - Security (unsafe patterns)
     - Performance metrics
   - Async processing for better performance

3. **VectorStore**
   - Stores code chunks with vector embeddings using ChromaDB
   - Enables semantic code search with metadata filtering
   - Supports:
     - Exact metadata matching with `$eq` operator
     - Batch operations for multiple chunks
     - Duplicate chunk ID handling
     - Collection cleanup and reset
   - Efficient similarity matching
   - Uses cosine similarity for vector comparisons
   - Comprehensive error handling and logging
   - Proper async/await support
   - Test isolation with collection cleanup

### Code Analysis Features

### Documentation Analysis

The documentation analyzer evaluates:

- Documentation coverage for modules, classes, and functions
- Type hint usage and coverage
- Code examples in docstrings
- README.md completeness
- API documentation quality
- TODO comments tracking

### Best Practices Analysis

The best practices analyzer detects and evaluates:

#### Design Patterns

- Factory Pattern
- Singleton Pattern
- Observer Pattern
- Strategy Pattern
- Decorator Pattern
- Adapter Pattern
- Command Pattern
- Composite Pattern
- Facade Pattern

#### Performance Patterns

- Caching
- Lazy Loading
- Connection Pooling
- Batch Processing
- Async I/O

#### Security Patterns

- Input Validation
- Authentication
- Authorization
- Encryption
- Rate Limiting

#### Maintainability Patterns

- Dependency Injection
- Repository Pattern
- Unit of Work Pattern
- Specification Pattern
- Service Layer Pattern

### Testing

The backend includes comprehensive tests:

- Unit tests for each component
- Integration tests for database operations
- Async test support with pytest-asyncio
- Proper test database isolation
- VectorStore specific tests:
  - Metadata filtering
  - Batch operations
  - Duplicate chunk handling
  - Empty query handling
  - Collection cleanup

### Development Setup

1. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up the database:

```bash
python -m src.database
```

4. Run tests:

```bash
python -m pytest
```
