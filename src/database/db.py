from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

SQLALCHEMY_DATABASE_URL = 'sqlite:///./elswitcher.db'

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={'check_same_thread': False},
)


Base = declarative_base()


def get_session():
    """
    Create session dependency.
    Used to handle each request individually
    """
    with Session(engine, autoflush=False) as session:
        yield session
