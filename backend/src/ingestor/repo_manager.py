import os
import git
import asyncio
from typing import List, Optional
from pathlib import Path
from git.exc import GitCommandError
import aiohttp
import ssl
import certifi

class RepoManager:
    def __init__(self, base_path: str = "repos"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(exist_ok=True)
        
        # Create SSL context for GitHub API requests
        self.ssl_context = ssl.create_default_context(cafile=certifi.where())
        
    async def clone_or_pull_repo(self, repo_url: str) -> str:
        """Clone a new repository or pull latest changes if it exists."""
        try:
            # Validate GitHub URL format
            if not repo_url.startswith(("http://github.com/", "https://github.com/")):
                raise ValueError("Invalid GitHub repository URL. Must start with http(s)://github.com/")

            # Extract repo name from URL
            repo_name = repo_url.split("/")[-1].replace(".git", "")
            if not repo_name:
                raise ValueError("Invalid repository URL format")

            local_path = self.base_path / repo_name

            # Check if repository exists on GitHub
            connector = aiohttp.TCPConnector(ssl=self.ssl_context)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.get(f"https://api.github.com/repos/{repo_url.split('github.com/')[-1]}") as response:
                    if response.status != 200:
                        raise ValueError("Repository not found on GitHub")

            if not local_path.exists():
                print(f"Cloning {repo_url} into {local_path}...")
                # Run git clone in a separate thread to avoid blocking
                await asyncio.to_thread(git.Repo.clone_from, repo_url, local_path)
            else:
                print(f"Repo {repo_name} exists, pulling latest changes...")
                repo = git.Repo(local_path)
                origin = repo.remotes.origin
                # Run git pull in a separate thread
                await asyncio.to_thread(origin.pull)

            return str(local_path)

        except GitCommandError as e:
            raise ValueError(f"Git operation failed: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to process repository: {str(e)}")

    def collect_code_files(
        self, 
        local_repo_path: str, 
        valid_exts: Optional[List[str]] = None,
        exclude_dirs: Optional[List[str]] = None
    ) -> List[str]:
        """Collect all code files from the repository."""
        try:
            if valid_exts is None:
                valid_exts = [".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go", ".cpp", ".c", ".h", ".hpp"]
            
            if exclude_dirs is None:
                exclude_dirs = [".git", "node_modules", "venv", "env", "__pycache__", "build", "dist"]

            if not os.path.exists(local_repo_path):
                raise ValueError(f"Repository path does not exist: {local_repo_path}")

            code_files = []
            for root, dirs, files in os.walk(local_repo_path):
                # Remove excluded directories
                dirs[:] = [d for d in dirs if d not in exclude_dirs]
                
                for file in files:
                    if any(file.endswith(ext) for ext in valid_exts):
                        full_path = os.path.join(root, file)
                        code_files.append(full_path)

            return code_files

        except Exception as e:
            raise ValueError(f"Failed to collect code files: {str(e)}")

    def get_file_content(self, file_path: str) -> Optional[str]:
        """Get the content of a file."""
        try:
            if not os.path.exists(file_path):
                return None

            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            print(f"Warning: Could not read {file_path} as UTF-8")
            return None
        except Exception as e:
            print(f"Warning: Failed to read {file_path}: {str(e)}")
            return None
