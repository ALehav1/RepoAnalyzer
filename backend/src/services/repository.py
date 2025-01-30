import asyncio
import logging
import os
import json
import ssl
import certifi
from typing import Dict, List, Optional, Any
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from git import Repo
from git.exc import GitCommandError
import aiohttp
from datetime import datetime
import uuid
import shutil
import magic
import chardet
import traceback

from src.models.base import Repository, File
from src.api.stream import analysis_stream

logger = logging.getLogger(__name__)

class RepositoryException(Exception):
    """Base exception for repository operations."""
    pass

class RepositoryNotFoundError(RepositoryException):
    """Raised when a repository is not found."""
    pass

class RepositoryCloneError(RepositoryException):
    """Raised when repository cloning fails."""
    pass

class FileProcessingError(RepositoryException):
    """Raised when file processing fails."""
    pass

class RepositoryService:
    def __init__(self, db: AsyncSession):
        """Initialize repository service.
        
        Args:
            db (AsyncSession): Database session
        """
        self.db = db
        self.ssl_context = ssl.create_default_context(cafile=certifi.where())
        
        # Ensure data directories exist
        self.data_dir = Path("data")
        self.repos_dir = self.data_dir / "repos"
        self.data_dir.mkdir(exist_ok=True)
        self.repos_dir.mkdir(exist_ok=True)
        logger.info(f"Using data directory: {self.data_dir.absolute()}")
        logger.info(f"Using repos directory: {self.repos_dir.absolute()}")

    async def process_repository(self, repo_id: str) -> None:
        """Process a repository asynchronously.
        
        Args:
            repo_id (str): Repository ID to process
            
        Raises:
            RepositoryNotFoundError: If repository is not found
            RepositoryCloneError: If repository cloning fails
            FileProcessingError: If file processing fails
        """
        logger.info(f"Starting repository processing for {repo_id}")
        
        # Get repository
        repo = await self.get_repository(repo_id)
        if not repo:
            raise RepositoryNotFoundError(f"Repository {repo_id} not found")
        
        try:
            # Update repository status
            repo.analysis_status = "processing"
            repo.analysis_progress = 0.0
            await self.db.commit()
            
            # Set up repository directory
            repo_dir = self.repos_dir / repo_id
            if repo_dir.exists():
                logger.info(f"Removing existing repository directory: {repo_dir}")
                shutil.rmtree(repo_dir)
            repo_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created repository directory: {repo_dir}")
            
            try:
                logger.info(f"Cloning repository from {repo.url}")
                git_repo = Repo.clone_from(repo.url, repo_dir)
                repo.local_path = str(repo_dir)
                repo.is_valid = True
                repo.analysis_progress = 0.3
                await self.db.commit()
                logger.info("Repository cloned successfully")
            except GitCommandError as e:
                logger.error(f"Failed to clone repository: {str(e)}")
                repo.is_valid = False
                repo.analysis_status = "failed"
                repo.analysis_progress = 0.0
                await self.db.commit()
                raise RepositoryCloneError(f"Failed to clone repository: {str(e)}")

            # Process repository files
            try:
                logger.info("Starting file processing")
                await self._process_files(repo_id, repo_dir)
                repo.analysis_progress = 0.6
                await self.db.commit()
                logger.info("File processing completed")
            except Exception as e:
                logger.error(f"Failed to process files: {str(e)}")
                logger.error(traceback.format_exc())
                repo.is_valid = False
                repo.analysis_status = "failed"
                repo.analysis_progress = 0.0
                await self.db.commit()
                raise FileProcessingError(str(e))
            
            # Generate repository analysis
            try:
                logger.info("Generating repository analysis")
                analysis_result = await self._generate_repo_analysis(repo_id)
                repo.analysis = analysis_result
                repo.last_analyzed = datetime.utcnow()
                repo.analysis_status = "completed"
                repo.analysis_progress = 1.0
                await self.db.commit()
                logger.info("Repository analysis completed")
            except Exception as e:
                logger.error(f"Failed to generate analysis: {str(e)}")
                logger.error(traceback.format_exc())
                repo.analysis_status = "failed"
                repo.analysis_progress = 0.0
                await self.db.commit()
                raise
                
        except Exception as e:
            logger.error(f"Repository processing failed: {str(e)}")
            logger.error(traceback.format_exc())
            repo.analysis_status = "failed"
            repo.analysis_progress = 0.0
            await self.db.commit()
            raise

    async def _process_files(self, repo_id: str, repo_dir: Path) -> None:
        """Process all files in the repository.
        
        Args:
            repo_id (str): Repository ID
            repo_dir (Path): Path to repository directory
            
        Raises:
            FileProcessingError: If file processing fails
        """
        logger.info(f"Starting file processing for repository {repo_id}")
        try:
            # Delete existing files
            logger.info("Deleting existing files...")
            await self.db.execute(delete(File).where(File.repository_id == repo_id))
            await self.db.commit()
            logger.info("Existing files deleted")

            file_count = 0
            error_count = 0

            # Process new files
            for root, _, files in os.walk(repo_dir):
                if '.git' in root:
                    continue

                for filename in files:
                    try:
                        file_path = Path(root) / filename
                        relative_path = file_path.relative_to(repo_dir)
                        logger.debug(f"Processing file: {relative_path}")

                        # Get file metadata
                        stat = file_path.stat()
                        mime = magic.Magic(mime=True)
                        file_type = mime.from_file(str(file_path))
                        logger.debug(f"File type: {file_type}")

                        # Read file content if it's a text file
                        content = None
                        if 'text' in file_type or file_type in ['application/json', 'application/javascript', 'application/x-python']:
                            try:
                                with open(file_path, 'rb') as f:
                                    raw_content = f.read()
                                    encoding = chardet.detect(raw_content)['encoding'] or 'utf-8'
                                    content = raw_content.decode(encoding)
                                    logger.debug(f"Successfully read file content with encoding {encoding}")
                            except Exception as e:
                                logger.warning(f"Failed to read file content: {str(e)}")
                                error_count += 1

                        # Create file record
                        file_record = File(
                            id=str(uuid.uuid4()),
                            repository_id=repo_id,
                            path=str(relative_path),
                            name=filename,
                            size=stat.st_size,
                            mime_type=file_type,
                            content=content,
                            created_at=datetime.fromtimestamp(stat.st_ctime),
                            updated_at=datetime.fromtimestamp(stat.st_mtime)
                        )
                        self.db.add(file_record)
                        file_count += 1

                        if file_count % 100 == 0:
                            await self.db.commit()
                            logger.info(f"Processed {file_count} files")

                    except Exception as e:
                        logger.error(f"Failed to process file {filename}: {str(e)}")
                        error_count += 1

            await self.db.commit()
            logger.info(f"File processing completed. Processed {file_count} files with {error_count} errors")

        except Exception as e:
            logger.error(f"Failed to process files: {str(e)}")
            logger.error(traceback.format_exc())
            raise FileProcessingError(str(e))

    async def _generate_repo_analysis(self, repo_id: str) -> Dict[str, Any]:
        """Generate repository-level analysis.
        
        Args:
            repo_id (str): Repository ID
            
        Returns:
            Dict[str, Any]: Analysis results
            
        Raises:
            RepositoryNotFoundError: If repository is not found
        """
        logger.info(f"Starting repository analysis for {repo_id}")
        
        try:
            # Get repository
            repo = await self.get_repository(repo_id)
            if not repo:
                raise RepositoryNotFoundError(f"Repository {repo_id} not found")
                
            # Get repository files
            files = await self.get_repository_files(repo_id)
            
            # Generate analysis
            analysis = {
                "file_count": len(files),
                "total_size": sum(f.size for f in files),
                "file_types": {},
                "file_extensions": {},
                "largest_files": [],
                "newest_files": [],
                "oldest_files": []
            }
            
            # Analyze files
            for file in files:
                # Count file types
                file_type = file.mime_type or "unknown"
                analysis["file_types"][file_type] = analysis["file_types"].get(file_type, 0) + 1
                
                # Count file extensions
                ext = Path(file.path).suffix.lower()
                if ext:
                    analysis["file_extensions"][ext] = analysis["file_extensions"].get(ext, 0) + 1
                
                # Track largest files
                analysis["largest_files"].append({
                    "path": file.path,
                    "size": file.size
                })
                
                # Track newest/oldest files
                file_info = {
                    "path": file.path,
                    "created_at": file.created_at.isoformat() if file.created_at else None,
                    "updated_at": file.updated_at.isoformat() if file.updated_at else None
                }
                analysis["newest_files"].append(file_info)
                analysis["oldest_files"].append(file_info)
            
            # Sort and limit lists
            analysis["largest_files"].sort(key=lambda x: x["size"], reverse=True)
            analysis["largest_files"] = analysis["largest_files"][:10]
            
            analysis["newest_files"].sort(key=lambda x: x["updated_at"] or "", reverse=True)
            analysis["newest_files"] = analysis["newest_files"][:10]
            
            analysis["oldest_files"].sort(key=lambda x: x["created_at"] or "")
            analysis["oldest_files"] = analysis["oldest_files"][:10]
            
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to generate repository analysis: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    async def create(self, data: Dict[str, Any]) -> Repository:
        """Create a new repository."""
        logger.info(f"Creating repository with data: {data}")
        try:
            repo = Repository(**data)
            self.db.add(repo)
            await self.db.commit()
            logger.info(f"Created repository {repo.id}")
            return repo
        except Exception as e:
            logger.error(f"Failed to create repository: {str(e)}")
            await self.db.rollback()
            raise

    async def create_repository(self, url: str) -> Repository:
        """Create a new repository entry.
        
        Args:
            url (str): Repository URL
            
        Returns:
            Repository: Created repository instance
            
        Raises:
            ValueError: If repository URL is invalid
        """
        logger.info(f"Creating repository for URL: {url}")
        try:
            # Create repository record
            repo = Repository(
                id=str(uuid.uuid4()),
                url=url,
                is_valid=True,
                analysis_status="pending",
                analysis_progress=0.0
            )
            self.db.add(repo)
            await self.db.commit()
            logger.info(f"Created repository {repo.id}")
            return repo
        except Exception as e:
            logger.error(f"Failed to create repository: {str(e)}")
            await self.db.rollback()
            raise

    async def get(self, repo_id: str) -> Optional[Repository]:
        """Get repository by ID."""
        try:
            stmt = select(Repository).where(Repository.id == repo_id)
            result = await self.db.execute(stmt)
            repo = result.scalar_one_or_none()
            if not repo:
                logger.warning(f"Repository {repo_id} not found")
                return None
            return repo
        except Exception as e:
            logger.error(f"Failed to get repository {repo_id}: {str(e)}")
            raise

    async def get_by_url(self, url: str) -> Optional[Repository]:
        """Get repository by URL."""
        try:
            stmt = select(Repository).where(Repository.url == url)
            result = await self.db.execute(stmt)
            repo = result.scalar_one_or_none()
            if not repo:
                logger.warning(f"Repository with URL {url} not found")
                return None
            return repo
        except Exception as e:
            logger.error(f"Failed to get repository by URL {url}: {str(e)}")
            raise

    async def get_repository(self, repo_id: str) -> Repository:
        """Get a repository by ID.
        
        Args:
            repo_id (str): Repository ID
            
        Returns:
            Repository: Repository instance
            
        Raises:
            RepositoryNotFoundError: If repository is not found
        """
        repo = await self.get(repo_id)
        if not repo:
            raise RepositoryNotFoundError(f"Repository {repo_id} not found")
        return repo

    async def get_repository_files(self, repo_id: str) -> List[File]:
        """Get all files for a repository.
        
        Args:
            repo_id (str): Repository ID
            
        Returns:
            List[File]: List of repository files
            
        Raises:
            RepositoryNotFoundError: If repository is not found
        """
        try:
            stmt = select(File).where(File.repository_id == repo_id)
            result = await self.db.execute(stmt)
            files = result.scalars().all()
            return files
        except Exception as e:
            logger.error(f"Failed to get repository files for {repo_id}: {str(e)}")
            raise

    async def get_repository_by_url(self, url: str) -> Optional[Repository]:
        """Get repository by URL.
        
        Args:
            url (str): Repository URL
            
        Returns:
            Optional[Repository]: Repository instance or None if not found
        """
        return await self.get_by_url(url)
