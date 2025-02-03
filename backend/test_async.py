"""Test basic async functionality."""
import os
import asyncio
import pytest
import logging
import uvloop
from asyncio import TimeoutError

# Enable asyncio debug mode
os.environ['PYTHONASYNCIODEBUG'] = '1'

# Configure logging with more detail
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def mock_async_operation():
    """Mock async operation that returns immediately."""
    logger.info("Starting mock operation")
    await asyncio.sleep(0)  # Force a context switch
    logger.info("Mock operation completed")
    return "success"

@pytest.mark.asyncio
async def test_basic_async():
    """Test that basic async operations work."""
    logger.info("Starting basic async test")
    try:
        # Add timeout to prevent infinite stalls
        result = await asyncio.wait_for(mock_async_operation(), timeout=5.0)
        assert result == "success"
        logger.info("Test completed successfully")
    except TimeoutError:
        logger.error("Test timed out after 5 seconds!")
        raise
    except Exception as e:
        logger.error(f"Test failed with error: {str(e)}")
        raise

if __name__ == "__main__":
    logger.info("Starting main")
    # Use uvloop
    uvloop.install()
    try:
        asyncio.run(test_basic_async())
        logger.info("Main completed successfully")
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
    except Exception as e:
        logger.error(f"Main failed with error: {str(e)}")
        raise
