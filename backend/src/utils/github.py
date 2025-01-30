"""GitHub-related utility functions."""

import re
from typing import Dict, Optional
import aiohttp
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
    """Fetch repository metadata from GitHub API.
    
    Args:
        owner: Repository owner
        repo: Repository name
        token: Optional GitHub API token
        
    Returns:
        Dict containing repository metadata
    """
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
            if response.status == 404:
                raise ValueError(f"Repository {owner}/{repo} not found")
            elif response.status != 200:
                raise RuntimeError(f"GitHub API error: {response.status}")
            
            data = await response.json()
            return {
                "id": str(data["id"]),
                "name": data["name"],
                "full_name": data["full_name"],
                "description": data["description"],
                "url": data["html_url"],
                "created_at": data["created_at"],
                "updated_at": data["updated_at"],
                "pushed_at": data["pushed_at"],
                "size": data["size"],
                "stargazers_count": data["stargazers_count"],
                "watchers_count": data["watchers_count"],
                "forks_count": data["forks_count"],
                "open_issues_count": data["open_issues_count"],
                "default_branch": data["default_branch"],
                "fetched_at": datetime.utcnow().isoformat()
            }
