"""Repository processor service."""

import logging
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import uuid
import json

from git import Repo
from git.exc import GitCommandError
import magic
import chardet
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from ..models.base import Repository, File, BestPractice
from ..database import get_db

# Configure logging with absolute paths
log_dir = Path(__file__).parent.parent.parent / "logs"
log_dir.mkdir(exist_ok=True)
log_file = log_dir / "repo_analyzer.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(str(log_file)),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RepoProcessor:
    """Process repositories."""

    def __init__(self, job_id: str = None):
        """Initialize repository processor.
        
        Args:
            job_id: Optional job ID for tracking
        """
        if not job_id:
            job_id = str(uuid.uuid4())
        self.job_id = job_id
        
        # Set up data directory
        self.data_dir = Path(__file__).parent.parent.parent / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Initialized RepoProcessor with job_id: {job_id}")

    def process_repository(self, db: Session, repo_id: str) -> Dict[str, Any]:
        """Process a repository.
        
        Args:
            db: Database session
            repo_id: Repository ID
            
        Returns:
            Dict containing analysis results
        """
        try:
            logger.info(f"[{repo_id}] Starting repository processing")
            
            # Get repository
            repo = self._get_repository(db, repo_id)
            if not repo:
                raise ValueError(f"Repository {repo_id} not found")
            
            logger.info(f"[{repo_id}] Found repository: {repo.url}")
            
            # Update status
            repo.analysis_status = "processing"
            repo.analysis_progress = 0.0
            db.commit()
            logger.info(f"[{repo_id}] Updated status to processing")

            # Clone repository
            repo_path = self._clone_repository(repo)
            logger.info(f"[{repo_id}] Cloned repository to {repo_path}")

            # Analyze repository
            analysis_result = self._analyze_repository(repo_path)
            logger.info(f"[{repo_id}] Completed repository analysis")

            # Update repository with results
            repo.analysis = analysis_result
            repo.analysis_status = "completed"
            repo.analysis_progress = 100.0
            repo.last_analyzed = datetime.utcnow()
            db.commit()
            logger.info(f"[{repo_id}] Updated repository with analysis results")

            return analysis_result

        except Exception as e:
            logger.error(f"[{repo_id}] Error processing repository: {str(e)}", exc_info=True)
            try:
                repo = self._get_repository(db, repo_id)
                if repo:
                    repo.analysis_status = "failed"
                    repo.analysis_progress = 0.0
                    db.commit()
                    logger.info(f"[{repo_id}] Updated status to failed")
            except Exception as inner_e:
                logger.error(f"[{repo_id}] Error updating repository status: {str(inner_e)}", exc_info=True)
            raise

    def _get_repository(self, db: Session, repo_id: str) -> Optional[Repository]:
        """Get repository by ID."""
        try:
            return db.query(Repository).filter(Repository.id == repo_id).first()
        except Exception as e:
            logger.error(f"Error getting repository {repo_id}: {str(e)}")
            return None

    def _list_repositories(self) -> List[Repository]:
        """List all repositories."""
        logger.debug("Listing all repositories")
        return self.db.query(Repository).all()

    def _update_status(self, repo: Repository, status: str, progress: float, message: str, stage: str) -> None:
        """Update repository status."""
        try:
            repo.analysis_status = status
            repo.analysis_progress = progress
            repo.analysis_stage = stage
            repo.updated_at = datetime.utcnow()
            self.db.commit()
            logger.info(f"[{repo.id}] Status updated: {status} ({progress}%) - {message}")
        except Exception as e:
            logger.error(f"Error updating status for repository {repo.id}: {str(e)}")
            raise

    def _clone_repository(self, repo: Repository, depth: int = 1) -> str:
        """Clone a repository.
        
        Args:
            repo: Repository to clone
            depth: Clone depth (default: 1 for shallow clone)
            
        Returns:
            Path to cloned repository
        """
        try:
            # Create a unique path for this repository
            repo_path = self.data_dir / "repos" / str(repo.id)
            
            # If directory exists, remove it first
            if repo_path.exists():
                logger.info(f"[{repo.id}] Removing existing repository directory")
                shutil.rmtree(str(repo_path))
            
            # Create parent directory
            repo_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Clone repository
            logger.info(f"[{repo.id}] Cloning repository from {repo.url}")
            Repo.clone_from(repo.url, str(repo_path), depth=depth)
            logger.info(f"[{repo.id}] Repository cloned successfully")
            
            return str(repo_path)
            
        except Exception as e:
            logger.error(f"[{repo.id}] Error cloning repository: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to clone repository: {str(e)}")

    def _load_quick_info(self, repo: Repository, repo_path: str) -> None:
        """Load quick repository information."""
        try:
            # Get repository name from URL
            repo.name = repo.url.split("/")[-1].replace(".git", "")
            logger.info(f"[{repo.id}] Set repository name: {repo.name}")

            # Load README if exists
            readme_path = os.path.join(repo_path, "README.md")
            if os.path.exists(readme_path):
                with open(readme_path, "r", encoding="utf-8") as f:
                    repo.readme = f.read()
                logger.info(f"[{repo.id}] Loaded README.md")

            # Update repository
            self.db.add(repo)
            self.db.commit()
            logger.info(f"[{repo.id}] Quick info loaded successfully")

        except Exception as e:
            logger.error(f"Error loading quick info for repository {repo.id}: {str(e)}")
            raise

    def _analyze_structure(self, repo: Repository, repo_path: str) -> None:
        """Analyze repository structure."""
        try:
            structure = []
            for root, dirs, files in os.walk(repo_path):
                rel_path = os.path.relpath(root, repo_path)
                if rel_path == ".":
                    rel_path = ""

                # Create file info objects for each file
                file_infos = []
                for file in files:
                    file_path = os.path.join(root, file)
                    file_infos.append({
                        "path": os.path.join(rel_path, file),
                        "type": "file",
                        "size": os.path.getsize(file_path),
                        "language": self._detect_language(file_path),
                        "last_modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
                    })

                # Create directory info objects for each directory
                dir_infos = []
                for dir_name in dirs:
                    dir_path = os.path.join(root, dir_name)
                    dir_infos.append({
                        "path": os.path.join(rel_path, dir_name),
                        "type": "directory",
                        "size": 0,  # Directories don't have a size
                        "last_modified": datetime.fromtimestamp(os.path.getmtime(dir_path)).isoformat()
                    })

                # Add all items to structure
                structure.extend(file_infos)
                structure.extend(dir_infos)
            
            repo.structure = structure
            self.db.add(repo)
            self.db.commit()
            logger.info(f"[{repo.id}] Repository structure analyzed")

        except Exception as e:
            logger.error(f"Error analyzing structure for repository {repo.id}: {str(e)}")
            raise

    def _analyze_code(self, repo: Repository, repo_path: str) -> None:
        """Analyze repository code."""
        try:
            analysis = repo.analysis
            metrics = analysis["metrics"]

            for root, _, files in os.walk(repo_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, repo_path)
                    
                    # Skip binary files and large files
                    if self._is_text_file(file_path) and os.path.getsize(file_path) < 1024 * 1024:
                        try:
                            with open(file_path, "r", encoding="utf-8") as f:
                                content = f.read()
                                
                            # Create file record
                            file_record = File(
                                id=str(uuid.uuid4()),
                                repository_id=repo.id,
                                path=rel_path,
                                content=content,
                                language=self._detect_language(file_path),
                                size=os.path.getsize(file_path),
                                last_modified=datetime.fromtimestamp(os.path.getmtime(file_path))
                            )
                            self.db.add(file_record)

                            # Add code metrics
                            metrics["complexity"].append({
                                "category": "lines_of_code",
                                "value": len(content.splitlines()),
                                "description": f"Number of lines in {rel_path}",
                                "trend": None
                            })
                            logger.debug(f"[{repo.id}] Analyzed file: {rel_path}")
                        except Exception as e:
                            logger.warning(f"Error analyzing file {rel_path}: {str(e)}")
                            continue
            
            # Update analysis with findings
            analysis["summary"] = f"Repository contains {len(metrics['complexity'])} files"
            analysis["last_updated"] = datetime.utcnow().isoformat()
            repo.analysis = analysis
            self.db.add(repo)
            self.db.commit()
            logger.info(f"[{repo.id}] Code analysis complete")

        except Exception as e:
            logger.error(f"Error analyzing code for repository {repo.id}: {str(e)}")
            raise

    def _analyze_dependencies(self, repo: Repository, repo_path: str) -> None:
        """Analyze repository dependencies."""
        try:
            analysis = repo.analysis
            metrics = analysis["metrics"]
            
            # Check for package files
            package_files = {
                "requirements.txt": "python",
                "package.json": "node",
                "pom.xml": "java",
                "build.gradle": "java",
                "Gemfile": "ruby",
                "composer.json": "php"
            }
            
            for file, lang in package_files.items():
                file_path = os.path.join(repo_path, file)
                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        metrics["dependencies"].append({
                            "name": file,
                            "version": "1.0",  # This should be parsed from the file
                            "type": lang
                        })
                        logger.info(f"[{repo.id}] Found {lang} dependencies in {file}")
            
            # Update analysis with findings
            analysis["last_updated"] = datetime.utcnow().isoformat()
            repo.analysis = analysis
            self.db.add(repo)
            self.db.commit()
            logger.info(f"[{repo.id}] Dependency analysis complete")

        except Exception as e:
            logger.error(f"Error analyzing dependencies for repository {repo.id}: {str(e)}")
            raise

    def _identify_best_practices(self, repo: Repository, repo_path: str) -> None:
        """Identify best practices in repository."""
        try:
            analysis = repo.analysis
            strengths = analysis["strengths"]
            weaknesses = analysis["weaknesses"]
            recommendations = analysis["recommendations"]
            
            # Check for common best practices
            if os.path.exists(os.path.join(repo_path, ".gitignore")):
                strengths.append("Uses version control best practices with .gitignore")
                best_practice = BestPractice(
                    id=str(uuid.uuid4()),
                    repository_id=repo.id,
                    title="Uses .gitignore",
                    description="Repository properly manages ignored files with .gitignore",
                    category="version_control",
                    created_at=datetime.utcnow()
                )
                self.db.add(best_practice)
                logger.info(f"[{repo.id}] Found .gitignore best practice")
            else:
                weaknesses.append("Missing .gitignore file")
                recommendations.append("Add a .gitignore file to manage ignored files")
            
            if os.path.exists(os.path.join(repo_path, "README.md")):
                strengths.append("Has documentation with README.md")
                best_practice = BestPractice(
                    id=str(uuid.uuid4()),
                    repository_id=repo.id,
                    title="Has README",
                    description="Repository includes documentation in README.md",
                    category="documentation",
                    created_at=datetime.utcnow()
                )
                self.db.add(best_practice)
                logger.info(f"[{repo.id}] Found README.md best practice")
            else:
                weaknesses.append("Missing README.md file")
                recommendations.append("Add a README.md file to document the project")
            
            # Update analysis with findings
            analysis["last_updated"] = datetime.utcnow().isoformat()
            repo.analysis = analysis
            self.db.add(repo)
            self.db.commit()
            logger.info(f"[{repo.id}] Best practices analysis complete")

        except Exception as e:
            logger.error(f"Error identifying best practices for repository {repo.id}: {str(e)}")
            raise

    def _is_text_file(self, file_path: str) -> bool:
        """Check if file is text file."""
        try:
            mime = magic.from_file(file_path, mime=True)
            return mime.startswith('text/') or mime in ['application/json', 'application/xml']
        except Exception:
            return False

    def _detect_language(self, file_path: str) -> str:
        """Detect file language."""
        try:
            # Get file extension
            ext = os.path.splitext(file_path)[1].lower()
            
            # Common language mappings
            language_map = {
                ".py": "python",
                ".js": "javascript",
                ".ts": "typescript",
                ".java": "java",
                ".cpp": "cpp",
                ".c": "c",
                ".h": "c",
                ".hpp": "cpp",
                ".cs": "csharp",
                ".go": "go",
                ".rb": "ruby",
                ".php": "php",
                ".swift": "swift",
                ".kt": "kotlin",
                ".rs": "rust",
                ".scala": "scala",
                ".m": "objective-c",
                ".mm": "objective-c++",
                ".r": "r",
                ".pl": "perl",
                ".sh": "shell",
                ".bash": "shell",
                ".zsh": "shell",
                ".fish": "shell",
                ".sql": "sql",
                ".html": "html",
                ".htm": "html",
                ".css": "css",
                ".scss": "scss",
                ".sass": "sass",
                ".less": "less",
                ".jsx": "jsx",
                ".tsx": "tsx",
                ".vue": "vue",
                ".json": "json",
                ".xml": "xml",
                ".yaml": "yaml",
                ".yml": "yaml",
                ".toml": "toml",
                ".ini": "ini",
                ".cfg": "config",
                ".conf": "config"
            }
            return language_map.get(ext, "unknown")
        except Exception as e:
            logger.error(f"Error detecting language for {file_path}: {str(e)}")
            return "unknown"

    def _detect_encoding(self, file_path: str) -> str:
        """Detect file encoding."""
        try:
            with open(file_path, 'rb') as f:
                raw = f.read(4096)
                result = chardet.detect(raw)
                return result['encoding'] or 'utf-8'
        except Exception:
            return 'utf-8'

    def _analyze_repository(self, repo_path: str) -> Dict[str, Any]:
        """Analyze repository."""
        try:
            analysis = {
                "summary": "",
                "strengths": [],
                "weaknesses": [],
                "recommendations": [],
                "metrics": {
                    "complexity": [],
                    "quality": [],
                    "patterns": [],
                    "dependencies": [],
                    "security": [],
                    "performance": []
                },
                "last_updated": datetime.utcnow().isoformat(),
                "analysis_version": "1.0"
            }
            
            # Analyze repository structure
            self._analyze_structure(repo_path, analysis)
            
            # Analyze code complexity and patterns
            self._analyze_code(repo_path, analysis)
            
            # Analyze project dependencies
            self._analyze_dependencies(repo_path, analysis)
            
            # Identify and store best practices
            self._identify_best_practices(repo_path, analysis)
            
            return analysis
        
        except Exception as e:
            logger.error(f"Error analyzing repository: {str(e)}")
            raise

    def _analyze_structure(self, repo_path: str, analysis: Dict[str, Any]) -> None:
        """Analyze repository structure."""
        try:
            structure = []
            for root, dirs, files in os.walk(repo_path):
                rel_path = os.path.relpath(root, repo_path)
                if rel_path == ".":
                    rel_path = ""

                # Create file info objects for each file
                file_infos = []
                for file in files:
                    file_path = os.path.join(root, file)
                    file_infos.append({
                        "path": os.path.join(rel_path, file),
                        "type": "file",
                        "size": os.path.getsize(file_path),
                        "language": self._detect_language(file_path),
                        "last_modified": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
                    })

                # Create directory info objects for each directory
                dir_infos = []
                for dir_name in dirs:
                    dir_path = os.path.join(root, dir_name)
                    dir_infos.append({
                        "path": os.path.join(rel_path, dir_name),
                        "type": "directory",
                        "size": 0,  # Directories don't have a size
                        "last_modified": datetime.fromtimestamp(os.path.getmtime(dir_path)).isoformat()
                    })

                # Add all items to structure
                structure.extend(file_infos)
                structure.extend(dir_infos)
            
            analysis["structure"] = structure
            logger.info(f"Repository structure analyzed")
        
        except Exception as e:
            logger.error(f"Error analyzing structure: {str(e)}")
            raise

    def _analyze_code(self, repo_path: str, analysis: Dict[str, Any]) -> None:
        """Analyze repository code."""
        try:
            metrics = analysis["metrics"]
            
            for root, _, files in os.walk(repo_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, repo_path)
                    
                    # Skip binary files and large files
                    if self._is_text_file(file_path) and os.path.getsize(file_path) < 1024 * 1024:
                        try:
                            with open(file_path, "r", encoding="utf-8") as f:
                                content = f.read()
                                
                            # Add code metrics
                            metrics["complexity"].append({
                                "category": "lines_of_code",
                                "value": len(content.splitlines()),
                                "description": f"Number of lines in {rel_path}",
                                "trend": None
                            })
                            logger.debug(f"Analyzed file: {rel_path}")
                        except Exception as e:
                            logger.warning(f"Error analyzing file {rel_path}: {str(e)}")
                            continue
            
            # Update analysis with findings
            analysis["summary"] = f"Repository contains {len(metrics['complexity'])} files"
            analysis["last_updated"] = datetime.utcnow().isoformat()
            logger.info(f"Code analysis complete")
        
        except Exception as e:
            logger.error(f"Error analyzing code: {str(e)}")
            raise

    def _analyze_dependencies(self, repo_path: str, analysis: Dict[str, Any]) -> None:
        """Analyze repository dependencies."""
        try:
            metrics = analysis["metrics"]
            
            # Check for package files
            package_files = {
                "requirements.txt": "python",
                "package.json": "node",
                "pom.xml": "java",
                "build.gradle": "java",
                "Gemfile": "ruby",
                "composer.json": "php"
            }
            
            for file, lang in package_files.items():
                file_path = os.path.join(repo_path, file)
                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        metrics["dependencies"].append({
                            "name": file,
                            "version": "1.0",  # This should be parsed from the file
                            "type": lang
                        })
                        logger.info(f"Found {lang} dependencies in {file}")
            
            # Update analysis with findings
            analysis["last_updated"] = datetime.utcnow().isoformat()
            logger.info(f"Dependency analysis complete")
        
        except Exception as e:
            logger.error(f"Error analyzing dependencies: {str(e)}")
            raise

    def _identify_best_practices(self, repo_path: str, analysis: Dict[str, Any]) -> None:
        """Identify best practices in repository."""
        try:
            strengths = analysis["strengths"]
            weaknesses = analysis["weaknesses"]
            recommendations = analysis["recommendations"]
            
            # Check for common best practices
            if os.path.exists(os.path.join(repo_path, ".gitignore")):
                strengths.append("Uses version control best practices with .gitignore")
                logger.info(f"Found .gitignore best practice")
            else:
                weaknesses.append("Missing .gitignore file")
                recommendations.append("Add a .gitignore file to manage ignored files")
            
            if os.path.exists(os.path.join(repo_path, "README.md")):
                strengths.append("Has documentation with README.md")
                logger.info(f"Found README.md best practice")
            else:
                weaknesses.append("Missing README.md file")
                recommendations.append("Add a README.md file to document the project")
            
            # Update analysis with findings
            analysis["last_updated"] = datetime.utcnow().isoformat()
            logger.info(f"Best practices analysis complete")
        
        except Exception as e:
            logger.error(f"Error identifying best practices: {str(e)}")
            raise
