from src.database.db import SessionLocal


def get_db():
    """
    Create session dependency.
    Used to handle requests individually
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


"""
All endpoints that interact with the database should be of the form

@app.method("/path", response_model= <schemas.ModelName> or <list[schemas.ModelName]>)
def endpoint_function(params, db: Session = Depends(get_db)):
    ...
    return ...

So that a new Session will be created to handle each request.
See example in tests/database_test.py
Read more https://fastapi.tiangolo.com/tutorial/sql-databases/#main-fastapi-app
"""
