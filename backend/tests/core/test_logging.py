"""Test logging configuration."""
import pytest
import structlog
import logging
from pathlib import Path

from src.core.logging import setup_logging, get_logger
from src.config.settings import settings

def test_setup_logging(temp_dir, monkeypatch):
    """Test logging setup."""
    # Override log directory
    monkeypatch.setattr(settings, "log_dir", temp_dir)
    
    # Setup logging
    setup_logging()
    
    # Check log file creation
    log_file = temp_dir / "app.log"
    assert log_file.exists()
    
    # Test logging
    logger = get_logger("test")
    logger.info("test message", key="value")
    
    # Check log file content
    content = log_file.read_text()
    assert "test message" in content
    assert "key" in content
    assert "value" in content
    assert "level" in content
    assert "timestamp" in content

def test_get_logger():
    """Test logger creation."""
    logger = get_logger("test_logger")
    
    assert isinstance(logger, structlog.BoundLogger)
    assert logger._logger.name == "test_logger"

def test_log_levels(temp_dir, monkeypatch):
    """Test different log levels."""
    # Override log directory and level
    monkeypatch.setattr(settings, "log_dir", temp_dir)
    monkeypatch.setattr(settings, "log_level", "DEBUG")
    
    # Setup logging
    setup_logging()
    logger = get_logger("test")
    
    # Test all log levels
    logger.debug("debug message")
    logger.info("info message")
    logger.warning("warning message")
    logger.error("error message")
    
    # Check log file content
    content = temp_dir.joinpath("app.log").read_text()
    assert "debug message" in content
    assert "info message" in content
    assert "warning message" in content
    assert "error message" in content

def test_structured_logging(temp_dir, monkeypatch):
    """Test structured logging format."""
    # Override log directory
    monkeypatch.setattr(settings, "log_dir", temp_dir)
    
    # Setup logging
    setup_logging()
    logger = get_logger("test")
    
    # Log with context
    logger.info(
        "test event",
        user_id="123",
        action="login",
        status="success",
        duration_ms=150
    )
    
    # Check log file content
    content = temp_dir.joinpath("app.log").read_text()
    assert "test event" in content
    assert "user_id" in content
    assert "action" in content
    assert "status" in content
    assert "duration_ms" in content
