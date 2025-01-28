import re
from typing import Dict, Optional, Tuple
from pathlib import Path
import json
import aiohttp
import asyncio
from datetime import datetime

def parse_github_url(url: str) -> Optional[Dict[str, str]]:
    """Parse a GitHub URL into owner and repo components."""
    patterns = [
        r"github\.com[:/](?P<owner>[\w.-]+)/(?P<repo>[\w.-]+)(?:\.git)?/?$",
        r"github\.com/(?P<owner>[\w.-]+)/(?P<repo>[\w.-]+)/?$"
    ]
    
    for pattern in patterns:
        match = re.match(pattern, url)
        if match:
            return match.groupdict()
    return None

async def get_repo_metadata(owner: str, repo: str, token: Optional[str] = None) -> Dict:
    """Fetch repository metadata from GitHub API."""
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    if token:
        headers["Authorization"] = f"token {token}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers=headers
        ) as response:
            if response.status == 200:
                data = await response.json()
                return {
                    "name": data["name"],
                    "full_name": data["full_name"],
                    "description": data["description"],
                    "stars": data["stargazers_count"],
                    "forks": data["forks_count"],
                    "language": data["language"],
                    "created_at": data["created_at"],
                    "updated_at": data["updated_at"],
                    "license": data.get("license", {}).get("name"),
                    "topics": data.get("topics", [])
                }
            else:
                return {}

def save_analysis_results(results: Dict, output_dir: Path, repo_name: str):
    """Save analysis results to a JSON file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = output_dir / f"analysis_{repo_name}_{timestamp}.json"
    
    with output_file.open('w') as f:
        json.dump(results, f, indent=2)
    
    return output_file

def get_file_type(file_path: str) -> Tuple[str, bool]:
    """
    Determine file type and whether it should be analyzed.
    Returns: (file_type, should_analyze)
    """
    ext = Path(file_path).suffix.lower()
    
    # Binary file extensions
    binary_exts = {
        '.pyc', '.so', '.dll', '.exe', '.bin',
        '.jpg', '.jpeg', '.png', '.gif', '.ico',
        '.pdf', '.zip', '.tar', '.gz', '.7z'
    }
    
    # Config file extensions
    config_exts = {
        '.json', '.yaml', '.yml', '.toml', '.ini',
        '.cfg', '.conf', '.config', '.env'
    }
    
    if ext in binary_exts:
        return ('binary', False)
    elif ext in config_exts:
        return ('config', True)
    else:
        return ('code', True)

def is_test_file(file_path: str) -> bool:
    """Determine if a file is a test file."""
    path = Path(file_path)
    
    # Check filename patterns
    test_patterns = [
        r'^test_.*\.py$',
        r'.*_test\.py$',
        r'.*\.test\.js$',
        r'.*\.spec\.js$',
        r'.*Test\.java$',
        r'.*_test\.go$'
    ]
    
    return any(re.match(pattern, path.name) for pattern in test_patterns)

def estimate_tokens(text: str) -> int:
    """Rough estimate of token count for OpenAI models."""
    # Very rough approximation: ~4 chars per token
    return len(text) // 4

def truncate_for_model(text: str, max_tokens: int = 4000) -> str:
    """Truncate text to fit within model token limit."""
    estimated_tokens = estimate_tokens(text)
    if estimated_tokens <= max_tokens:
        return text
    
    # Truncate to ~90% of max to leave room for prompt
    target_chars = (max_tokens * 0.9) * 4
    return text[:int(target_chars)]
