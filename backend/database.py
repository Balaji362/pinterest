"""
Database configuration and session management.
Uses SQLAlchemy to connect to a local PostgreSQL database.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL connection string
# Reads from environment variable in production, falls back to local DB for development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:root@127.0.0.1:5432/pinterest_db")

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# SessionLocal class — each instance is a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session per request.
    Automatically closes the session when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
