from datetime import datetime
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import Vehicle

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
    bus = "bus"


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


def serialize_vehicle(vehicle: Vehicle) -> dict:
    return {
        "id": vehicle.id,
        "registration_number": vehicle.registration_number,
        "name_model": vehicle.name_model,
        "type": vehicle.type,
        "max_load_kg": vehicle.max_load_kg,
        "odometer": vehicle.odometer,
        "acquisition_cost": vehicle.acquisition_cost,
        "status": vehicle.status,
        "region": vehicle.region,
        "created_at": vehicle.created_at,
    }


def get_vehicle_or_404(db: Session, vehicle_id: int) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle


@router.get("")
def list_vehicles(
    status_filter: Optional[VehicleStatus] = Query(default=None, alias="status"),
    type_filter: Optional[VehicleType] = Query(default=None, alias="type"),
    region: Optional[str] = Query(default=None, min_length=2),
    current_user: AuthUser = Depends(
        require_roles(["fleet_manager", "dispatcher", "safety_officer"])
    ),
    db: Session = Depends(get_db),
) -> list[dict]:
    query = db.query(Vehicle)
    if status_filter:
        query = query.filter(Vehicle.status == status_filter.value)
    if type_filter:
        query = query.filter(Vehicle.type == type_filter.value)
    if region:
        query = query.filter(Vehicle.region.ilike(f"%{region}%"))
    return [serialize_vehicle(vehicle) for vehicle in query.order_by(Vehicle.id).all()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
    db: Session = Depends(get_db),
) -> dict:
    vehicle = Vehicle(**payload.model_dump(mode="json"))
    db.add(vehicle)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vehicle registration number already exists",
        )
    db.refresh(vehicle)
    return serialize_vehicle(vehicle)


@router.get("/available")
def list_available_vehicles(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "dispatcher"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    vehicles = (
        db.query(Vehicle)
        .filter(Vehicle.status == VehicleStatus.available.value)
        .order_by(Vehicle.id)
        .all()
    )
    return [serialize_vehicle(vehicle) for vehicle in vehicles]


@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: int,
    current_user: AuthUser = Depends(
        require_roles(["fleet_manager", "dispatcher", "safety_officer"])
    ),
    db: Session = Depends(get_db),
) -> dict:
    return serialize_vehicle(get_vehicle_or_404(db, vehicle_id))


@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
    db: Session = Depends(get_db),
) -> dict:
    vehicle = get_vehicle_or_404(db, vehicle_id)
    for key, value in payload.model_dump(exclude_unset=True, mode="json").items():
        setattr(vehicle, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vehicle registration number already exists",
        )
    db.refresh(vehicle)
    return serialize_vehicle(vehicle)


@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
    db: Session = Depends(get_db),
) -> dict:
    vehicle = get_vehicle_or_404(db, vehicle_id)
    if vehicle.status == VehicleStatus.on_trip.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a vehicle that is currently on trip",
        )
    db.delete(vehicle)
    db.commit()
    return {"id": vehicle_id, "deleted_at": datetime.utcnow()}
