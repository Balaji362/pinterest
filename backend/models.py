"""
SQLAlchemy ORM models for the Pinterest-inspired platform.
Defines the database schema for users and posts.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    """User account model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)  # Stores hashed password
    profile_image = Column(String(255), default="")  # URL to profile image
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: a user can have many posts
    posts = relationship("Post", back_populates="owner")


class Post(Base):
    """Pin/Post model — represents a single pinned image."""
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    image_url = Column(String(500), nullable=False)  # Path to uploaded image
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship: each post belongs to a user
    owner = relationship("User", back_populates="posts")


class SavedPost(Base):
    """Model representing a user saving/pinning a post."""
    __tablename__ = "saved_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Unique constraint so a user cannot save the same post multiple times
    __table_args__ = (UniqueConstraint('user_id', 'post_id', name='_user_saved_post_uc'),)

    # Relationships
    user = relationship("User")
    post = relationship("Post")
