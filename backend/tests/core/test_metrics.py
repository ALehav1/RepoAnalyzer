"""Test prometheus metrics."""
import pytest
from prometheus_client import REGISTRY
import time
import asyncio

from src.core.metrics import (
    HTTP_REQUEST_COUNT,
    HTTP_REQUEST_DURATION,
    REPOSITORY_COUNT,
    ANALYSIS_DURATION,
    ANALYSIS_ERRORS,
    track_time
)

def test_http_metrics():
    """Test HTTP metrics."""
    # Test request counter
    HTTP_REQUEST_COUNT.labels(method="GET", endpoint="/health", status=200).inc()
    
    # Get metric value
    counter = REGISTRY.get_sample_value(
        "http_request_total",
        {"method": "GET", "endpoint": "/health", "status": "200"}
    )
    assert counter == 1.0

def test_repository_metrics():
    """Test repository metrics."""
    # Test repository counter
    REPOSITORY_COUNT.labels(status="active").set(5)
    
    # Get metric value
    gauge = REGISTRY.get_sample_value(
        "repository_total",
        {"status": "active"}
    )
    assert gauge == 5.0

def test_analysis_metrics():
    """Test analysis metrics."""
    # Test error counter
    ANALYSIS_ERRORS.labels(error_type="timeout").inc()
    
    # Get metric value
    counter = REGISTRY.get_sample_value(
        "analysis_errors_total",
        {"error_type": "timeout"}
    )
    assert counter == 1.0

@pytest.mark.asyncio
async def test_track_time_async():
    """Test track_time decorator with async function."""
    @track_time(ANALYSIS_DURATION.labels(status="success"))
    async def slow_operation():
        await asyncio.sleep(0.1)
        return "done"
    
    # Execute operation
    result = await slow_operation()
    assert result == "done"
    
    # Check histogram
    histogram = REGISTRY.get_sample_value(
        "analysis_duration_seconds_count",
        {"status": "success"}
    )
    assert histogram == 1.0

def test_track_time_sync():
    """Test track_time decorator with sync function."""
    @track_time(HTTP_REQUEST_DURATION.labels(method="GET", endpoint="/test"))
    def quick_operation():
        time.sleep(0.1)
        return "done"
    
    # Execute operation
    result = quick_operation()
    assert result == "done"
    
    # Check histogram
    histogram = REGISTRY.get_sample_value(
        "http_request_duration_seconds_count",
        {"method": "GET", "endpoint": "/test"}
    )
    assert histogram == 1.0
