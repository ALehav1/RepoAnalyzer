import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).parent.parent
REPOS_DIR = Path(os.getenv("REPOS_DIR", "repos"))
VECTOR_STORE_DIR = Path(os.getenv("VECTOR_STORE_DIR", "vector_store"))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "outputs"))

# Create necessary directories
REPOS_DIR.mkdir(exist_ok=True)
VECTOR_STORE_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# API configurations
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Analysis configurations
MAX_FILE_SIZE_MB = float(os.getenv("MAX_FILE_SIZE_MB", "1.0"))
MAX_CHUNK_SIZE = int(os.getenv("MAX_CHUNK_SIZE", "200"))
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-3.5-turbo")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")

# Supported file extensions
SUPPORTED_EXTENSIONS = {
    # Python
    ".py": "python",
    
    # JavaScript/TypeScript
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    
    # Java
    ".java": "java",
    
    # Go
    ".go": "go",
    
    # C/C++
    ".c": "c",
    ".h": "c",
    ".cpp": "cpp",
    ".hpp": "cpp",
    
    # Web
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".sass": "sass",
    
    # Config files
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".toml": "toml",
    
    # Shell
    ".sh": "shell",
    ".bash": "shell",
    ".zsh": "shell",
}

# Directories to exclude during analysis
EXCLUDE_DIRS = set(os.getenv("EXCLUDE_DIRS", ".git,node_modules,venv,env,__pycache__,build,dist,.next,.vscode,.idea,coverage").split(","))
