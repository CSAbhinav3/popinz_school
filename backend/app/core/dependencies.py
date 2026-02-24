"""FastAPI dependencies: current user, role checks."""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.database import get_db
from app.models.user import User, UserRole

# Prefer Bearer token (OAuth2PasswordBearer returns token from Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(http_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    """Get current user from JWT if present; otherwise None."""
    token = None
    if credentials:
        token = credentials.credentials
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        return None
    return user


async def get_current_user(
    user: Annotated[User | None, Depends(get_current_user_optional)],
) -> User:
    """Require authenticated user. Raise 401 if not logged in."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_roles(*allowed_roles: UserRole):
    """Dependency factory: require current user to have one of the given roles."""

    async def role_check(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_check


# Convenience dependencies
RequireAdmin = Annotated[User, Depends(require_roles(UserRole.ADMIN))]
RequireTeacher = Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.TEACHER))]
RequireParent = Annotated[User, Depends(require_roles(UserRole.PARENT))]
RequireAdminOrTeacher = Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.TEACHER))]
