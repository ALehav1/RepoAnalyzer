import os
import base64
from typing import Dict, List, Any, Optional
import httpx
from urllib.parse import urlparse
import asyncio
from datetime import datetime, timedelta
import aiohttp
from aiohttp import ClientSession
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self, calls_per_hour: int = 5000):
        self.calls_per_hour = calls_per_hour
        self.calls_made = 0
        self.reset_time = datetime.now() + timedelta(hours=1)
        self.lock = asyncio.Lock()

    async def acquire(self):
        async with self.lock:
            if datetime.now() >= self.reset_time:
                self.calls_made = 0
                self.reset_time = datetime.now() + timedelta(hours=1)

            if self.calls_made >= self.calls_per_hour:
                wait_time = (self.reset_time - datetime.now()).total_seconds()
                logger.warning(f"Rate limit reached. Waiting {wait_time} seconds...")
                await asyncio.sleep(wait_time)
                self.calls_made = 0
                self.reset_time = datetime.now() + timedelta(hours=1)

            self.calls_made += 1

class GithubService:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.api_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.rate_limiter = RateLimiter()
        self.cache = {}
        self.cache_ttl = timedelta(minutes=30)

    def get_repo_id(self, repo_url: str) -> str:
        """Extract repository ID from URL."""
        path = urlparse(repo_url).path.strip("/")
        return base64.urlsafe_b64encode(path.encode()).decode()

    async def get_cached_data(self, key: str) -> Optional[Dict]:
        """Get cached data if it exists and is not expired."""
        if key in self.cache:
            data, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.cache_ttl:
                return data
            del self.cache[key]
        return None

    def cache_data(self, key: str, data: Dict):
        """Cache data with current timestamp."""
        self.cache[key] = (data, datetime.now())

    async def get_repo_info(self, repo_url: str) -> Dict[str, Any]:
        """Get repository information from GitHub API."""
        cache_key = f"repo_info:{repo_url}"
        if cached := await self.get_cached_data(cache_key):
            return cached

        path = urlparse(repo_url).path.strip("/")
        await self.rate_limiter.acquire()
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.api_url}/repos/{path}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            self.cache_data(cache_key, data)
            return data

    async def get_repository_files(self, repo_url: str) -> List[Dict[str, Any]]:
        """Get all files from a repository using parallel processing."""
        cache_key = f"repo_files:{repo_url}"
        if cached := await self.get_cached_data(cache_key):
            return cached

        path = urlparse(repo_url).path.strip("/")
        files = []
        
        async with aiohttp.ClientSession() as session:
            # Get default branch
            await self.rate_limiter.acquire()
            async with session.get(
                f"{self.api_url}/repos/{path}",
                headers=self.headers
            ) as response:
                repo_data = await response.json()
                default_branch = repo_data["default_branch"]
            
            # Get tree
            await self.rate_limiter.acquire()
            async with session.get(
                f"{self.api_url}/repos/{path}/git/trees/{default_branch}?recursive=1",
                headers=self.headers
            ) as response:
                tree = await response.json()
            
            # Process files in parallel with rate limiting
            async def process_file(item):
                if item["type"] != "blob":
                    return None
                    
                try:
                    await self.rate_limiter.acquire()
                    async with session.get(
                        f"{self.api_url}/repos/{path}/contents/{item['path']}",
                        headers=self.headers
                    ) as response:
                        if response.status == 404:
                            return None
                            
                        content = await response.json()
                        
                        # Skip large files
                        if content.get("size", 0) > 1000000:  # Skip files larger than 1MB
                            return {
                                "path": item["path"],
                                "content": "File too large to process",
                                "language": self._detect_language(item["path"]),
                                "size": content.get("size", 0)
                            }
                        
                        # Decode content
                        if content.get("encoding") == "base64":
                            decoded_content = base64.b64decode(content["content"]).decode()
                        else:
                            decoded_content = content.get("content", "")
                        
                        return {
                            "path": item["path"],
                            "content": decoded_content,
                            "language": self._detect_language(item["path"]),
                            "size": content.get("size", 0)
                        }
                except Exception as e:
                    logger.error(f"Error processing file {item['path']}: {str(e)}")
                    return None

            # Process files in chunks to avoid overwhelming the API
            chunk_size = 10
            tree_items = tree["tree"]
            
            for i in range(0, len(tree_items), chunk_size):
                chunk = tree_items[i:i + chunk_size]
                chunk_results = await asyncio.gather(
                    *[process_file(item) for item in chunk]
                )
                files.extend([f for f in chunk_results if f is not None])
                
                # Small delay between chunks to be nice to the API
                await asyncio.sleep(1)
        
        self.cache_data(cache_key, files)
        return files

    async def get_readme(self, repo_url: str) -> str:
        """Get repository README content."""
        cache_key = f"readme:{repo_url}"
        if cached := await self.get_cached_data(cache_key):
            return cached

        path = urlparse(repo_url).path.strip("/")
        await self.rate_limiter.acquire()
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.api_url}/repos/{path}/readme",
                    headers=self.headers
                )
                response.raise_for_status()
                content = response.json()
                
                if content["encoding"] == "base64":
                    readme = base64.b64decode(content["content"]).decode()
                else:
                    readme = content.get("content", "")
                
                self.cache_data(cache_key, readme)
                return readme
            except httpx.HTTPError:
                return "No README found"

    def _detect_language(self, file_path: str) -> str:
        """Detect programming language based on file extension."""
        ext = file_path.split(".")[-1].lower() if "." in file_path else ""
        language_map = {
            "py": "Python",
            "js": "JavaScript",
            "jsx": "JavaScript",
            "ts": "TypeScript",
            "tsx": "TypeScript",
            "java": "Java",
            "cpp": "C++",
            "c": "C",
            "go": "Go",
            "rs": "Rust",
            "rb": "Ruby",
            "php": "PHP",
            "cs": "C#",
            "swift": "Swift",
            "kt": "Kotlin",
            "scala": "Scala",
            "html": "HTML",
            "css": "CSS",
            "scss": "SCSS",
            "md": "Markdown",
            "json": "JSON",
            "yml": "YAML",
            "yaml": "YAML",
            "xml": "XML",
            "sql": "SQL",
            "sh": "Shell",
            "bash": "Shell",
            "zsh": "Shell"
        }
        return language_map.get(ext, "Unknown")
