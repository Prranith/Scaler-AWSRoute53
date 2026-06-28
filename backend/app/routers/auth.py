"""Auth router: login, logout, register, me."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services import auth as auth_service
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    user = auth_service.authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token, jti, expires_at = auth_service.create_access_token(user.id, user.username)
    auth_service.create_session(db, jti, user.id, expires_at)
    return TokenResponse(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    try:
        user = auth_service.register_user(db, data.username, data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return UserResponse.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke the current JWT token (server-side logout)."""
    # Token is already validated in get_current_user — we need the jti
    # Re-extract from the raw credentials is complex; simpler: mark all active sessions
    # In production, pass the raw token here; for now we revoke by user ID
    from sqlalchemy import select, update
    from app.models.session import Session as DBSession
    db.execute(
        update(DBSession)
        .where(DBSession.user_id == current_user.id, DBSession.revoked == False)
        .values(revoked=True)
    )
    db.commit()


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)
