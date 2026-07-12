from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import Trip, TripStatus
from ..services.trip_service import (
    cancel_trip as cancel_trip_service,
    complete_trip as complete_trip_service,
    create_trip as create_trip_service,
    dispatch_trip as dispatch_trip_service,
    get_trip_or_404,
    serialize_trip,
)

router = APIRouter(prefix="/trips", tags=["Trips"])


class TripStatusValue(str, Enum):
    draft = "draft"
    dispatched = "dispatched"
    completed = "completed"
    cancelled = "cancelled"


class TripCreate(BaseModel):
    trip_code: str = Field(min_length=2, max_length=32)
    source: str = Field(min_length=2, max_length=100)
    destination: str = Field(min_length=2, max_length=100)
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    cargo_weight_kg: float = Field(gt=0)
    planned_distance_km: float = Field(gt=0)


class TripDispatchRequest(BaseModel):
    vehicle_id: int
    driver_id: int


class TripCompleteRequest(BaseModel):
    actual_distance_km: float = Field(gt=0)
    final_odometer: float = Field(gt=0)
    fuel_liters: Optional[float] = Field(default=None, gt=0)
    fuel_cost: Optional[float] = Field(default=None, ge=0)
    toll_cost: Optional[float] = Field(default=None, ge=0)
    other_cost: Optional[float] = Field(default=None, ge=0)


@router.get("")
def list_trips(
    status_filter: Optional[TripStatusValue] = Query(default=None, alias="status"),
    current_user: AuthUser = Depends(
        require_roles(["dispatcher", "fleet_manager", "financial_analyst"])
    ),
    db: Session = Depends(get_db),
) -> list[dict]:
    query = db.query(Trip)
    if status_filter:
        query = query.filter(Trip.status == status_filter.value)
    return [serialize_trip(trip) for trip in query.order_by(Trip.id.desc()).all()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    current_user: AuthUser = Depends(require_roles(["dispatcher"])),
    db: Session = Depends(get_db),
) -> dict:
    try:
        trip = create_trip_service(db, payload, current_user.id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Trip code already exists")
    return serialize_trip(trip)


@router.get("/{trip_id}")
def get_trip(
    trip_id: int,
    current_user: AuthUser = Depends(
        require_roles(["dispatcher", "fleet_manager", "financial_analyst"])
    ),
    db: Session = Depends(get_db),
) -> dict:
    return serialize_trip(get_trip_or_404(db, trip_id))


@router.post("/{trip_id}/dispatch")
def dispatch_trip(
    trip_id: int,
    payload: TripDispatchRequest,
    current_user: AuthUser = Depends(require_roles(["dispatcher"])),
    db: Session = Depends(get_db),
) -> dict:
    trip = dispatch_trip_service(db, trip_id, payload.vehicle_id, payload.driver_id, current_user.id)
    return serialize_trip(trip)


@router.post("/{trip_id}/complete")
def complete_trip(
    trip_id: int,
    payload: TripCompleteRequest,
    current_user: AuthUser = Depends(require_roles(["dispatcher"])),
    db: Session = Depends(get_db),
) -> dict:
    trip = complete_trip_service(
        db,
        trip_id,
        payload.actual_distance_km,
        payload.final_odometer,
        payload.fuel_liters,
        payload.fuel_cost,
        payload.toll_cost,
        payload.other_cost,
        current_user.id,
    )
    return serialize_trip(trip)


@router.post("/{trip_id}/cancel")
def cancel_trip(
    trip_id: int,
    current_user: AuthUser = Depends(require_roles(["dispatcher"])),
    db: Session = Depends(get_db),
) -> dict:
    trip = cancel_trip_service(db, trip_id, current_user.id)
    return serialize_trip(trip)
