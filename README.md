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

## Features

### Pattern Detection
The application now includes a powerful pattern detection feature that analyzes Python code for common design patterns:

1. **Pattern Analysis**
   - AST-based code analysis
   - Multiple pattern support (Factory, Singleton, Observer, Chain)
   - Pattern relationship detection
   - Confidence scoring
   - Context extraction

2. **Interactive UI**
   - File tree navigation with Python file highlighting
   - Real-time pattern analysis
   - Visual pattern display with confidence scores
   - Detailed context information
   - Error handling and validation

3. **Pattern Context**
   - Code complexity metrics
   - Method dependencies
   - Related patterns
   - Method and attribute analysis

### Code Analysis
- Method call tracking
- Dependency analysis
- Complexity calculation
- Internal method tracking

## API Endpoints

### Pattern Analysis

#### Analyze Patterns
```http
POST /api/v1/patterns/analyze
```

Analyzes Python files for design patterns using advanced AST analysis.

##### Request Body
```json
{
  "file_path": "/path/to/file.py"
}
```

##### Response
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
        "related_patterns": ["builder", "abstract_factory"]
      }
    }
  ]
}
```

##### Supported Patterns
1. Factory Pattern
   - Detects factory method implementations
   - Identifies dynamic object creation
   - Confidence based on method names and return types

2. Singleton Pattern
   - Identifies instance management
   - Detects get_instance methods
   - Checks for private instance variables

3. Observer Pattern
   - Detects observer registration
   - Identifies notification methods
   - Analyzes observer relationships

4. Strategy Pattern
   - Identifies strategy interfaces
   - Detects concrete strategy implementations
   - Analyzes context relationships

5. Decorator Pattern
   - Detects component wrapping
   - Identifies inheritance relationships
   - Analyzes method delegation

6. Command Pattern
   - Identifies command interfaces
   - Detects concrete command implementations
   - Analyzes receiver relationships

##### Error Responses
- `400 Bad Request`: Invalid request format
- `404 Not Found`: File not found
- `422 Unprocessable Entity`: Invalid file path or syntax error
- `500 Internal Server Error`: Analysis failure

##### Pattern Context
Each detected pattern includes:
1. Complexity metrics
   - Cyclomatic complexity
   - Method count
   - Dependency count

2. Dependencies
   - External module imports
   - Internal class dependencies
   - Related modules

3. Methods
   - Method signatures
   - Method relationships
   - Implementation details

4. Related Patterns
   - Common pattern combinations
   - Alternative implementations
   - Design considerations

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- SQLite 3

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/RepoAnalyzer.git
cd RepoAnalyzer
```

2. Backend Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
```

3. Frontend Setup:
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
```

### Database Setup

The application uses SQLite as its database. The database file is located at:
```
backend/data/repo_analyzer.db
```

To initialize the database:
```bash
cd backend
alembic upgrade head
```

### Configuration Files

#### Backend (.env)
```env
# API Keys
OPENAI_API_KEY=your_openai_key
GITHUB_TOKEN=your_github_token

# Server Configuration
HOST=0.0.0.0
PORT=3000
DEBUG=False
LOG_LEVEL=INFO

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/repo_analyzer.db

# Directories
OUTPUT_DIR=outputs
VECTOR_STORE_DIR=vector_store
REPOS_DIR=repos
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:3000
```

## Project Structure

### Backend Structure
```
backend/
├── alembic/                    # Database migrations
├── src/                        # Source code
│   ├── api/                    # API endpoints and routes
│   │   ├── routes/            # Route handlers
│   │   └── middleware/        # API middleware (error handling, metrics)
│   ├── core/                  # Core functionality
│   │   ├── config.py         # Configuration management
│   │   └── logging.py        # Logging configuration
│   ├── models/               # Database models
│   ├── schemas/              # Pydantic schemas
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── tests/                   # Test files (mirrors src structure)
└── data/                    # Data storage
    └── repo_analyzer.db    # SQLite database
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Layout/         # Layout components
│   │   │   └── ErrorBoundary.tsx  # Global error handling
│   │   └── common/         # Shared components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── App.tsx             # Root component
```

## Project Organization and Conventions

### File Organization

1. **Component Structure**
   - Components are organized by feature/domain in the `src/components` directory
   - Shared components go in `src/components/shared`
   - Layout components go in `src/components/layout`
   - Feature-specific components go in their respective feature directories (e.g., `src/components/analysis`)

2. **File Naming Conventions**
   - Use PascalCase for component files (e.g., `ErrorBoundary.tsx`, `FileExplorer.tsx`)
   - Use kebab-case for utility files (e.g., `api-client.ts`)
   - Test files should match their component name with `.test` suffix (e.g., `ErrorBoundary.test.tsx`)
   - Avoid duplicate files with different casing (e.g., NO `file-tree.tsx` AND `FileTree.tsx`)

3. **Component Organization**
   ```
   src/
   ├── components/
   │   ├── shared/           # Shared components (ErrorBoundary, Loading, etc.)
   │   ├── layout/          # Layout components (Navbar, Sidebar, etc.)
   │   ├── analysis/        # Analysis feature components
   │   │   ├── FileExplorer.tsx
   │   │   └── AnalysisCharts.tsx
   │   └── repo/           # Repository feature components
   │       ├── CodeViewer.tsx
   │       └── RepoCard.tsx
   ├── pages/              # Page components
   ├── hooks/              # Custom hooks
   ├── utils/              # Utility functions
   └── api/                # API client and types
   ```

4. **Component Locations**
   - `ErrorBoundary`: `src/components/shared/ErrorBoundary.tsx`
   - `FileExplorer`: `src/components/analysis/FileExplorer.tsx`
   - `CodeViewer`: `src/components/repo/CodeViewer.tsx`
   - `AnalysisCharts`: `src/components/analysis/AnalysisCharts.tsx`

### Component Guidelines

1. **Component Naming**
   - Use PascalCase for component names
   - Be descriptive and specific (e.g., `RepositoryAnalysisChart` instead of just `Chart`)
   - Prefix test files with component name (e.g., `FileExplorer.test.tsx`)

2. **File Structure**
   - One component per file (except for small, tightly coupled helper components)
   - Export components as named exports (except for default page components)
   - Keep components focused and single-responsibility

3. **Import Organization**
   - Group imports by type (React, third-party, internal)
   - Use absolute imports for project files
   - Maintain consistent import ordering

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- SQLite 3

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/RepoAnalyzer.git
cd RepoAnalyzer
```

2. Backend Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
```

3. Frontend Setup:
```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
```

### Database Setup

The application uses SQLite as its database. The database file is located at:
```
backend/data/repo_analyzer.db
```

To initialize the database:
```bash
cd backend
alembic upgrade head
```

### Configuration Files

#### Backend (.env)
```env
# API Keys
OPENAI_API_KEY=your_openai_key
GITHUB_TOKEN=your_github_token

# Server Configuration
HOST=0.0.0.0
PORT=3000
DEBUG=False
LOG_LEVEL=INFO

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/repo_analyzer.db

# Directories
OUTPUT_DIR=outputs
VECTOR_STORE_DIR=vector_store
REPOS_DIR=repos
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:3000
```

## Project Structure

### Backend Structure
```
backend/
├── alembic/                    # Database migrations
├── src/                        # Source code
│   ├── api/                    # API endpoints and routes
│   │   ├── routes/            # Route handlers
│   │   └── middleware/        # API middleware (error handling, metrics)
│   ├── core/                  # Core functionality
│   │   ├── config.py         # Configuration management
│   │   └── logging.py        # Logging configuration
│   ├── models/               # Database models
│   ├── schemas/              # Pydantic schemas
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── tests/                   # Test files (mirrors src structure)
└── data/                    # Data storage
    └── repo_analyzer.db    # SQLite database
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Layout/         # Layout components
│   │   │   └── ErrorBoundary.tsx  # Global error handling
│   │   └── common/         # Shared components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── App.tsx             # Root component
```

## Development Guidelines

### File Organization
1. **Backend**:
   - All source code must be in the `src/` directory
   - Follow the established directory structure
   - Keep one error handler in `src/api/middleware/`
   - Place all database files in `data/`

2. **Frontend**:
   - Components go in `src/components/`
   - Shared components in `src/components/common/`
   - Layout components in `src/components/Layout/`
   - One ErrorBoundary implementation in `Layout/`

### Code Style
1. **Python**:
   - Follow PEP 8
   - Use type hints
   - Document all public functions and classes
   - Use async/await consistently

2. **TypeScript/React**:
   - Use functional components
   - Implement proper error boundaries
   - Use TypeScript types/interfaces

### Testing
1. **Backend Tests**:
   - Mirror the `src/` directory structure in `tests/`
   - Use pytest for testing
   - Write unit tests for all new features

2. **Frontend Tests**:
   - Use React Testing Library
   - Write component tests
   - Test error boundaries

## API Endpoints

### Files and Code

##### GET /repos/{id}/files
Get repository file structure.

Query Parameters:
- `path`: string (optional, defaults to root)
- `depth`: int (optional, defaults to 1)

Response:
```json
{
  "files": [
    {
      "name": "string",
      "path": "string",
      "type": "file|directory",
      "size": 0,
      "lastModified": "2025-02-03T12:59:01Z",
      "children": []
    }
  ]
}
```

##### GET /repos/{id}/file-content
Get file content.

Query Parameters:
- `path`: string (required)
- `highlight`: boolean (optional, syntax highlighting)
- `lines`: string (optional, e.g., "1-100")

Response:
```json
{
  "content": "string",
  "language": "string",
  "lines": {
    "start": 0,
    "end": 0
  }
}
```

#### Analysis

##### POST /repos/{id}/analyze/patterns
Analyze specific patterns.

Request:
```json
{
  "patterns": ["Factory", "Singleton"],
  "files": ["src/**/*.ts"]
}
```

Response:
```json
{
  "taskId": "string",
  "status": "pending"
}
```

##### GET /repos/{id}/analyze/status/{taskId}
Get analysis task status.

Response:
```json
{
  "status": "pending|running|completed|failed",
  "progress": 0,
  "message": "string",
  "result": {}
}
```

#### Metrics

##### GET /repos/{id}/metrics/history
Get historical metrics.

Query Parameters:
- `from`: string (ISO date)
- `to`: string (ISO date)
- `metrics`: string[] (comma-separated)

Response:
```json
{
  "metrics": [
    {
      "date": "2025-02-03T12:59:01Z",
      "values": {
        "complexity": 75,
        "maintainability": 85
      }
    }
  ]
}
```

##### POST /repos/{id}/metrics/custom
Calculate custom metrics.

Request:
```json
{
  "metrics": [
    {
      "name": "string",
      "rule": "string",
      "threshold": 0
    }
  ]
}
```

## Project Structure

### Backend Structure
```
backend/
├── alembic/                    # Database migrations
├── src/                        # Source code
│   ├── api/                    # API endpoints and routes
│   │   ├── routes/            # Route handlers
│   │   └── middleware/        # API middleware (error handling, metrics)
│   ├── core/                  # Core functionality
│   │   ├── config.py         # Configuration management
│   │   └── logging.py        # Logging configuration
│   ├── models/               # Database models
│   ├── schemas/              # Pydantic schemas
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── tests/                   # Test files (mirrors src structure)
└── data/                    # Data storage
    └── repo_analyzer.db    # SQLite database
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Layout/         # Layout components
│   │   │   └── ErrorBoundary.tsx  # Global error handling
│   │   └── common/         # Shared components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── App.tsx             # Root component
```

## Deployment Guide

### Prerequisites
- Docker 24.0+
- Docker Compose 2.20+
- Node.js 18+ (for build)
- Python 3.11+ (for build)
- PostgreSQL 14+ (production database)
- Redis 7+ (production cache)
- Nginx 1.24+ (reverse proxy)

### Local Deployment

#### Using Docker Compose
1. Build images:
   ```bash
   docker compose build
   ```

2. Start services:
   ```bash
   docker compose up -d
   ```

3. Initialize database:
   ```bash
   docker compose exec backend alembic upgrade head
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:8000
   - Swagger UI: http://localhost:8000/docs

### Production Deployment

#### 1. Infrastructure Setup

##### A. Server Requirements
- 4 CPU cores minimum
- 8GB RAM minimum
- 50GB SSD storage
- Ubuntu 22.04 LTS

##### B. Domain and SSL
1. Configure DNS:
   ```bash
   # Add A records
   repoanalyzer.com.     IN A    your_server_ip
   api.repoanalyzer.com. IN A    your_server_ip
   ```

2. Install Certbot:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d repoanalyzer.com -d api.repoanalyzer.com
   ```

#### 2. Application Setup

##### A. Clone and Configure
```bash
# Clone repository
git clone https://github.com/yourusername/repoanalyzer.git
cd repoanalyzer

# Create production environment files
cp .env.example .env
cp backend/.env.example backend/.env
```

##### B. Build Frontend
```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Output will be in dist/
```

##### C. Setup Backend
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Initialize database
cd backend
alembic upgrade head
```

#### 3. Docker Deployment

##### A. Build Images
```bash
# Build production images
docker build -f Dockerfile.prod -t repoanalyzer-api:prod ./backend
docker build -f Dockerfile.prod -t repoanalyzer-frontend:prod .
```

##### B. Configure Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: repoanalyzer-frontend:prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - repoanalyzer-net

  api:
    image: repoanalyzer-api:prod
    restart: unless-stopped
    environment:
      - ENVIRONMENT=production
    depends_on:
      - postgres
      - redis
    networks:
      - repoanalyzer-net

  postgres:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - repoanalyzer-net

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - repoanalyzer-net

  nginx:
    image: nginx:1.24-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./certbot/conf:/etc/letsencrypt
    depends_on:
      - frontend
      - api
    networks:
      - repoanalyzer-net

networks:
  repoanalyzer-net:

volumes:
  postgres_data:
  redis_data:
```

##### C. Configure Nginx
```nginx
# nginx/conf.d/default.conf
server {
    listen 80;
    server_name repoanalyzer.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name repoanalyzer.com;

    ssl_certificate /etc/letsencrypt/live/repoanalyzer.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/repoanalyzer.com/privkey.pem;

    location / {
        proxy_pass http://frontend:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://api:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 4. Deployment Steps

1. Push code and build:
   ```bash
   # On local machine
   git push origin main
   ```

2. On production server:
   ```bash
   # Pull latest changes
   git pull origin main

   # Build and start services
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d

   # Apply database migrations
   docker compose -f docker-compose.prod.yml exec api alembic upgrade head
   ```

#### 5. Monitoring and Maintenance

##### A. Logging
```bash
# View service logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f api
```

##### B. Backup
```bash
# Backup database
docker compose -f docker-compose.prod.yml exec postgres \
    pg_dump -U postgres repo_analyzer > backup.sql

# Backup Redis
docker compose -f docker-compose.prod.yml exec redis \
    redis-cli save
```

##### C. Health Checks
```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# Check API health
curl https://api.repoanalyzer.com/health

# Check metrics
curl https://api.repoanalyzer.com/metrics
```

#### 6. Scaling

##### A. Horizontal Scaling
```bash
# Scale API instances
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Update Nginx config for load balancing
upstream api {
    server api:8000;
    server api:8001;
    server api:8002;
}
```

##### B. Resource Limits
```yaml
# Update service resources in docker-compose.prod.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### 7. Rollback Procedure

1. Tag releases:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Rollback to previous version:
   ```bash
   # Get previous version
   git checkout v0.9.0

   # Rebuild and restart
   docker compose -f docker-compose.prod.yml down
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d

   # Rollback database if needed
   docker compose -f docker-compose.prod.yml exec api \
       alembic downgrade -1
   ```

## Configuration

### Environment Variables

#### Backend (.env)
```bash
# Server
PORT=8000
HOST=0.0.0.0
DEBUG=True
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/repo_analyzer
ASYNC_DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/repo_analyzer

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_MAX_CONNECTIONS=10

# GitHub
GITHUB_TOKEN=your_token_here
GITHUB_API_URL=https://api.github.com

# AI Services
OPENAI_API_KEY=your_key_here
MODEL_NAME=gpt-4-1106-preview

# Security
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:5173"]
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_GITHUB_CLIENT_ID=your_client_id
VITE_ENABLE_MOCK_API=false
VITE_ENABLE_DEBUG=true
```

### Configuration Files

#### ESLint (.eslintrc.json)
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["@typescript-eslint", "react-hooks"],
  "rules": {
    "no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "react-hooks/rules-of-hooks": "error"
  }
}
```

#### Prettier (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### Jest (jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
```

## API Documentation

### Authentication

#### POST /auth/login
Login with GitHub credentials.

Request:
```json
{
  "code": "github_oauth_code"
}
```

Response:
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

### Repositories

#### GET /repos
List analyzed repositories.

Query Parameters:
- `page`: int (default: 1)
- `limit`: int (default: 10)
- `sort`: string (stars|date|name)
- `order`: string (asc|desc)

Response:
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "url": "string",
      "description": "string",
      "stars": 0,
      "forks": 0,
      "lastAnalyzed": "2025-02-03T12:57:53Z",
      "status": "success"
    }
  ],
  "total": 0,
  "page": 1,
  "pages": 1
}
```

#### POST /repos/analyze
Analyze a new repository.

Request:
```json
{
  "url": "https://github.com/user/repo"
}
```

Response:
```json
{
  "id": "string",
  "status": "pending"
}
```

#### GET /repos/{id}/metrics
Get repository metrics.

Response:
```json
{
  "complexity": {
    "score": 75,
    "details": {
      "cyclomatic": 10,
      "cognitive": 15
    }
  },
  "maintainability": {
    "score": 85,
    "factors": {
      "documentation": 80,
      "testCoverage": 90
    }
  },
  "dependencies": [
    {
      "name": "string",
      "version": "string",
      "usageCount": 0
    }
  ],
  "languages": [
    {
      "name": "string",
      "percentage": 0
    }
  ]
}
```

#### GET /repos/{id}/patterns
Get detected patterns.

Response:
```json
{
  "patterns": [
    {
      "name": "string",
      "type": "string",
      "confidence": 0,
      "locations": [
        {
          "file": "string",
          "lineStart": 0,
          "lineEnd": 0
        }
      ]
    }
  ]
}
```

### Best Practices

#### GET /patterns
List available patterns.

Query Parameters:
- `category`: string
- `search`: string
- `page`: int
- `limit`: int

Response:
```json
{
  "items": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "description": "string",
      "example": "string",
      "pros": ["string"],
      "cons": ["string"]
    }
  ],
  "total": 0,
  "page": 1,
  "pages": 1
}
```

### Chat

#### POST /chat
Send a message to the AI assistant.

Request:
```json
{
  "message": "string",
  "context": {
    "repoId": "string",
    "file": "string"
  }
}
```

Response:
```json
{
  "response": "string",
  "codeBlocks": [
    {
      "language": "string",
      "code": "string"
    }
  ],
  "references": [
    {
      "file": "string",
      "lineStart": 0,
      "lineEnd": 0
    }
  ]
}
```

## Logic Flow Diagrams

### Repository Analysis Flow
```mermaid
graph TD
    A[User submits repo URL] --> B[Validate URL]
    B --> C{Valid?}
    C -->|Yes| D[Clone Repository]
    C -->|No| E[Return Error]
    D --> F[Extract Metadata]
    F --> G[Parse Code]
    G --> H[Analyze Patterns]
    H --> I[Generate Metrics]
    I --> J[Store Results]
    J --> K[Return Analysis ID]
```

### Pattern Detection Flow
```mermaid
graph TD
    A[Load Source Code] --> B[Parse AST]
    B --> C[Extract Patterns]
    C --> D{Pattern Type}
    D -->|Structural| E[AST Analysis]
    D -->|Semantic| F[NLP Analysis]
    D -->|Behavioral| G[Flow Analysis]
    E --> H[Pattern Matching]
    F --> H
    G --> H
    H --> I[Calculate Confidence]
    I --> J[Generate Report]
```

### Chat Interaction Flow
```mermaid
graph TD
    A[User Query] --> B[Context Collection]
    B --> C[Query Processing]
    C --> D[Code Search]
    D --> E[Pattern Lookup]
    E --> F[Response Generation]
    F --> G[Code Block Formatting]
    G --> H[Send Response]
    H --> I[Update Context]
```

### Data Flow
```mermaid
graph TD
    A[Frontend] -->|HTTP/WS| B[API Gateway]
    B --> C[FastAPI Backend]
    C -->|Read/Write| D[(PostgreSQL)]
    C -->|Cache| E[(Redis)]
    C -->|Clone| F[Git Repos]
    C -->|Analyze| G[Pattern Engine]
    G -->|Detect| H[Code Patterns]
    G -->|Generate| I[Metrics]
    C -->|Query| J[OpenAI API]
```

## Frontend Implementation Progress

### Current Status (2025-02-03)

#### 1. Core Setup
- Project structure with Vite and TypeScript
- Mantine UI integration for modern, accessible components
- React Query for efficient data fetching
- Dark/light theme support
- Responsive navigation
- API integration layer

#### 2. File Structure
```
frontend/
├── src/
│   ├── api/          # API integration
│   │   └── repoApi.ts # Repository API client
│   ├── components/   
│   │   ├── layout/   # Layout components
│   │   ├── repo/     # Repository components
│   │   ├── analysis/ # Analysis visualizations
│   │   └── chat/     # Chat interface
│   ├── pages/        # Page components
│   ├── services/     # Business logic
│   └── types/        # TypeScript interfaces
```

#### 3. Key Components Implemented
- `App.tsx`: Main application layout with routing
- `theme.ts`: Global theme configuration
- `AppNavbar.tsx`: Navigation component with theme toggle
- `HomePage.tsx`: Repository analysis and bulk upload
- `SavedReposPage.tsx`: Repository listing with search/filter
- `RepoDetailPage.tsx`: Detailed repository analysis
- `BestPracticesPage.tsx`: Design patterns and best practices
- `RepoCard.tsx`: Repository card component
- `FileExplorer.tsx`: File tree navigation
- `CodeViewer.tsx`: Code display with syntax highlighting
- `AnalysisCharts.tsx`: Analysis visualizations
- `AIChatInterface.tsx`: AI chat interface

#### 4. Features Implemented
- Repository Management:
  - Single repository submission
  - Bulk CSV upload
  - Repository listing with search, sort, and filter
  - Detailed repository view

- Code Analysis:
  - File explorer with syntax highlighting
  - Code quality metrics visualization
  - Language distribution charts
  - Dependency analysis
  - Pattern detection

- Best Practices:
  - Design pattern catalog
  - Implementation examples
  - Usage guidelines
  - Searchable patterns

- AI Integration:
  - Chat interface
  - Code-aware responses
  - Syntax highlighting in responses

#### 5. API Integration
- Repository analysis endpoints
- File content fetching
- Analysis results
- Chat functionality
- Error handling
- TypeScript interfaces

#### 6. Next Steps
1. Testing:
   - Unit tests for components
   - Integration tests
   - End-to-end tests

2. Performance:
   - Code splitting
   - Lazy loading
   - Caching strategies

3. Documentation:
   - API documentation
   - Component documentation
   - Setup guide

## Project Structure

```
RepoAnalyzer/
├── backend/                 # FastAPI backend
│   ├── src/                # Main backend source code
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── schemas/        # Pydantic schemas
│   ├── tests/              # Backend tests
│   ├── alembic/            # Database migrations
│   ├── scripts/            # Utility scripts
│   ├── middleware/         # Custom middleware
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # Frontend services
│   │   └── types/         # TypeScript types
│   └── __tests__/         # Frontend tests
├── cypress/                # E2E tests
│   ├── e2e/               # Test specs
│   └── fixtures/          # Test data
├── docs/                   # Documentation
├── rules/                  # Analysis rules
└── data/                  # Data storage
```

## Setup and Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis (for caching)

### Backend Setup
1. Create virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # For development
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize database:
   ```bash
   alembic upgrade head
   ```

5. Start the server:
   ```bash
   python start_server.py
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Development Tools

### Code Quality
- ESLint
- Prettier
- Black (Python)
- isort (Python)
- Husky (pre-commit hooks)

### Testing
- Jest + React Testing Library
- Cypress
- pytest
- jest-axe (accessibility)
- Lighthouse CI

### Monitoring
- Prometheus
- Logging (repo_analyzer.log)

### Database
- PostgreSQL
- SQLAlchemy ORM
- Alembic migrations

### Caching
- Redis
- React Query

## Scripts

### Backend
```bash
# Run tests
pytest

# Run with auto-reload
python start_server.py --reload

# Generate migrations
alembic revision --autogenerate -m "description"
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test
npm run test:watch
npm run test:coverage
npm run cypress:open
npm run cypress:run
npm run test:perf
npm run lighthouse

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

## Testing Implementation

### 1. Unit Tests
Located in `frontend/src/__tests__/`
- Component testing using React Testing Library
- Tests for:
  - AnalysisCharts component
  - AIChatInterface component
  - UI interactions
  - Component rendering
  - Error scenarios
  - User input validation

### 2. Performance Testing
Located in `frontend/src/__tests__/performance/`
- Load time measurements:
  - Repository list loading
  - Metrics data loading
  - File tree loading
- Memory usage tracking:
  - Heap size monitoring
  - Large repository handling
- Lighthouse CI integration:
  - First Contentful Paint
  - Largest Contentful Paint
  - Cumulative Layout Shift
  - Total Blocking Time

### 3. Accessibility Testing
Located in `frontend/src/__tests__/accessibility/`
- WCAG Compliance:
  - Color contrast
  - Keyboard navigation
  - Screen reader support
  - ARIA labels
- Automated testing:
  - jest-axe integration
  - Heading hierarchy
  - Tab order
  - Interactive elements

### 4. API Contract Testing
Located in `frontend/src/__tests__/api/`
- Endpoint testing:
  - GET /repos
  - GET /repos/:id/metrics
  - POST /repos/analyze
- Response validation:
  - Data shape verification
  - Error handling
  - Required fields
- Mock Service Worker:
  - Request interception
  - Response mocking
  - Error simulation

### Test Files Structure
```
frontend/
├── src/
│   └── __tests__/
│       ├── components/
│       │   ├── analysis/
│       │   │   └── AnalysisCharts.test.tsx
│       │   └── chat/
│       │       └── AIChatInterface.test.tsx
│       ├── performance/
│       │   └── performance.test.ts
│       ├── accessibility/
│       │   └── accessibility.test.tsx
│       └── api/
│           └── contract.test.ts
├── cypress/
│   ├── e2e/
│   │   └── repo-analyzer.cy.ts
│   └── fixtures/
│       ├── repositories.json
│       └── metrics.json
```

### Running Tests
1. Unit & Integration Tests:
   ```bash
   npm run test              # Run all tests
   npm run test:watch        # Watch mode
   npm run test:coverage     # Generate coverage report
   ```

2. E2E Tests:
   ```bash
   npm run cypress:open      # Interactive mode
   npm run cypress:run       # Headless mode
   ```

3. Performance Tests:
   ```bash
   npm run test:perf        # Run performance tests
   npm run lighthouse       # Run Lighthouse CI
   ```

### Test Coverage
- Components: ~90%
- User interactions: ~95%
- API integration: ~85%
- Error scenarios: ~85%
- Accessibility: ~90%
- Performance benchmarks: Established

### Next Steps
1. Continuous Integration:
   - GitHub Actions setup
   - Automated test runs
   - Coverage reporting

2. Load Testing:
   - Large repository analysis
   - Concurrent user simulation
   - Network condition testing

3. Security Testing:
   - Authentication flows
   - Authorization checks
   - Input validation

## UI & Functionality Plan

### 1. Overall UI/UX Goals

#### 1.1 Modern Design
- Clean, minimal interface with intuitive navigation
- TailwindCSS for consistent styling and rapid development
- Responsive design for all screen sizes
- Dark/light theme support

#### 1.2 Accessibility
- ARIA attributes for interactive elements
- Keyboard navigation support
- High contrast text and visual indicators
- Screen reader compatibility

#### 1.3 Performance
- Lazy loading for heavy components
- Efficient caching strategies
- Asynchronous operations to prevent UI blocking
- Optimized bundle size

### 2. Component Architecture

#### 2.1 Global Components
1. **Navigation**
   - Primary navigation bar
   - Responsive menu for mobile
   - Active state indicators

2. **UI Elements**
   - Loading spinners with ARIA support
   - Toast notifications (success/error)
   - Modal dialogs
   - Tab systems
   - Card components
   - Search & filter interfaces

#### 2.2 Page Components

1. **Home Page**
   - Repository URL input
   - Bulk upload capability (CSV)
   - Quick actions dashboard
   - Recent activity feed

2. **Saved Repositories**
   - List of analyzed repositories
   - Filter and search capabilities
   - Repository cards with key metrics

3. **Repository Detail**
   - Code pattern visualization
   - File tree navigation
   - Pattern analysis results
   - Code quality metrics

4. **Best Practices**
   - Pattern documentation
   - Usage examples
   - Implementation guidelines

5. **Chat Interface**
   - Interactive pattern queries
   - Code analysis assistance
   - Pattern implementation guidance

### 3. Technical Implementation

#### 3.1 Core Technologies
- React 18+ with TypeScript
- TailwindCSS for styling
- React Router v6 for navigation
- React Query for data fetching
- Vite for development and building

#### 3.2 State Management
- React Context for global state
- React Query for server state
- Local state for component-specific data

#### 3.3 Data Flow
1. **API Integration**
   - Axios for HTTP requests
   - Request/response interceptors
   - Error handling
   - Response caching

2. **Real-time Updates**
   - WebSocket connection for live updates
   - Optimistic UI updates
   - Background synchronization

### 4. Development Phases

#### Phase 1: Foundation
1. Project setup with Vite
2. TailwindCSS configuration
3. Global component development
4. Routing implementation

#### Phase 2: Core Features
1. Repository analysis workflow
2. File navigation system
3. Pattern detection display
4. Basic chat functionality

#### Phase 3: Enhancement
1. Advanced pattern visualization
2. Real-time updates
3. Performance optimization
4. Accessibility improvements

#### Phase 4: Polish
1. Error handling
2. Loading states
3. Animation refinement
4. Cross-browser testing

### 5. Quality Assurance

#### 5.1 Testing Strategy
- Jest for unit testing
- React Testing Library for component testing
- Cypress for E2E testing
- Accessibility testing with axe-core

#### 5.2 Performance Metrics
- First contentful paint < 1.5s
- Time to interactive < 3.5s
- Lighthouse score > 90
- Bundle size optimization

## Frontend Architecture

### 1. Application Layout
The frontend is built with a modern, responsive design using React and follows these key principles:

#### Core Components
- Navigation Bar: Global navigation with responsive design
- Main Content Area: Flexible container for page content
- Sidebar: Context-sensitive navigation and filters
- Footer: Application information and additional links

#### Page Structure
1. **Home Page**
   - Repository search and quick actions
   - Recent activity dashboard
   - Quick stats and insights

2. **Saved Repositories**
   - List of analyzed repositories
   - Filter and search capabilities
   - Repository cards with key metrics

3. **Repository Detail**
   - Code pattern visualization
   - File tree navigation
   - Pattern analysis results
   - Code quality metrics

4. **Best Practices**
   - Pattern documentation
   - Usage examples
   - Implementation guidelines

5. **Chat Interface**
   - Interactive pattern queries
   - Code analysis assistance
   - Pattern implementation guidance

### 2. Technical Stack
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Query for server state
- **Routing**: React Router for navigation
- **Build Tool**: Vite for fast development
- **Testing**: Jest and React Testing Library

### 3. Key Features
- Responsive design for all screen sizes
- Dark/light theme support
- Real-time pattern analysis feedback
- Interactive code visualization
- Efficient data caching and updates
- Accessibility compliance

### 4. Development Workflow
1. Component-first development
2. Atomic design principles
3. Continuous integration testing
4. Performance optimization
5. Accessibility testing

## Environment Configuration

### Development Setup

1. Backend Configuration
   - Copy `backend/.env.example` to `backend/.env`
   - Set required environment variables:
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `GITHUB_TOKEN`: Your GitHub personal access token
     - `PORT` and `BACKEND_PORT`: Default is 10004 (auto-assigned if busy)
     - `DEBUG`: Set to "True" for development

2. Frontend Configuration
   - Copy `.env.example` to `.env`
   - Set required environment variables:
     - `VITE_API_URL`: Backend API URL (e.g., http://localhost:10004)
     - `VITE_API_BASE_URL`: Same as VITE_API_URL
     - `VITE_BACKEND_PORT`: Backend port (e.g., 10004)
     - `VITE_SENTRY_DSN`: Optional, for error tracking

3. Port Configuration
   - Backend: Runs on port 10004 (or next available port)
   - Frontend: Runs on port 5173+ (Vite auto-assigns next available port)
   - CORS is configured to allow connections between frontend and backend

### Starting the Application

1. Start the backend:
   ```bash
   cd backend
   python start_server.py
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Note the ports from the startup logs and update your `.env` files accordingly

## Logic Flow

### Pattern Detection Flow
1. User navigates repository files in the file tree
2. User selects a Python file for analysis
3. Frontend sends file path to pattern detection API
4. Backend performs:
   - File validation
   - AST-based pattern analysis
   - Context extraction
   - Confidence scoring
5. Frontend displays:
   - Detected patterns with confidence scores
   - Pattern context and relationships
   - Code metrics and dependencies

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

### Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | API server down | Check if backend is running and port is correct |
| `Invalid token` | Expired/invalid JWT | Re-authenticate or check token expiration |
| `MemoryError` | Large repository analysis | Increase memory limit or use chunked processing |
| `Too many requests` | Rate limiting | Implement request queuing or increase limits |

### Health Checks

```bash
# Backend Health
curl http://localhost:8000/health

# Database Health
python scripts/check_db.py

# Redis Health
redis-cli ping

# Frontend Build Health
npm run build
```

### Additional API Endpoints

#### Files and Code

##### GET /repos/{id}/files
Get repository file structure.

Query Parameters:
- `path`: string (optional, defaults to root)
- `depth`: int (optional, defaults to 1)

Response:
```json
{
  "files": [
    {
      "name": "string",
      "path": "string",
      "type": "file|directory",
      "size": 0,
      "lastModified": "2025-02-03T12:59:01Z",
      "children": []
    }
  ]
}
```

##### GET /repos/{id}/file-content
Get file content.

Query Parameters:
- `path`: string (required)
- `highlight`: boolean (optional, syntax highlighting)
- `lines`: string (optional, e.g., "1-100")

Response:
```json
{
  "content": "string",
  "language": "string",
  "lines": {
    "start": 0,
    "end": 0
  }
}
```

#### Analysis

##### POST /repos/{id}/analyze/patterns
Analyze specific patterns.

Request:
```json
{
  "patterns": ["Factory", "Singleton"],
  "files": ["src/**/*.ts"]
}
```

Response:
```json
{
  "taskId": "string",
  "status": "pending"
}
```

##### GET /repos/{id}/analyze/status/{taskId}
Get analysis task status.

Response:
```json
{
  "status": "pending|running|completed|failed",
  "progress": 0,
  "message": "string",
  "result": {}
}
```

#### Metrics

##### GET /repos/{id}/metrics/history
Get historical metrics.

Query Parameters:
- `from`: string (ISO date)
- `to`: string (ISO date)
- `metrics`: string[] (comma-separated)

Response:
```json
{
  "metrics": [
    {
      "date": "2025-02-03T12:59:01Z",
      "values": {
        "complexity": 75,
        "maintainability": 85
      }
    }
  ]
}
```

##### POST /repos/{id}/metrics/custom
Calculate custom metrics.

Request:
```json
{
  "metrics": [
    {
      "name": "string",
      "rule": "string",
      "threshold": 0
    }
  ]
}
```

### Additional Configuration

#### Vite Configuration (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', '@nivo/core']
        }
      }
    }
  }
});
```

#### TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [
    {
      name: 'repo-analyzer-api',
      script: 'backend/start_server.py',
      interpreter: 'python',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
    },
    {
      name: 'repo-analyzer-frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

### Additional Flow Diagrams

#### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant G as GitHub
    
    U->>F: Click Login
    F->>G: Redirect to GitHub
    G->>F: Return with code
    F->>B: POST /auth/login
    B->>G: Exchange code for token
    G->>B: Return access token
    B->>B: Generate JWT
    B->>F: Return JWT
    F->>U: Show authenticated state
```

#### File Analysis Flow
```mermaid
graph TD
    A[Load File] --> B[Determine Language]
    B --> C[Select Parser]
    C --> D{Parser Type}
    D -->|TypeScript| E[TS Parser]
    D -->|Python| F[Python Parser]
    D -->|Other| G[Generic Parser]
    E --> H[AST Generation]
    F --> H
    G --> H
    H --> I[Pattern Analysis]
    I --> J[Metrics Calculation]
    J --> K[Store Results]
```

#### Caching Strategy
```mermaid
graph TD
    A[Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached]
    B -->|No| D[Fetch Data]
    D --> E[Process Data]
    E --> F[Cache Result]
    F --> G[Return Fresh]
    C --> H[Check Stale]
    H -->|Stale| I[Background Refresh]
```

#### Error Handling Flow
```mermaid
graph TD
    A[Error Occurs] --> B{Error Type}
    B -->|API| C[HTTP Error]
    B -->|Runtime| D[Application Error]
    B -->|Network| E[Connection Error]
    C --> F[Error Boundary]
    D --> F
    E --> F
    F --> G[Log Error]
    G --> H[User Notification]
    H --> I[Recovery Action]
```

### Troubleshooting Guide

#### Common Issues

##### 1. Installation Issues
```bash
# Problem: Dependencies fail to install
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Problem: Python packages fail
pip cache purge
pip install -r requirements.txt --no-cache-dir
```

##### 2. Database Issues
```bash
# Problem: Database migrations fail
alembic downgrade base
alembic upgrade head

# Problem: Database connection issues
pg_isready -h localhost
createdb repo_analyzer
```

##### 3. API Connection Issues
```bash
# Check API status
curl http://localhost:8000/health

# Check WebSocket
wscat -c ws://localhost:8000/ws
```

##### 4. Analysis Issues
```bash
# Clear analysis cache
redis-cli FLUSHDB

# Reset repository state
python scripts/reset_repo.py <repo_id>
```

#### Debugging Tools

##### 1. Frontend Debugging
- React DevTools
- Redux DevTools
- Network Tab monitoring
- Console logging with debug package

##### 2. Backend Debugging
- FastAPI debug mode
- pdb/ipdb for Python debugging
- logging to repo_analyzer.log
- SQLAlchemy echo mode

##### 3. Performance Issues
- Lighthouse reports
- React Profiler
- Database query analysis
- Memory usage monitoring

#### Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | API server down | Check if backend is running and port is correct |
| `Invalid token` | Expired/invalid JWT | Re-authenticate or check token expiration |
| `MemoryError` | Large repository analysis | Increase memory limit or use chunked processing |
| `Too many requests` | Rate limiting | Implement request queuing or increase limits |

#### Health Checks

```bash
# Backend Health
curl http://localhost:8000/health

# Database Health
python scripts/check_db.py

# Redis Health
redis-cli ping

# Frontend Build Health
npm run build
```

### Error Handling Best Practices

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
