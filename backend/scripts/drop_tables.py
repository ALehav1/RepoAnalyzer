"""Drop all database tables."""
import asyncio
from src.models.base import Base
from src.database import engine

async def drop_tables():
    """Drop all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

if __name__ == "__main__":
    asyncio.run(drop_tables())
