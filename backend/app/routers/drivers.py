from datetime import date, datetime
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import Driver

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


def serialize_driver(driver: Driver) -> dict:
    return {
        "id": driver.id,
        "name": driver.name,
        "license_number": driver.license_number,
        "license_category": driver.license_category,
        "license_expiry": driver.license_expiry,
        "contact_number": driver.contact_number,
        "safety_score": driver.safety_score,
        "status": driver.status,
        "created_at": driver.created_at,
        "license_expired": driver.license_expiry < date.today(),
    }


def get_driver_or_404(db: Session, driver_id: int) -> Driver:
    driver = db.get(Driver, driver_id)
    if driver is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return driver


@router.get("")
def list_drivers(
    status_filter: Optional[DriverStatus] = Query(default=None, alias="status"),
    current_user: AuthUser = Depends(
        require_roles(["dispatcher", "fleet_manager", "safety_officer"])
    ),
    db: Session = Depends(get_db),
) -> list[dict]:
    query = db.query(Driver)
    if status_filter:
        query = query.filter(Driver.status == status_filter.value)
    return [serialize_driver(driver) for driver in query.order_by(Driver.id).all()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: DriverCreate,
    current_user: AuthUser = Depends(require_roles(["dispatcher", "safety_officer"])),
    db: Session = Depends(get_db),
) -> dict:
    driver = Driver(**payload.model_dump(mode="json"))
    db.add(driver)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Driver license number already exists",
        )
    db.refresh(driver)
    return serialize_driver(driver)


@router.get("/available")
def list_available_drivers(
    current_user: AuthUser = Depends(require_roles(["dispatcher", "fleet_manager"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    drivers = (
        db.query(Driver)
        .filter(Driver.status == DriverStatus.available.value)
        .filter(Driver.license_expiry >= date.today())
        .order_by(Driver.id)
        .all()
    )
    return [serialize_driver(driver) for driver in drivers]


@router.get("/{driver_id}")
def get_driver(
    driver_id: int,
    current_user: AuthUser = Depends(
        require_roles(["dispatcher", "fleet_manager", "safety_officer"])
    ),
    db: Session = Depends(get_db),
) -> dict:
    return serialize_driver(get_driver_or_404(db, driver_id))


@router.put("/{driver_id}")
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    current_user: AuthUser = Depends(require_roles(["dispatcher", "safety_officer"])),
    db: Session = Depends(get_db),
) -> dict:
    driver = get_driver_or_404(db, driver_id)
    for key, value in payload.model_dump(exclude_unset=True, mode="json").items():
        setattr(driver, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Driver license number already exists",
        )
    db.refresh(driver)
    return serialize_driver(driver)


@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    current_user: AuthUser = Depends(require_roles(["safety_officer"])),
    db: Session = Depends(get_db),
) -> dict:
    driver = get_driver_or_404(db, driver_id)
    if driver.status == DriverStatus.on_trip.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a driver that is currently on trip",
        )
    db.delete(driver)
    db.commit()
    return {"id": driver_id, "deleted_at": datetime.utcnow()}
