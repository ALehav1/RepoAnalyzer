# RepoAnalyzer

A powerful tool for analyzing GitHub repositories, extracting best practices, and facilitating AI-powered code discussions.

## Features

### 1. Repository Analysis
- **Code Analysis**: Deep analysis of repository structure, patterns, and practices
- **Best Practices Detection**: Automatically identifies and extracts best practices from code
- **Language Support**: Supports multiple programming languages including Python, JavaScript, TypeScript
- **Codebase Understanding**: Generates insights about code organization and architecture

### 2. AI-Powered Chat
- **Context-Aware Chat**: Discuss code with AI that understands your repository context
- **Code Explanations**: Get detailed explanations of code functionality
- **Best Practice Recommendations**: Receive suggestions for code improvements
- **Architecture Discussions**: Discuss system design and architectural decisions

### 3. Best Practices Management
- **Practice Collection**: Save and organize best practices found in repositories
- **Searchable Database**: Search through collected practices
- **Practice Categories**: Organize practices by language, framework, or domain
- **Export Capabilities**: Share practices across teams

## Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite
- **Testing**: Jest with React Testing Library

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: SQLite with SQLAlchemy (async)
- **Migration**: Alembic
- **Authentication**: JWT-based
- **Code Analysis**: Custom analyzers with LLM integration
- **Logging**: Python logging with rotation
- **Testing**: pytest with pytest-asyncio for async tests

## Project Structure

The project follows a clean architecture pattern with clear separation of concerns:

```
.
├── backend/
│   ├── src/
│   │   ├── api/              # API layer
│   │   │   ├── routes/       # Route handlers
│   │   │   ├── schemas/      # Request/Response models
│   │   │   └── main.py      # FastAPI app setup
│   │   ├── services/         # Business logic
│   │   │   ├── repo_processor.py  # Repository processing
│   │   │   ├── task_manager.py    # Async task management
│   │   │   ├── chat.py           # Chat functionality
│   │   │   └── vector_store.py   # Vector store service
│   │   ├── models/          # Database models
│   │   └── utils/           # Utility functions
│   └── tests/              # Test suite
│       ├── api/           # API tests
│       ├── services/      # Service tests
│       └── models/        # Model tests
└── src/                  # Frontend source code
    ├── api/             # API client and types
    ├── components/      # React components
    ├── contexts/        # React contexts
    └── utils/          # Utility functions
```

## Setup and Installation

### Prerequisites
- Python 3.11
- Node.js 18+
- Git

### Backend Setup
1. Create and activate virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   python -m alembic upgrade head
   ```

5. Start the backend server:
   ```bash
   python -m uvicorn src.api.main:app --reload --port 8001
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

3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

### Backend Tests
The backend uses pytest with pytest-asyncio for testing async code:

1. Activate virtual environment:
   ```bash
   cd backend
   source venv/bin/activate
   ```

2. Run tests:
   ```bash
   python -m pytest tests/ -v
   ```

3. Run tests with coverage:
   ```bash
   python -m pytest tests/ -v --cov=src
   ```

### Frontend Tests
Run frontend tests with Jest:
```bash
npm test
```

## API Documentation

The API documentation is available at:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: SQLite database URL (default: sqlite+aiosqlite:///./data.db)
- `GITHUB_TOKEN`: GitHub API token for repository access
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `LOG_LEVEL`: Logging level (default: INFO)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8001)
- `VITE_GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `VITE_APP_NAME`: Application name for display

## Error Handling and Logging

### Backend
- Consistent error handling with custom exceptions
- Detailed error logging with stack traces
- Logs stored in `backend/logs/` with rotation (10MB limit)
- Request/response logging middleware

### Frontend
- Global error boundary for React components
- Error logging to console in development
- API error handling with retry logic
- User-friendly error messages

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License
MIT License - see LICENSE file for details