"""
Seed default admin, teacher, and parent accounts for local/testing use.
Run from backend directory:  py -m scripts.seed_users

Uses any valid email format (no real inbox needed). Change passwords after first login in production.
"""
import asyncio
import sys
from pathlib import Path

# Ensure backend app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.models  # noqa: F401 - register all models with Base
from sqlalchemy import select
from app.database import AsyncSessionLocal, init_db
from app.models.user import User, UserRole
from app.core.security import get_password_hash

DEFAULT_USERS = [
    {
        "email": "admin@poppinz.com",
        "password": "Admin123",
        "full_name": "Admin",
        "role": UserRole.ADMIN,
    },
    {
        "email": "teacher@poppinz.com",
        "password": "Teacher1",
        "full_name": "Teacher",
        "role": UserRole.TEACHER,
    },
    {
        "email": "parent@poppinz.com",
        "password": "Parent123",
        "full_name": "Parent",
        "role": UserRole.PARENT,
    },
]


async def seed_users():
    await init_db()
    async with AsyncSessionLocal() as session:
        for u in DEFAULT_USERS:
            result = await session.execute(select(User).where(User.email == u["email"]))
            if result.scalar_one_or_none():
                print(f"  Skip (already exists): {u['email']}")
                continue
            user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
            )
            session.add(user)
            print(f"  Created: {u['email']} (role: {u['role'].value})")
        await session.commit()
    print("Done. You can log in with any of the emails above and their passwords.")


if __name__ == "__main__":
    asyncio.run(seed_users())
