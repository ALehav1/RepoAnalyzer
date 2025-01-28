import uvicorn
import os
from pathlib import Path
from dotenv import load_dotenv

# Get the absolute path to the .env file
env_path = Path(__file__).parent / '.env'
print(f"Looking for .env file at: {env_path}")

# Load environment variables
load_dotenv(env_path)

# Print loaded environment variables (without sensitive values)
print("Loaded environment variables:")
print(f"HOST: {os.getenv('HOST', '0.0.0.0')}")
print(f"PORT: {os.getenv('PORT', '8000')}")
print(f"OPENAI_API_KEY: {'[SET]' if os.getenv('OPENAI_API_KEY') else '[NOT SET]'}")
print(f"GITHUB_TOKEN: {'[SET]' if os.getenv('GITHUB_TOKEN') else '[NOT SET]'}")

from src.config import HOST, PORT

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(
        "src.api.main:app",
        host=HOST,
        port=PORT,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
