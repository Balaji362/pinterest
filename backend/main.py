"""
FastAPI Application Entry Point.
Sets up the app, CORS, static files, and includes all route modules.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routes import auth, posts

# ─── Create database tables ─────────────────────────────────
# This will create all tables defined in models.py if they don't exist yet
Base.metadata.create_all(bind=engine)

# ─── Initialize FastAPI app ─────────────────────────────────
app = FastAPI(
    title="Pinterest Inspired Platform API",
    description="REST API for a Pinterest-inspired image sharing platform",
    version="1.0.0"
)

# ─── CORS Middleware ─────────────────────────────────────────
# Allow the React frontend (running on port 5173) to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for production (can be restricted later)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files ───────────────────────────────────────────
# Serve uploaded images from the /uploads endpoint
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ─── Include Routers ────────────────────────────────────────
app.include_router(auth.router)
app.include_router(posts.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "Pinterest Inspired Platform API is running!"}
