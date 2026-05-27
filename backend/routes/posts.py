"""
Post routes — handles creating and retrieving posts/pins.
"""

import os
import sys
import uuid

# Ensure the backend root is on sys.path so imports work from this subdirectory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Post, User, SavedPost
from schemas import PostResponse
from auth import get_current_user

router = APIRouter(tags=["Posts"])

# Directory where uploaded images are stored
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


@router.get("/posts", response_model=list[PostResponse])
def get_posts(search: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get all posts, optionally filtered by search query.
    Returns posts in reverse chronological order (newest first).
    """
    query = db.query(Post)

    # If search query provided, filter by title or description
    if search:
        query = query.filter(
            Post.title.ilike(f"%{search}%") | Post.description.ilike(f"%{search}%")
        )

    posts = query.order_by(Post.created_at.desc()).all()
    return posts


@router.get("/posts/saved", response_model=list[PostResponse])
def get_saved_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all posts saved by the current user.
    Requires authentication.
    """
    saved_relations = db.query(SavedPost).filter(SavedPost.user_id == current_user.id).all()
    posts = [relation.post for relation in saved_relations if relation.post]
    return posts


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """
    Get a single post by ID.
    Returns 404 if the post doesn't exist.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return post


@router.post("/posts", response_model=PostResponse)
async def create_post(
    title: str = Form(...),
    description: str = Form(""),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new post with an uploaded image.
    Requires authentication. Saves the image to the uploads/ folder
    and stores the file path in the database.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image type. Allowed: JPEG, PNG, GIF, WebP"
        )

    # Generate a unique filename to prevent collisions
    file_extension = image.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Ensure uploads directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Save the uploaded file
    with open(file_path, "wb") as f:
        content = await image.read()
        f.write(content)

    # Create the post record in the database
    new_post = Post(
        title=title,
        description=description,
        image_url=f"/uploads/{unique_filename}",
        user_id=current_user.id
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return new_post


@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a post (title, description, and/or image).
    Requires authentication and that the current user owns the post.
    Deletes the old image file if a new one is uploaded.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this post"
        )

    if title is not None:
        post.title = title
    if description is not None:
        post.description = description
    if image is not None:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image type. Allowed: JPEG, PNG, GIF, WebP"
            )
        
        # Delete the old image file from disk
        if post.image_url:
            old_filename = post.image_url.split("/")[-1]
            old_file_path = os.path.join(UPLOAD_DIR, old_filename)
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except Exception as e:
                    print(f"Error removing old image: {e}")

        # Save new image
        file_extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)

        post.image_url = f"/uploads/{unique_filename}"

    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a post and its associated image file from disk.
    Requires authentication and that the current user owns the post.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )

    # Delete the image file from disk
    if post.image_url:
        filename = post.image_url.split("/")[-1]
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing image file: {e}")

    db.delete(post)
    db.commit()
    return


@router.post("/posts/{post_id}/save")
def save_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a post for the current user.
    Requires authentication.
    """
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already saved
    existing_save = db.query(SavedPost).filter(
        SavedPost.user_id == current_user.id,
        SavedPost.post_id == post_id
    ).first()
    if existing_save:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post already saved"
        )
    
    new_save = SavedPost(user_id=current_user.id, post_id=post_id)
    db.add(new_save)
    db.commit()
    return {"message": "Post saved successfully"}


@router.delete("/posts/{post_id}/save", status_code=status.HTTP_204_NO_CONTENT)
def unsave_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unsave a post for the current user.
    Requires authentication.
    """
    # Find the save relation
    save_relation = db.query(SavedPost).filter(
        SavedPost.user_id == current_user.id,
        SavedPost.post_id == post_id
    ).first()
    if not save_relation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved post not found"
        )
    
    db.delete(save_relation)
    db.commit()
    return


