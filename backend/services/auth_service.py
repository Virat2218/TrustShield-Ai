import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional
import bcrypt

# Patch passlib compatibility with bcrypt 4.x
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("about", (), {"__version__": getattr(bcrypt, "__version__", "4.2.0")})

import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db, User, PasswordResetToken

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

INSECURE_PLACEHOLDER_SECRETS = {
    "trustshield-ai-secure-jwt-secret-key-phase2-2026",
    "trustshield-ai-super-secret-jwt-key-change-in-production-2026",
    "trustshield-ai-jwt-secret-key",
    "secret",
    "jwtsecret",
    "jwt_secret",
    "jwt_secret_key",
    "changeme",
    "change-in-production",
    "change_in_production",
    "your-secret-key",
    "your-jwt-secret-key",
    "yoursecretkey",
    "12345678901234567890123456789012",
}

_test_jwt_secret: Optional[str] = None

def set_test_jwt_secret(secret: Optional[str]):
    """Sets an explicit, isolated JWT secret for test suites."""
    global _test_jwt_secret
    _test_jwt_secret = secret

def is_test_environment() -> bool:
    """Returns True if running under a known automated test runner."""
    import sys
    return (
        os.getenv("TESTING", "").lower() in ("true", "1", "yes")
        or os.getenv("ENVIRONMENT", "").lower() == "test"
        or "pytest" in sys.modules
    )

def validate_jwt_secret(secret: Optional[str] = None, enforce_non_test: bool = False) -> str:
    """
    Validates JWT_SECRET_KEY for non-test operation.
    Fails with a clear RuntimeError if the secret is:
      - missing or empty
      - shorter than 32 characters (256 bits)
      - a known placeholder, example, or repository-known value.
    Does NOT print, log, or leak the secret value.
    """
    if is_test_environment() and not enforce_non_test and not secret:
        # In test mode, allow isolated explicit or generated test secret
        env_secret = os.getenv("JWT_SECRET_KEY")
        if env_secret and env_secret.strip():
            secret = env_secret
        elif _test_jwt_secret:
            return _test_jwt_secret
        else:
            return "test-only-ephemeral-jwt-secret-key-32chars-min"

    raw_secret = secret if secret is not None else os.getenv("JWT_SECRET_KEY")
    if not raw_secret or not raw_secret.strip():
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY environment variable is not set. "
            "A strong cryptographically secure secret (minimum 32 characters) is required. "
            "Generate one with: python3 -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )

    raw_secret = raw_secret.strip()

    if len(raw_secret) < 32:
        raise RuntimeError(
            f"CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY is too short ({len(raw_secret)} characters). "
            "A minimum of 32 characters (256 bits) is required for secure HMAC-SHA256 signing."
        )

    lowered = raw_secret.lower()
    if lowered in INSECURE_PLACEHOLDER_SECRETS or any(
        placeholder in lowered
        for placeholder in ("change-in-production", "change_in_production", "your-secret", "example-secret")
    ):
        raise RuntimeError(
            "CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY is set to a known placeholder or insecure default. "
            "You must generate a unique, cryptographically random secret before starting the server. "
            "Generate one with: python3 -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )

    return raw_secret

def get_jwt_secret() -> str:
    """Returns the validated JWT signing secret without silent fallback."""
    if is_test_environment() and _test_jwt_secret:
        return _test_jwt_secret
    return validate_jwt_secret()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    secret = get_jwt_secret()
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        secret = get_jwt_secret()
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check token version for session invalidation (e.g. after password reset)
    token_version = payload.get("token_version")
    if token_version is not None:
        current_version = getattr(user, "token_version", 1) or 1
        if token_version != current_version:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired or was invalidated. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    return user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """Allows anonymous scans, but binds to user if logged in."""
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return None
        token_version = payload.get("token_version")
        if token_version is not None:
            current_version = getattr(user, "token_version", 1) or 1
            if token_version != current_version:
                return None
        return user
    except Exception:
        return None

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensures the authenticated user has administrative privileges."""
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource.",
        )
    return current_user

def generate_password_reset_token(user: User, db: Session, expires_minutes: int = 15) -> str:
    """
    Generates a cryptographically secure, single-use reset token.
    Stores only the SHA-256 hash in the database, associates with the user,
    and invalidates any prior unconsumed tokens for this user.
    """
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    # Invalidate previous unconsumed tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).update({"used": True}, synchronize_session=False)

    now = datetime.utcnow()
    expires_at = now + timedelta(minutes=expires_minutes)

    reset_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        used=False,
        created_at=now,
    )
    db.add(reset_token)
    db.commit()

    return raw_token

def verify_and_consume_reset_token(raw_token: str, new_password: str, db: Session) -> User:
    """
    Validates token hash, checks expiration and single-use status,
    updates password, increments token_version to invalidate prior sessions,
    and marks token as used atomically.
    """
    if not raw_token or not raw_token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used reset token.",
        )

    token_hash = hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
    ).first()

    if not reset_token or reset_token.used or reset_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used reset token.",
        )

    user = reset_token.user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used reset token.",
        )

    # Atomic consumption and session invalidation
    reset_token.used = True
    user.hashed_password = get_password_hash(new_password)
    user.token_version = (getattr(user, "token_version", 1) or 1) + 1

    db.commit()
    db.refresh(user)
    return user
