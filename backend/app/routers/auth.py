from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from ..auth import AuthUser, authenticate_user, create_access_token
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: AuthUser


@router.post("/login")
def login(payload: LoginRequest) -> LoginResponse:
    user = authenticate_user(payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return LoginResponse(
        access_token=create_access_token(user),
        role=user.role,
        user=user,
    )


@router.get("/me")
def read_current_user(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    return current_user

