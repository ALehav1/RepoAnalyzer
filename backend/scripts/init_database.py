"""Initialize the database with proper schema."""
import asyncio
import logging
from sqlalchemy import text

from src.database import engine, init_db
from src.models.base import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def verify_schema():
    """Verify the database schema."""
    async with engine.begin() as conn:
        # Check tables
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = result.fetchall()
        logger.info(f"Tables in DB: {tables}")
        
        # Check repositories table schema
        result = await conn.execute(text("PRAGMA table_info(repositories)"))
        columns = result.fetchall()
        logger.info("Repositories table schema:")
        for col in columns:
            logger.info(f"  {col}")

async def main():
    """Initialize database and verify schema."""
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized successfully")
        
        # Verify schema
        await verify_schema()
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
