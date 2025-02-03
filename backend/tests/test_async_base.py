"""Test basic async functionality without external dependencies.

This module provides a minimal test case for async operations to help diagnose
potential issues with the async/await implementation in the codebase.
"""
import asyncio
import logging
import sys
from asyncio import TimeoutError
from typing import Any, Callable, Coroutine

import pytest

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)


class AsyncTestError(Exception):
    """Exception raised when an async test operation fails."""
    pass


async def async_operation(delay: float = 0.1) -> str:
    """A simple async operation that returns after a delay.
    
    Args:
        delay: Time in seconds to wait before returning
        
    Returns:
        str: Success message
        
    Raises:
        AsyncTestError: If the operation times out or fails
    """
    try:
        logger.info(f"Starting async operation with {delay}s delay")
        await asyncio.sleep(delay)
        logger.info("Async operation completed successfully")
        return "success"
    except Exception as e:
        logger.error(f"Async operation failed: {str(e)}", exc_info=True)
        raise AsyncTestError(f"Failed to complete async operation: {str(e)}")


async def run_with_timeout(
    coro: Callable[..., Coroutine[Any, Any, str]],
    timeout: float = 5.0,
    **kwargs: Any
) -> str:
    """Run an async operation with a timeout.
    
    Args:
        coro: Async function to run
        timeout: Maximum time to wait in seconds
        **kwargs: Arguments to pass to coro
        
    Returns:
        str: Result from the coroutine
        
    Raises:
        AsyncTestError: If the operation times out or fails
    """
    try:
        logger.info(f"Running {coro.__name__} with {timeout}s timeout")
        result = await asyncio.wait_for(coro(**kwargs), timeout=timeout)
        logger.info(f"Operation completed with result: {result}")
        return result
    except TimeoutError:
        logger.error(f"Operation timed out after {timeout}s")
        raise AsyncTestError(f"Operation timed out after {timeout}s")
    except Exception as e:
        logger.error(f"Operation failed: {str(e)}", exc_info=True)
        raise AsyncTestError(f"Operation failed: {str(e)}")


@pytest.mark.asyncio
async def test_basic_async_operation() -> None:
    """Test that a basic async operation completes successfully."""
    logger.info("Starting basic async operation test")
    result = await run_with_timeout(async_operation, delay=0.1)
    assert result == "success"
    logger.info("Basic async test completed successfully")


@pytest.mark.asyncio
async def test_async_operation_timeout() -> None:
    """Test that async operation timeout is handled correctly."""
    logger.info("Starting async timeout test")
    with pytest.raises(AsyncTestError) as exc_info:
        await run_with_timeout(async_operation, timeout=0.1, delay=1.0)
    assert "timed out" in str(exc_info.value)
    logger.info("Timeout test completed successfully")


if __name__ == "__main__":
    logger.info("Starting main")
    try:
        asyncio.run(test_basic_async_operation())
        logger.info("Main completed successfully")
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
    except Exception as e:
        logger.error(f"Main failed with error: {str(e)}", exc_info=True)
        sys.exit(1)
