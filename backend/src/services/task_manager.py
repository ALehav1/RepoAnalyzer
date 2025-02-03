"""Task manager for handling background tasks."""

import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Callable, Optional
import uuid
from pathlib import Path
from datetime import datetime
import queue
from sqlalchemy.orm import Session

from ..database import get_db, SessionLocal
from ..models.base import Repository  # Import Repository model

# Configure logging with absolute paths
log_dir = Path(__file__).parent.parent.parent / "logs"
log_dir.mkdir(exist_ok=True)

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Configure task manager logger
logger = logging.getLogger(__name__)
log_file = log_dir / "task_manager.log"
file_handler = logging.FileHandler(str(log_file))
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)
logger.setLevel(logging.INFO)

logger.info("Task manager logger initialized")

class Task:
    """Represents a background task."""
    
    def __init__(self, task_type: str, params: Dict[str, Any], func: Optional[Callable] = None):
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
            
        logger.info("Initializing TaskManager...")
        self._initialized = True
        self.tasks: Dict[str, Task] = {}
        self.task_queue = queue.Queue()
        self._start_background_task()
        logger.info("TaskManager initialized")

    def _start_background_task(self):
        """Start background task processing."""
        def process_tasks():
            logger.info("Starting background task processor")
            while True:
                try:
                    logger.info("Waiting for task...")
                    task = self.task_queue.get()
                    if task:
                        logger.info(f"Processing task {task.id}")
                        try:
                            logger.info(f"Executing task {task.id} with params: {task.params}")
                            self._execute_task(task)
                            logger.info(f"Task {task.id} completed with status: {task.status}")
                        except Exception as e:
                            logger.error(f"Error executing task {task.id}: {str(e)}", exc_info=True)
                except Exception as e:
                    logger.error(f"Error in task processor: {str(e)}", exc_info=True)
                finally:
                    self.task_queue.task_done()

        thread = threading.Thread(target=process_tasks, daemon=True)
        thread.start()
        logger.info("Background task processor started")

    def enqueue_repo_analysis(self, func: Callable, repo_id: str, timeout: int = 3600) -> str:
        """Enqueue a repository analysis task."""
        task = Task(
            task_type="analyze_repository",
            params={"repo_id": repo_id, "timeout": timeout},
            func=func
        )
        self.tasks[task.id] = task
        self.task_queue.put(task)
        logger.info(f"Enqueued repository analysis task {task.id} for repo {repo_id}")
        return task.id

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID."""
        return self.tasks.get(task_id)

    def _execute_task(self, task: Task):
        """Execute a task."""
        db = None
        try:
            task.status = "running"
            task.started_at = datetime.utcnow()
            logger.info(f"Starting task {task.id} execution")
            
            # Create new database session for this task
            db = SessionLocal()
            logger.info(f"Created database session for task {task.id}")
            
            try:
                if task.func:
                    # Pass the database session to the function
                    result = task.func(db, task.params["repo_id"])
                    task.result = result
                    task.status = "completed"
                    logger.info(f"Task {task.id} completed successfully")
                else:
                    task.error = "No task function provided"
                    task.status = "failed"
                    logger.error(f"Task {task.id} failed: No task function provided")
            except Exception as e:
                logger.exception(f"Task {task.id} failed: {str(e)}")
                task.error = str(e)
                task.status = "failed"
                
                # Try to update repository status on failure
                try:
                    repo = db.query(Repository).filter(Repository.id == task.params["repo_id"]).first()
                    if repo:
                        repo.analysis_status = "failed"
                        repo.analysis_progress = 0.0
                        db.commit()
                        logger.info(f"Updated repository {task.params['repo_id']} status to failed")
                except Exception as inner_e:
                    logger.error(f"Error updating repository status: {str(inner_e)}", exc_info=True)
            finally:
                if db:
                    db.close()
                    logger.info(f"Closed database session for task {task.id}")
                
            task.completed_at = datetime.utcnow()
            logger.info(f"Task {task.id} execution finished with status: {task.status}")
            
        except Exception as e:
            logger.exception(f"Error executing task {task.id}")
            task.error = str(e)
            task.status = "failed"
            task.completed_at = datetime.utcnow()
            if db:
                db.close()
                logger.info(f"Closed database session for task {task.id} after error")

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
