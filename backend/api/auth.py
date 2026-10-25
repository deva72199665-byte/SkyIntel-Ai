from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth.security import create_access_token
from database.session import get_db
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from services.user_service import authenticate_user, create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = create_user(db, payload)
    return TokenResponse(access_token=create_access_token(user.id), user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = authenticate_user(db, payload)
    return TokenResponse(access_token=create_access_token(user.id), user=UserResponse.model_validate(user))
