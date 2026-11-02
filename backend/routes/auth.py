from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from database import get_db, User
from schemas.analysis import (
    UserRegisterRequest,
    UserLoginRequest,
    PasswordResetRequest,
    UserProfileResponse,
    AuthTokenResponse,
)
from services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user with email, hashed password, and full name."""
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    hashed_pw = get_password_hash(request.password)
    user = User(
        email=request.email,
        hashed_password=hashed_pw,
        full_name=request.full_name or request.email.split("@")[0].capitalize(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user),
    )

@router.post("/login", response_model=AuthTokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates user credentials and returns a JWT access token."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user),
    )

@router.post("/reset-password")
def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Resets user password securely."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password has been successfully updated. You can now login with your new password."}

@router.get("/me", response_model=UserProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return UserProfileResponse.model_validate(current_user)

@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates user profile details (e.g. full name)."""
    if "full_name" in data:
        current_user.full_name = data["full_name"].strip()
        db.commit()
        db.refresh(current_user)
    return UserProfileResponse.model_validate(current_user)

