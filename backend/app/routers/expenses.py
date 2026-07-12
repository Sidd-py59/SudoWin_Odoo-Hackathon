from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..auth import AuthUser
from ..dependencies import require_roles
from ._responses import route_stub

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


@router.get("/expenses")
def list_expenses(
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "fleet_manager"])),
) -> dict:
    return route_stub("expenses", "list", actor=current_user.email)


@router.post("/expenses")
def create_expense(
    payload: ExpenseCreate,
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "dispatcher"])),
) -> dict:
    return route_stub("expenses", "create", payload=payload.model_dump(), actor=current_user.email)


@router.get("/fuel-logs")
def list_fuel_logs(
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "fleet_manager"])),
) -> dict:
    return route_stub("fuel_logs", "list", actor=current_user.email)


@router.post("/fuel-logs")
def create_fuel_log(
    payload: FuelLogCreate,
    current_user: AuthUser = Depends(require_roles(["financial_analyst", "dispatcher"])),
) -> dict:
    return route_stub("fuel_logs", "create", payload=payload.model_dump(), actor=current_user.email)

