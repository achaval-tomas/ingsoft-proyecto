from src.database.db import SessionLocal


def get_db():
    """
    Create session dependency.
    Used to handle each request individually
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
