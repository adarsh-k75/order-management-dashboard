from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Create database engine
# pool_pre_ping ensures stale connections are recycled gracefully
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# SessionLocal will be instantiated to handle database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative ORM models
Base = declarative_base()
