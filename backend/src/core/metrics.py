"""Prometheus metrics."""
from prometheus_client import Counter, Histogram, Gauge
import time
import asyncio
from functools import wraps
from typing import Any, Callable

# API Metrics
HTTP_REQUEST_COUNT = Counter(
    "http_request_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"]
)

HTTP_REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"]
)

# Repository Metrics
REPOSITORY_COUNT = Gauge(
    "repository_total",
    "Total number of repositories",
    ["status"]
)

ANALYSIS_DURATION = Histogram(
    "analysis_duration_seconds",
    "Repository analysis duration in seconds",
    ["status"]
)

ANALYSIS_ERRORS = Counter(
    "analysis_errors_total",
    "Total number of analysis errors",
    ["error_type"]
)

# Task Queue Metrics
TASK_COUNT = Counter(
    "task_total",
    "Total number of tasks",
    ["status"]
)

TASK_DURATION = Histogram(
    "task_duration_seconds",
    "Task duration in seconds",
    ["task_type"]
)

# Database Metrics
DB_CONNECTION_COUNT = Gauge(
    "db_connections",
    "Number of active database connections"
)

DB_QUERY_DURATION = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["operation"]
)

def track_time(metric: Histogram) -> Callable:
    """Decorator to track function execution time."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.time()
            try:
                return await func(*args, **kwargs)
            finally:
                duration = time.time() - start_time
                metric.observe(duration)
        
        @wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time.time()
            try:
                return func(*args, **kwargs)
            finally:
                duration = time.time() - start_time
                metric.observe(duration)
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator
