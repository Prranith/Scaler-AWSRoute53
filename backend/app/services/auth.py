"""Authentication service: JWT creation, password hashing, session management."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.config import settings
from app.models.user import User
from app.models.session import Session as DBSession

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, username: str) -> tuple[str, str, datetime]:
    """Create a JWT access token. Returns (token, jti, expires_at)."""
    jti = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "username": username,
        "jti": jti,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti, expires_at


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises JWTError on failure."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.execute(select(User).where(User.username == username)).scalar_one_or_none()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.get(User, user_id)


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_session(db: Session, jti: str, user_id: str, expires_at: datetime) -> DBSession:
    session = DBSession(jti=jti, user_id=user_id, expires_at=expires_at)
    db.add(session)
    db.commit()
    return session


def revoke_session(db: Session, jti: str) -> bool:
    session = db.get(DBSession, jti)
    if session:
        session.revoked = True
        db.commit()
        return True
    return False


def is_token_revoked(db: Session, jti: str) -> bool:
    session = db.get(DBSession, jti)
    return session is None or session.revoked


def register_user(db: Session, username: str, email: str, password: str) -> User:
    from sqlalchemy import select as sa_select
    from sqlalchemy.exc import IntegrityError
    
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise ValueError("Username or email already exists")
    return user
