"""User CRUD (Admin only) + Teacher create parent."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse, CreateParentBody
from app.core.security import get_password_hash
from app.core.dependencies import RequireAdmin, RequireAdminOrTeacher

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/create-parent", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_parent(
    body: CreateParentBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
) -> User:
    """Create a parent account. Teacher or admin only (uses JWT)."""
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        email=body.email,
        hashed_password=get_password_hash(body.password),
        full_name=body.name,
        role=UserRole.PARENT,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[User]:
    """List all users (admin only)."""
    result = await db.execute(select(User).offset(skip).limit(limit).order_by(User.id))
    return list(result.scalars().all())


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdmin,
) -> User:
    """Get user by ID (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdmin,
) -> User:
    """Create a new user (admin only)."""
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        email=body.email,
        hashed_password=get_password_hash(body.password),
        full_name=body.full_name,
        role=body.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    body: UserUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdmin,
) -> User:
    """Update user (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if body.email is not None:
        r = await db.execute(select(User).where(User.email == body.email))
        other = r.scalar_one_or_none()
        if other and other.id != user_id:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = body.email
    if body.full_name is not None:
        user.full_name = body.full_name
    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.password is not None:
        user.hashed_password = get_password_hash(body.password)
    await db.flush()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdmin,
) -> None:
    """Delete user (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await db.delete(user)
    await db.flush()
