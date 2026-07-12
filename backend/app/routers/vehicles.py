from datetime import datetime
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from ..auth import AuthUser
from ..dependencies import require_roles
from ._responses import route_stub

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
    current_user: AuthUser = Depends(
        require_roles(["fleet_manager", "dispatcher", "safety_officer"])
    ),
) -> dict:
    return route_stub(
        "vehicles",
        "list",
        status=status,
        type=type,
        region=region,
        actor=current_user.email,
    )


@router.post("")
def create_vehicle(
    payload: VehicleCreate,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
) -> dict:
    return route_stub("vehicles", "create", payload=payload.model_dump(), actor=current_user.email)


@router.get("/available")
def list_available_vehicles(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "dispatcher"])),
) -> dict:
    return route_stub(
        "vehicles",
        "available",
        status=VehicleStatus.available,
        actor=current_user.email,
    )


@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: int,
    current_user: AuthUser = Depends(
        require_roles(["fleet_manager", "dispatcher", "safety_officer"])
    ),
) -> dict:
    return route_stub("vehicles", "get", vehicle_id=vehicle_id, actor=current_user.email)


@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
) -> dict:
    return route_stub(
        "vehicles",
        "update",
        vehicle_id=vehicle_id,
        payload=payload.model_dump(exclude_unset=True),
        actor=current_user.email,
    )


@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
) -> dict:
    return route_stub(
        "vehicles",
        "delete",
        vehicle_id=vehicle_id,
        deleted_at=datetime.utcnow(),
        actor=current_user.email,
    )

