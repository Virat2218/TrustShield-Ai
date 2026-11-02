from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from database import get_db, User
from schemas.analysis import (
    UserRegisterRequest,
    UserLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordConfirmRequest,
    GenericMessageResponse,
    UserProfileResponse,
    AuthTokenResponse,
)
from services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    generate_password_reset_token,
    verify_and_consume_reset_token,
)
from services.mail_service import send_password_reset_email

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
        token_version=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "token_version": getattr(user, "token_version", 1) or 1,
        }
    )
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

    token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "token_version": getattr(user, "token_version", 1) or 1,
        }
    )
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user),
    )

@router.post("/forgot-password", response_model=GenericMessageResponse)
@router.post("/request-password-reset", response_model=GenericMessageResponse)
def request_password_reset(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates a password reset request.
    Always returns the identical generic success response whether or not the account exists,
    preventing user enumeration. If account exists, delivers a single-use token via mail service.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        raw_token = generate_password_reset_token(user, db)
        send_password_reset_email(user.email, raw_token)

    return GenericMessageResponse(
        status="ok",
        message="If an account matches that email address, instructions to reset your password have been sent.",
    )

@router.post("/reset-password", response_model=GenericMessageResponse)
@router.post("/reset-password-confirm", response_model=GenericMessageResponse)
def confirm_password_reset(request: ResetPasswordConfirmRequest, db: Session = Depends(get_db)):
    """
    Confirms a password reset with a valid, non-expired, single-use token.
    Atomically updates the password, marks token used, and invalidates all prior sessions.
    """
    verify_and_consume_reset_token(request.token, request.new_password, db)
    return GenericMessageResponse(
        status="ok",
        message="Password has been successfully updated. All active sessions have been invalidated. You can now log in with your new password.",
    )

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

