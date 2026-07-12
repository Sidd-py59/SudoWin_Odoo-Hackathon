from datetime import date
from enum import Enum
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.routers._responses import route_stub

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


class MaintenanceStatus(str, Enum):
    active = "active"
    completed = "completed"


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    service_type: str = Field(min_length=2, max_length=80)
    cost: float = Field(ge=0)
    service_date: date


@router.get("")
def list_maintenance(status: Optional[MaintenanceStatus] = None) -> dict:
    return route_stub("maintenance", "list", status=status)


@router.post("")
def open_maintenance(payload: MaintenanceCreate) -> dict:
    return route_stub("maintenance", "open", payload=payload.model_dump())


@router.post("/{maintenance_id}/close")
def close_maintenance(maintenance_id: int) -> dict:
    return route_stub("maintenance", "close", maintenance_id=maintenance_id)
