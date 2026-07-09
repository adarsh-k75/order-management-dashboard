from typing import Generator
from app.database.database import SessionLocal

def get_db() -> Generator:
    """Dependency that yields a database session and ensures it is closed after request lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
