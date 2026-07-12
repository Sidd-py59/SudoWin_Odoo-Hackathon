from pydantic import BaseModel, EmailStr

from fastapi import APIRouter

from app.routers._responses import route_stub

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
def login(payload: LoginRequest) -> dict:
    return route_stub("auth", "login", email=payload.email)


@router.get("/me")
def get_current_user() -> dict:
    return route_stub("auth", "me")
