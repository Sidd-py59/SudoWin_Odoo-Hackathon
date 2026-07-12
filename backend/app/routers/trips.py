from enum import Enum
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.routers._responses import route_stub

router = APIRouter(prefix="/trips", tags=["Trips"])


class TripStatus(str, Enum):
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
def list_trips(status: Optional[TripStatus] = None) -> dict:
    return route_stub("trips", "list", status=status)


@router.post("")
def create_trip(payload: TripCreate) -> dict:
    return route_stub("trips", "create", payload=payload.model_dump())


@router.post("/{trip_id}/dispatch")
def dispatch_trip(trip_id: int, payload: TripDispatchRequest) -> dict:
    return route_stub("trips", "dispatch", trip_id=trip_id, payload=payload.model_dump())


@router.post("/{trip_id}/complete")
def complete_trip(trip_id: int, payload: TripCompleteRequest) -> dict:
    return route_stub("trips", "complete", trip_id=trip_id, payload=payload.model_dump())


@router.post("/{trip_id}/cancel")
def cancel_trip(trip_id: int) -> dict:
    return route_stub("trips", "cancel", trip_id=trip_id)
