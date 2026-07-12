from datetime import date, datetime
from enum import Enum
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.routers._responses import route_stub

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
def list_drivers(status: Optional[DriverStatus] = None) -> dict:
    return route_stub("drivers", "list", status=status)


@router.post("")
def create_driver(payload: DriverCreate) -> dict:
    return route_stub("drivers", "create", payload=payload.model_dump())


@router.get("/available")
def list_available_drivers() -> dict:
    return route_stub("drivers", "available", status=DriverStatus.available)


@router.get("/{driver_id}")
def get_driver(driver_id: int) -> dict:
    return route_stub("drivers", "get", driver_id=driver_id)


@router.put("/{driver_id}")
def update_driver(driver_id: int, payload: DriverUpdate) -> dict:
    return route_stub(
        "drivers",
        "update",
        driver_id=driver_id,
        payload=payload.model_dump(exclude_unset=True),
    )


@router.delete("/{driver_id}")
def delete_driver(driver_id: int) -> dict:
    return route_stub("drivers", "delete", driver_id=driver_id, deleted_at=datetime.utcnow())
