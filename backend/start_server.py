"""Server startup script with port management."""
import os
import sys
import socket
import psutil
import uvicorn
import logging
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RepoAnalyzer API",
    description="API for analyzing repositories and detecting design patterns",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

# Import API routes
from src.api.v1.patterns import router as patterns_router

# Add routers
app.include_router(patterns_router)

# Configure CORS
origins = [
    "http://localhost:5185",  # Current Vite dev server
    "http://127.0.0.1:5185",
    "http://localhost:4173",  # Vite preview
    "http://127.0.0.1:4173",
]

if os.getenv("DEBUG", "False").lower() == "true":
    origins = ["*"]  # Allow all origins in debug mode

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def find_free_port(start_port: Optional[int] = None, max_attempts: int = 10) -> Optional[int]:
    """Find a free port starting from start_port.
    
    Args:
        start_port (Optional[int]): Port to start searching from, defaults to env var or 3000
        max_attempts (int): Maximum number of ports to try
        
    Returns:
        Optional[int]: Free port number if found, None otherwise
    """
    if start_port is None:
        start_port = int(os.getenv('BACKEND_PORT', '3000'))
    
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('localhost', port))
                return port
            except OSError:
                continue
    return None

def kill_process_on_port(port: int) -> bool:
    """Kill process using the specified port.
    
    Args:
        port (int): Port number
        
    Returns:
        bool: True if process was killed, False otherwise
    """
    try:
        for proc in psutil.process_iter(['pid', 'name', 'connections']):
            try:
                for conn in proc.connections():
                    if conn.laddr.port == port:
                        proc.kill()
                        return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
    except Exception as e:
        logger.error(f"Error killing process on port {port}: {e}")
    return False

def main():
    """Main entry point."""
    try:
        port = int(os.getenv('PORT', 9999))
        host = os.getenv('HOST', '0.0.0.0')
        
        # Try to kill any process using our port
        if kill_process_on_port(port):
            logger.info(f"Killed process using port {port}")
        
        # If port is still in use, find a free one
        if not find_free_port(port, 1):
            new_port = find_free_port(port + 1, 10)
            if new_port:
                logger.warning(f"Port {port} in use, using port {new_port}")
                port = new_port
            else:
                logger.error("No free ports found")
                sys.exit(1)
        
        # Start server
        uvicorn.run(
            "start_server:app",
            host=host,
            port=port,
            reload=True,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
