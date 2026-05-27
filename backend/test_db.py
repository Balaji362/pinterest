import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://pinterest_db_bjul_user:HB4xhkb4MDTb7XHiUuqiGF69RyiDx8OP@dpg-d8beaf6gvqtc73ahmrag-a.singapore-postgres.render.com/pinterest_db_bjul"

try:
    print("Connecting to DB...")
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Success!")
        result = conn.execute(text("SELECT * FROM users LIMIT 1"))
        print("Table exists!")
except Exception as e:
    print(f"Error: {e}")
