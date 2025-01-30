"""Repository processing service."""

import logging
from pathlib import Path
import shutil
import asyncio
from datetime import datetime
import os
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from git import Repo
from git.exc import GitCommandError
import magic
import chardet
from typing import Optional, Dict, List
import uuid

from ..models.base import Repository, File, BestPractice
from ..database import get_db

logger = logging.getLogger(__name__)

class RepoProcessor:
    def __init__(self, db: AsyncSession, job_id: str = None):
        self.db = db
        self.job_id = job_id
        self.data_dir = Path("data")
        self.data_dir.mkdir(parents=True, exist_ok=True)

    async def process_repository(self, repo_id: str):
        """Process repository with detailed progress tracking."""
        repo_path = None
        repo = None
        try:
            # Get repository record
            repo = await self._get_repository(repo_id)
            if not repo:
                raise ValueError(f"Repository {repo_id} not found")

            # Update initial status
            await self._update_status(repo, "processing", 0, "Starting analysis")

            # Step 1: Clone Repository (20%)
            logger.info(f"[{repo_id}] Cloning repository...")
            try:
                repo_path = await self._clone_repository(repo)
                await self._update_status(repo, "processing", 20, "Repository cloned")
            except Exception as e:
                logger.error(f"[{repo_id}] Clone failed: {str(e)}")
                raise

            # Step 2: Analyze Structure (40%)
            logger.info(f"[{repo_id}] Analyzing structure...")
            try:
                structure = await self._analyze_structure(repo_path)
                await self._update_status(repo, "processing", 40, "Structure analyzed")
            except Exception as e:
                logger.error(f"[{repo_id}] Structure analysis failed: {str(e)}")
                raise

            # Step 3: Process Files (60%)
            logger.info(f"[{repo_id}] Processing files...")
            try:
                await self._process_files(repo, repo_path)
                await self._update_status(repo, "processing", 60, "Files processed")
            except Exception as e:
                logger.error(f"[{repo_id}] File processing failed: {str(e)}")
                raise

            # Step 4: Generate Analysis (80%)
            logger.info(f"[{repo_id}] Generating analysis...")
            try:
                analysis = await self._generate_analysis(repo, structure)
                await self._update_status(repo, "processing", 80, "Analysis generated")
            except Exception as e:
                logger.error(f"[{repo_id}] Analysis generation failed: {str(e)}")
                raise

            # Step 5: Extract Best Practices (100%)
            logger.info(f"[{repo_id}] Extracting best practices...")
            try:
                await self._extract_best_practices(repo, analysis)
                await self._update_status(repo, "completed", 100, "Analysis completed")
            except Exception as e:
                logger.error(f"[{repo_id}] Best practices extraction failed: {str(e)}")
                raise

            logger.info(f"[{repo_id}] Processing completed successfully")

        except Exception as e:
            error_msg = f"Processing failed: {str(e)}"
            logger.error(f"[{repo_id}] {error_msg}", exc_info=True)
            if repo:
                await self._update_status(repo, "failed", 0, error_msg)
            raise

        finally:
            # Clean up temporary files
            if repo_path and repo_path.exists():
                try:
                    shutil.rmtree(repo_path)
                except Exception as e:
                    logger.error(f"Failed to clean up repository files: {str(e)}")

    async def _get_repository(self, repo_id: str) -> Optional[Repository]:
        """Get repository by ID."""
        try:
            result = await self.db.execute(
                select(Repository).where(Repository.id == repo_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Failed to get repository {repo_id}: {str(e)}")
            raise

    async def _list_repositories(self) -> List[Repository]:
        """List all repositories."""
        try:
            result = await self.db.execute(select(Repository).order_by(Repository.created_at.desc()))
            return list(result.scalars().all())
        except Exception as e:
            logger.error(f"Error listing repositories: {str(e)}")
            raise

    async def _update_status(self, repo: Repository, status: str, progress: float, message: str):
        """Update repository status and progress."""
        try:
            repo.analysis_status = status
            repo.analysis_progress = progress
            repo.last_analyzed = datetime.utcnow()
            self.db.add(repo)
            await self.db.commit()
            logger.info(f"[{repo.id}] Status updated: {status} ({progress}%): {message}")
        except Exception as e:
            logger.error(f"Failed to update status: {str(e)}")
            await self.db.rollback()
            raise

    async def _clone_repository(self, repo: Repository) -> Path:
        """Clone repository to local storage."""
        repo_dir = None
        try:
            # Create unique directory for this clone
            repo_dir = self.data_dir / "repos" / repo.id
            if repo_dir.exists():
                shutil.rmtree(repo_dir)
            repo_dir.mkdir(parents=True, exist_ok=True)

            # Clone repository
            logger.info(f"Cloning {repo.url} to {repo_dir}")
            git_repo = Repo.clone_from(repo.url, repo_dir)
            repo.local_path = str(repo_dir)
            self.db.add(repo)
            await self.db.commit()

            return repo_dir

        except GitCommandError as e:
            logger.error(f"Git clone failed: {str(e)}")
            if repo_dir and repo_dir.exists():
                shutil.rmtree(repo_dir)
            raise

    async def _analyze_structure(self, repo_path: Path) -> dict:
        """Analyze repository structure."""
        try:
            structure = {
                "directories": [],
                "files": [],
                "languages": {},
                "total_size": 0,
                "file_count": 0
            }

            for root, dirs, files in os.walk(repo_path):
                if ".git" in root:
                    continue

                rel_root = os.path.relpath(root, repo_path)
                if rel_root != ".":
                    structure["directories"].append(rel_root)

                for file in files:
                    file_path = Path(root) / file
                    rel_path = os.path.relpath(file_path, repo_path)
                    
                    # Get file metadata
                    stat = file_path.stat()
                    mime = magic.Magic(mime=True)
                    file_type = mime.from_file(str(file_path))

                    file_info = {
                        "path": rel_path,
                        "size": stat.st_size,
                        "type": file_type,
                        "last_modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                    }

                    structure["files"].append(file_info)
                    structure["total_size"] += stat.st_size
                    structure["file_count"] += 1
                    structure["languages"][file_type] = structure["languages"].get(file_type, 0) + 1

            return structure

        except Exception as e:
            logger.error(f"Structure analysis failed: {str(e)}")
            raise

    async def _process_files(self, repo: Repository, repo_path: Path):
        """Process repository files."""
        try:
            # Delete existing files
            await self.db.execute(
                select(File).where(File.repository_id == repo.id).delete()
            )
            await self.db.commit()

            # Process each file
            for root, _, files in os.walk(repo_path):
                if ".git" in root:
                    continue

                for file_name in files:
                    file_path = Path(root) / file_name
                    rel_path = os.path.relpath(file_path, repo_path)

                    # Get file metadata
                    stat = file_path.stat()
                    mime = magic.Magic(mime=True)
                    file_type = mime.from_file(str(file_path))

                    # Create file record
                    file = File(
                        id=str(uuid.uuid4()),
                        repository_id=repo.id,
                        path=rel_path,
                        size=stat.st_size,
                        language=file_type,
                        last_modified=datetime.fromtimestamp(stat.st_mtime)
                    )

                    # Try to read file content
                    try:
                        with open(file_path, 'rb') as f:
                            raw_content = f.read()
                            if len(raw_content) > 0:
                                # Detect encoding
                                encoding = chardet.detect(raw_content)['encoding'] or 'utf-8'
                                try:
                                    content = raw_content.decode(encoding)
                                    if len(content) <= 1024 * 1024:  # Only store if less than 1MB
                                        file.content = content
                                except UnicodeDecodeError:
                                    pass  # Skip binary files
                    except Exception as e:
                        logger.warning(f"Could not read file {rel_path}: {str(e)}")

                    self.db.add(file)

            await self.db.commit()

        except Exception as e:
            logger.error(f"File processing failed: {str(e)}")
            await self.db.rollback()
            raise

    async def _generate_analysis(self, repo: Repository, structure: dict) -> dict:
        """Generate repository analysis."""
        try:
            # Basic analysis structure
            analysis = {
                "repository_id": repo.id,
                "metrics": {
                    "complexity": [],
                    "quality": [],
                    "patterns": [],
                    "dependencies": [],
                    "security": [],
                    "performance": []
                },
                "timestamp": datetime.utcnow().isoformat()
            }

            # Add some basic metrics
            analysis["metrics"]["complexity"].append({
                "category": "files",
                "value": structure["file_count"],
                "description": "Total number of files"
            })

            analysis["metrics"]["complexity"].append({
                "category": "size",
                "value": structure["total_size"],
                "description": "Total repository size in bytes"
            })

            return analysis

        except Exception as e:
            logger.error(f"Analysis generation failed: {str(e)}")
            raise

    async def _extract_best_practices(self, repo: Repository, analysis: dict):
        """Extract best practices from repository."""
        try:
            # Delete existing best practices
            await self.db.execute(
                select(BestPractice).where(BestPractice.repository_id == repo.id).delete()
            )
            await self.db.commit()

            # Add some basic best practices
            best_practice = BestPractice(
                id=str(uuid.uuid4()),
                repository_id=repo.id,
                title="File Organization",
                description="Repository has a clear file organization structure",
                category="organization",
                created_at=datetime.utcnow(),
                is_generalizable=True
            )

            self.db.add(best_practice)
            await self.db.commit()

        except Exception as e:
            logger.error(f"Best practices extraction failed: {str(e)}")
            await self.db.rollback()
            raise
