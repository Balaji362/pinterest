import os
import sys

from database import SessionLocal
from models import User
from auth import hash_password

db = SessionLocal()

try:
    print("Hashing password...")
    pwd = hash_password("password123")
    print("Hash:", pwd)
    
    print("Creating user...")
    new_user = User(
        username="test_local_register",
        email="test_local_register@example.com",
        password=pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print("Success! User ID:", new_user.id)
except Exception as e:
    print("Error:", type(e).__name__, str(e))
finally:
    db.close()
