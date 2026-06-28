"""FastAPI dependency injection: DB session, current user, auth guard."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth import decode_token, get_user_by_id, is_token_revoked

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Mock authentication: bypass token validation and return the seeded user."""
    # Always return the seeded admin user from the database
    user = db.query(User).first()
    if not user:
        # Fallback mock user if database is completely empty
        user = User(
            id="admin-uuid-placeholder",
            email="admin@example.com",
            username="admin",
            hashed_password="",
            is_active=True,
        )
    return user
