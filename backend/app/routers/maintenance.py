from datetime import date
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import MaintenanceLog, MaintenanceStatus, Vehicle, VehicleStatus
from ..services.audit_service import log_audit

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


class MaintenanceStatusValue(str, Enum):
    active = "active"
    completed = "completed"


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    service_type: str = Field(min_length=2, max_length=80)
    cost: float = Field(ge=0)
    service_date: date


def serialize_maintenance(item: MaintenanceLog) -> dict:
    return {
        "id": item.id,
        "vehicle_id": item.vehicle_id,
        "service_type": item.service_type,
        "cost": item.cost,
        "service_date": item.service_date,
        "status": item.status,
        "created_at": item.created_at,
        "vehicle": {
            "id": item.vehicle.id,
            "name_model": item.vehicle.name_model,
            "registration_number": item.vehicle.registration_number,
            "status": item.vehicle.status,
        }
        if item.vehicle
        else None,
    }


def get_maintenance_or_404(db: Session, maintenance_id: int) -> MaintenanceLog:
    item = db.get(MaintenanceLog, maintenance_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return item


@router.get("")
def list_maintenance(
    status_filter: Optional[MaintenanceStatusValue] = None,
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "safety_officer"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    query = db.query(MaintenanceLog)
    if status_filter:
        query = query.filter(MaintenanceLog.status == status_filter.value)
    return [serialize_maintenance(item) for item in query.order_by(MaintenanceLog.id.desc()).all()]


@router.post("", status_code=status.HTTP_201_CREATED)
def open_maintenance(
    payload: MaintenanceCreate,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
    db: Session = Depends(get_db),
) -> dict:
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.status == VehicleStatus.on_trip.value:
        raise HTTPException(status_code=400, detail="Cannot send an on-trip vehicle to maintenance")
    if vehicle.status == VehicleStatus.retired.value:
        raise HTTPException(status_code=400, detail="Retired vehicle cannot enter maintenance")

    old_vehicle_status = vehicle.status
    item = MaintenanceLog(**payload.model_dump(mode="json"), status=MaintenanceStatus.active.value)
    vehicle.status = VehicleStatus.in_shop.value
    db.add(item)
    db.flush()
    log_audit(db, "maintenance", item.id, "created", None, item.status, current_user.id)
    log_audit(db, "vehicle", vehicle.id, "status_change", old_vehicle_status, vehicle.status, current_user.id)
    db.commit()
    db.refresh(item)
    return serialize_maintenance(item)


@router.post("/{maintenance_id}/close")
def close_maintenance(
    maintenance_id: int,
    current_user: AuthUser = Depends(require_roles(["fleet_manager"])),
    db: Session = Depends(get_db),
) -> dict:
    item = get_maintenance_or_404(db, maintenance_id)
    if item.status == MaintenanceStatus.completed.value:
        return serialize_maintenance(item)

    old_maintenance_status = item.status
    old_vehicle_status = item.vehicle.status
    item.status = MaintenanceStatus.completed.value
    if item.vehicle.status != VehicleStatus.retired.value:
        item.vehicle.status = VehicleStatus.available.value

    log_audit(db, "maintenance", item.id, "status_change", old_maintenance_status, item.status, current_user.id)
    log_audit(db, "vehicle", item.vehicle.id, "status_change", old_vehicle_status, item.vehicle.status, current_user.id)
    db.commit()
    db.refresh(item)
    return serialize_maintenance(item)
