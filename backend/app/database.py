"""Database connection and session management."""
from collections.abc import AsyncGenerator
from urllib.parse import urlparse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()


async def ensure_mysql_database(url: str) -> None:
    """Create MySQL database if it does not exist (call from lifespan before init_db)."""
    if not url.startswith("mysql"):
        return
    parsed = urlparse(url)
    db_name = (parsed.path or "/").strip("/")
    if not db_name:
        return
    # Connect to default 'mysql' DB to run CREATE DATABASE
    base_url = url.replace("/" + db_name, "/mysql")
    temp_engine = create_async_engine(
        base_url,
        pool_pre_ping=True,
        pool_size=1,
        max_overflow=0,
    )
    try:
        async with temp_engine.begin() as conn:
            await conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
    finally:
        await temp_engine.dispose()


_engine_kw: dict = {"echo": settings.debug}
if settings.database_url.startswith("sqlite"):
    _engine_kw["connect_args"] = {"check_same_thread": False}
else:
    _engine_kw["pool_pre_ping"] = True
    _engine_kw["pool_size"] = 5
    _engine_kw["max_overflow"] = 10

engine = create_async_engine(settings.database_url, **_engine_kw)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables. Call on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
