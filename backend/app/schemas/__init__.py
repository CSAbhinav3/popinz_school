"""Pydantic schemas for request/response validation."""
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    TokenPayload,
    LoginRequest,
)
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceMarkRequest,
    AttendanceResponse,
)
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate, FeedbackResponse
from app.schemas.qr import QRGenerateResponse, QRValidateRequest

__all__ = [
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "Token",
    "TokenPayload",
    "LoginRequest",
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "ActivityCreate",
    "ActivityUpdate",
    "ActivityResponse",
    "AttendanceCreate",
    "AttendanceMarkRequest",
    "AttendanceResponse",
    "FeedbackCreate",
    "FeedbackUpdate",
    "FeedbackResponse",
    "QRGenerateResponse",
    "QRValidateRequest",
]
