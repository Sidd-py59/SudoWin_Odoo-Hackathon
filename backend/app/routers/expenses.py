from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import Expense, FuelLog
from ..services.audit_service import log_audit

router = APIRouter(tags=["Expenses And Fuel"])


class ExpenseCreate(BaseModel):
    trip_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    toll_cost: float = Field(default=0, ge=0)
    repair_cost: float = Field(default=0, ge=0)
    other_cost: float = Field(default=0, ge=0)


class FuelLogCreate(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float = Field(gt=0)
    cost: float = Field(ge=0)
    log_date: date


def serialize_expense(item: Expense) -> dict:
    return {
        "id": item.id,
        "trip_id": item.trip_id,
        "vehicle_id": item.vehicle_id,
        "toll_cost": item.toll_cost,
        "repair_cost": item.repair_cost,
        "other_cost": item.other_cost,
        "total_cost": item.toll_cost + item.repair_cost + item.other_cost,
        "created_at": item.created_at,
    }


def serialize_fuel(item: FuelLog) -> dict:
    return {
        "id": item.id,
        "vehicle_id": item.vehicle_id,
        "trip_id": item.trip_id,
        "liters": item.liters,
        "cost": item.cost,
        "log_date": item.log_date,
    }


@router.get("/expenses")
def list_expenses(
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "fleet_manager"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    return [serialize_expense(item) for item in db.query(Expense).order_by(Expense.id.desc()).all()]


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "dispatcher"])),
    db: Session = Depends(get_db),
) -> dict:
    item = Expense(**payload.model_dump(mode="json"))
    db.add(item)
    db.flush()
    log_audit(db, "expense", item.id, "created", None, str(serialize_expense(item)), current_user.id)
    db.commit()
    db.refresh(item)
    return serialize_expense(item)


@router.get("/fuel-logs")
def list_fuel_logs(
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "fleet_manager"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    return [serialize_fuel(item) for item in db.query(FuelLog).order_by(FuelLog.id.desc()).all()]


@router.post("/fuel-logs", status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    payload: FuelLogCreate,
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "dispatcher"])),
    db: Session = Depends(get_db),
) -> dict:
    item = FuelLog(**payload.model_dump(mode="json"))
    db.add(item)
    db.flush()
    log_audit(db, "fuel_log", item.id, "created", None, str(serialize_fuel(item)), current_user.id)
    db.commit()
    db.refresh(item)
    return serialize_fuel(item)
