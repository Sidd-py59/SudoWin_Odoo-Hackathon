from datetime import datetime
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.routers._responses import route_stub

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


class VehicleStatus(str, Enum):
    available = "available"
    on_trip = "on_trip"
    in_shop = "in_shop"
    retired = "retired"


class VehicleType(str, Enum):
    van = "van"
    truck = "truck"
    mini = "mini"


class VehicleCreate(BaseModel):
    registration_number: str = Field(min_length=2, max_length=32)
    name_model: str = Field(min_length=2, max_length=80)
    type: VehicleType
    max_load_kg: float = Field(gt=0)
    odometer: float = Field(ge=0)
    acquisition_cost: float = Field(ge=0)
    status: VehicleStatus = VehicleStatus.available
    region: str = Field(min_length=2, max_length=80)


class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = Field(default=None, min_length=2, max_length=32)
    name_model: Optional[str] = Field(default=None, min_length=2, max_length=80)
    type: Optional[VehicleType] = None
    max_load_kg: Optional[float] = Field(default=None, gt=0)
    odometer: Optional[float] = Field(default=None, ge=0)
    acquisition_cost: Optional[float] = Field(default=None, ge=0)
    status: Optional[VehicleStatus] = None
    region: Optional[str] = Field(default=None, min_length=2, max_length=80)


@router.get("")
def list_vehicles(
    status: Optional[VehicleStatus] = None,
    type: Optional[VehicleType] = None,
    region: Optional[str] = Query(default=None, min_length=2),
) -> dict:
    return route_stub("vehicles", "list", status=status, type=type, region=region)


@router.post("")
def create_vehicle(payload: VehicleCreate) -> dict:
    return route_stub("vehicles", "create", payload=payload.model_dump())


@router.get("/available")
def list_available_vehicles() -> dict:
    return route_stub("vehicles", "available", status=VehicleStatus.available)


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: int) -> dict:
    return route_stub("vehicles", "get", vehicle_id=vehicle_id)


@router.put("/{vehicle_id}")
def update_vehicle(vehicle_id: int, payload: VehicleUpdate) -> dict:
    return route_stub(
        "vehicles",
        "update",
        vehicle_id=vehicle_id,
        payload=payload.model_dump(exclude_unset=True),
    )


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int) -> dict:
    return route_stub("vehicles", "delete", vehicle_id=vehicle_id, deleted_at=datetime.utcnow())
