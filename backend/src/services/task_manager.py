"""Task manager for handling background jobs."""

import uuid
from typing import Dict, Any, Optional, Callable, Awaitable
from datetime import datetime
import threading
import queue
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from ..database import get_db, async_session_maker

logger = logging.getLogger(__name__)

class Task:
    """Represents a background task."""
    
    def __init__(self, task_type: str, params: Dict[str, Any], func: Optional[Callable[..., Awaitable[Any]]] = None):
        """Initialize a task."""
        self.id = str(uuid.uuid4())
        self.type = task_type
        self.params = params
        self.func = func
        self.status = "pending"
        self.result = None
        self.error = None
        self.created_at = datetime.utcnow()
        self.started_at = None
        self.completed_at = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary."""
        return {
            "id": self.id,
            "type": self.type,
            "status": self.status,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

class TaskManager:
    """Manages background tasks."""
    
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        """Create singleton instance."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(TaskManager, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """Initialize task manager."""
        if getattr(self, '_initialized', False):
            return
            
        self._initialized = True
        self.tasks: Dict[str, Task] = {}
        self.task_queue = asyncio.Queue()
        self.executor = ThreadPoolExecutor(max_workers=4)
        self._start_background_task()
        logger.info("TaskManager initialized")

    def _start_background_task(self):
        """Start background task processing."""
        asyncio.create_task(self._process_tasks())

    def enqueue_repo_analysis(self, func: Callable[..., Awaitable[Any]], repo_id: str, timeout: int = 3600) -> str:
        """Enqueue a repository analysis task.
        
        Args:
            func: Async function to execute
            repo_id: Repository ID
            timeout: Task timeout in seconds
            
        Returns:
            str: Task ID
        """
        task = Task(
            task_type="analyze_repository",
            params={"repo_id": repo_id, "timeout": timeout},
            func=func
        )
        self.tasks[task.id] = task
        asyncio.create_task(self.task_queue.put(task))
        logger.info(f"Enqueued repository analysis task {task.id} for repo {repo_id}")
        return task.id

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID."""
        return self.tasks.get(task_id)

    async def _process_tasks(self):
        """Process tasks in the queue."""
        while True:
            try:
                task = await self.task_queue.get()
                if task.status == "pending":
                    await self._execute_task(task)
                self.task_queue.task_done()
            except Exception as e:
                logger.error(f"Error processing task: {str(e)}")
                logger.error(f"Stack trace: ", exc_info=True)

    async def _execute_task(self, task: Task):
        """Execute a single task."""
        try:
            task.status = "running"
            task.started_at = datetime.utcnow()
            logger.info(f"Executing task {task.id} of type {task.type}")
            
            # Execute task based on type
            if task.type == "analyze_repository" and task.func:
                try:
                    # Create a new database session for this task
                    async with async_session_maker() as db:
                        try:
                            task.result = await task.func(task.params["repo_id"])
                            task.status = "completed"
                            task.completed_at = datetime.utcnow()
                            logger.info(f"Task {task.id} completed successfully")
                        except Exception as e:
                            task.status = "failed"
                            task.error = str(e)
                            task.completed_at = datetime.utcnow()
                            logger.error(f"Task {task.id} failed: {str(e)}")
                            logger.error(f"Stack trace: ", exc_info=True)
                            await db.rollback()
                            raise
                        finally:
                            await db.close()
                except Exception as e:
                    task.status = "failed"
                    task.error = str(e)
                    task.completed_at = datetime.utcnow()
                    logger.error(f"Task {task.id} failed: {str(e)}")
                    logger.error(f"Stack trace: ", exc_info=True)
                    raise
            else:
                raise ValueError(f"Unknown task type: {task.type}")
                
        except Exception as e:
            task.status = "failed"
            task.error = str(e)
            task.completed_at = datetime.utcnow()
            logger.error(f"Task {task.id} failed: {str(e)}")
            logger.error(f"Stack trace: ", exc_info=True)
            raise

    def clear_completed_tasks(self, max_age_hours: int = 24):
        """Clear completed tasks older than max_age_hours."""
        now = datetime.utcnow()
        to_remove = []
        for task_id, task in self.tasks.items():
            if task.status in ["completed", "failed"]:
                age = now - task.completed_at
                if age.total_seconds() > max_age_hours * 3600:
                    to_remove.append(task_id)
        
        for task_id in to_remove:
            del self.tasks[task_id]
