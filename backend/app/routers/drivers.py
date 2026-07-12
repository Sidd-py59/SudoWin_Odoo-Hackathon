from datetime import date, datetime
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..auth import AuthUser
from ..dependencies import require_roles
from ._responses import route_stub

router = APIRouter(prefix="/drivers", tags=["Drivers"])


class DriverStatus(str, Enum):
    available = "available"
    on_trip = "on_trip"
    off_duty = "off_duty"
    suspended = "suspended"


class DriverCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    license_number: str = Field(min_length=4, max_length=40)
    license_category: str = Field(min_length=1, max_length=20)
    license_expiry: date
    contact_number: str = Field(min_length=8, max_length=20)
    safety_score: float = Field(ge=0, le=100)
    status: DriverStatus = DriverStatus.available


class DriverUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    license_number: Optional[str] = Field(default=None, min_length=4, max_length=40)
    license_category: Optional[str] = Field(default=None, min_length=1, max_length=20)
    license_expiry: Optional[date] = None
    contact_number: Optional[str] = Field(default=None, min_length=8, max_length=20)
    safety_score: Optional[float] = Field(default=None, ge=0, le=100)
    status: Optional[DriverStatus] = None


@router.get("")
def list_drivers(
    status: Optional[DriverStatus] = None,
    current_user: AuthUser = Depends(
        require_roles(["dispatcher", "fleet_manager", "safety_officer"])
    ),
) -> dict:
    return route_stub("drivers", "list", status=status, actor=current_user.email)


@router.post("")
def create_driver(
    payload: DriverCreate,
    current_user: AuthUser = Depends(require_roles(["dispatcher", "safety_officer"])),
) -> dict:
    return route_stub("drivers", "create", payload=payload.model_dump(), actor=current_user.email)


@router.get("/available")
def list_available_drivers(
    current_user: AuthUser = Depends(require_roles(["dispatcher", "fleet_manager"])),
) -> dict:
    return route_stub(
        "drivers",
        "available",
        status=DriverStatus.available,
        actor=current_user.email,
    )


@router.get("/{driver_id}")
def get_driver(
    driver_id: int,
    current_user: AuthUser = Depends(
        require_roles(["dispatcher", "fleet_manager", "safety_officer"])
    ),
) -> dict:
    return route_stub("drivers", "get", driver_id=driver_id, actor=current_user.email)


@router.put("/{driver_id}")
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    current_user: AuthUser = Depends(require_roles(["dispatcher", "safety_officer"])),
) -> dict:
    return route_stub(
        "drivers",
        "update",
        driver_id=driver_id,
        payload=payload.model_dump(exclude_unset=True),
        actor=current_user.email,
    )


@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    current_user: AuthUser = Depends(require_roles(["safety_officer"])),
) -> dict:
    return route_stub(
        "drivers",
        "delete",
        driver_id=driver_id,
        deleted_at=datetime.utcnow(),
        actor=current_user.email,
    )

