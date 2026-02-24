"""
Reset the SQLite DB and create fresh admin, teacher, parent users.
Run from backend directory:  py -m scripts.reset_and_seed

** Stop the backend first (Ctrl+C), then run this, then start the backend again. **

Use this if login fails with "Incorrect email or password" (e.g. after bcrypt changes).
"""
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings

settings = get_settings()
url = settings.database_url

if not url.startswith("sqlite"):
    print("Not using SQLite. To reset MySQL, delete and recreate the database manually.")
    sys.exit(1)

# Path is like sqlite+aiosqlite:///./playschool.db
db_path = url.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
if db_path.startswith("./"):
    db_path = Path(__file__).resolve().parent.parent / db_path[2:]
else:
    db_path = Path(db_path)

if db_path.exists():
    try:
        os.remove(db_path)
        print(f"Removed {db_path}")
    except Exception as e:
        print(f"Could not remove DB: {e}")
        sys.exit(1)
else:
    print("No existing DB file found.")

# Now run seed_users
from scripts.seed_users import seed_users

asyncio.run(seed_users())
print("\nDone. Try logging in with parent@poppinz.com / Parent123")
