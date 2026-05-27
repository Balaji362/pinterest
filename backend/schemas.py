"""
Pydantic schemas for request validation and response serialization.
These define the shape of data flowing in and out of API endpoints.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ─── User Schemas ────────────────────────────────────────────

class UserCreate(BaseModel):
    """Schema for user registration request."""
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    """Schema for user login request."""
    email: str
    password: str


class UserResponse(BaseModel):
    """Schema for user data in API responses."""
    id: int
    username: str
    email: str
    profile_image: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True  # Allows reading data from ORM models


# ─── Post Schemas ────────────────────────────────────────────

class PostResponse(BaseModel):
    """Schema for post data in API responses."""
    id: int
    title: str
    description: Optional[str] = ""
    image_url: str
    user_id: int
    created_at: datetime
    owner: Optional[UserResponse] = None  # Nested user info

    class Config:
        from_attributes = True


# ─── Auth Schemas ────────────────────────────────────────────

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str
    user: UserResponse
