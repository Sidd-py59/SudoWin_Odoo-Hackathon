from datetime import datetime, timedelta, timezone
import os
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

SECRET_KEY = os.getenv("TRANSITOPS_SECRET_KEY", "dev-only-change-before-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthUser(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str


class TokenData(BaseModel):
    user_id: int
    email: EmailStr
    role: str


DEMO_USERS = {
    "admin@transitops.dev": {
        "id": 1,
        "email": "admin@transitops.dev",
        "full_name": "TransitOps Admin",
        "role": "admin",
        "password": "admin123",
    },
    "dispatcher@transitops.dev": {
        "id": 2,
        "email": "dispatcher@transitops.dev",
        "full_name": "Dispatch Lead",
        "role": "dispatcher",
        "password": "dispatch123",
    },
    "fleet@transitops.dev": {
        "id": 3,
        "email": "fleet@transitops.dev",
        "full_name": "Fleet Manager",
        "role": "fleet_manager",
        "password": "fleet123",
    },
    "safety@transitops.dev": {
        "id": 4,
        "email": "safety@transitops.dev",
        "full_name": "Safety Officer",
        "role": "safety_officer",
        "password": "safety123",
    },
    "finance@transitops.dev": {
        "id": 5,
        "email": "finance@transitops.dev",
        "full_name": "Finance Analyst",
        "role": "financial_analyst",
        "password": "finance123",
    },
}


def verify_password(plain_password: str, password: str) -> bool:
    # Demo users use plain passwords until DB seed data provides hashes.
    if password.startswith("$2b$"):
        return pwd_context.verify(plain_password, password)
    return plain_password == password


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def authenticate_user(email: str, password: str) -> Optional[AuthUser]:
    user = DEMO_USERS.get(email.lower())
    if not user or not verify_password(password, user["password"]):
        return None
    return AuthUser(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
    )


def create_access_token(user: AuthUser) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "exp": expires_at,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> TokenData:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return TokenData(
        user_id=int(payload["sub"]),
        email=payload["email"],
        role=payload["role"],
    )


def get_user_by_email(email: str) -> Optional[AuthUser]:
    user = DEMO_USERS.get(email.lower())
    if not user:
        return None
    return AuthUser(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
    )


