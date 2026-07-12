from datetime import date
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.routers._responses import route_stub

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
def list_expenses() -> dict:
    return route_stub("expenses", "list")


@router.post("/expenses")
def create_expense(payload: ExpenseCreate) -> dict:
    return route_stub("expenses", "create", payload=payload.model_dump())


@router.get("/fuel-logs")
def list_fuel_logs() -> dict:
    return route_stub("fuel_logs", "list")


@router.post("/fuel-logs")
def create_fuel_log(payload: FuelLogCreate) -> dict:
    return route_stub("fuel_logs", "create", payload=payload.model_dump())
