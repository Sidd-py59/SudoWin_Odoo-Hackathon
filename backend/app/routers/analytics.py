from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import Expense, FuelLog, MaintenanceLog, Trip, Vehicle, VehicleStatus

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def vehicle_costs(db: Session) -> dict[int, float]:
    costs: dict[int, float] = {}
    for vehicle_id, total in db.query(FuelLog.vehicle_id, func.coalesce(func.sum(FuelLog.cost), 0)).group_by(FuelLog.vehicle_id):
        costs[vehicle_id] = costs.get(vehicle_id, 0) + float(total or 0)
    for vehicle_id, total in db.query(MaintenanceLog.vehicle_id, func.coalesce(func.sum(MaintenanceLog.cost), 0)).group_by(MaintenanceLog.vehicle_id):
        costs[vehicle_id] = costs.get(vehicle_id, 0) + float(total or 0)
    for vehicle_id, toll, repair, other in db.query(Expense.vehicle_id, Expense.toll_cost, Expense.repair_cost, Expense.other_cost).all():
        if vehicle_id:
            costs[vehicle_id] = costs.get(vehicle_id, 0) + float((toll or 0) + (repair or 0) + (other or 0))
    return costs


@router.get("/fleet-utilization")
def get_fleet_utilization(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
    db: Session = Depends(get_db),
) -> dict:
    total = db.query(Vehicle).count()
    on_trip = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.on_trip.value).count()
    return {"total_vehicles": total, "on_trip": on_trip, "utilization_percent": round((on_trip / total) * 100, 2) if total else 0}


@router.get("/fuel-efficiency")
def get_fuel_efficiency(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    rows = []
    for vehicle in db.query(Vehicle).order_by(Vehicle.id).all():
        distance = sum(trip.actual_distance_km or trip.planned_distance_km for trip in vehicle.trips)
        liters = sum(log.liters for log in vehicle.fuel_logs)
        rows.append({
            "vehicle_id": vehicle.id,
            "vehicle": vehicle.name_model,
            "distance_km": distance,
            "fuel_liters": liters,
            "efficiency_km_per_liter": round(distance / liters, 2) if liters else 0,
        })
    return rows


@router.get("/cost-per-trip")
def get_cost_per_trip(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    rows = []
    for trip in db.query(Trip).order_by(Trip.id.desc()).all():
        fuel = sum(log.cost for log in trip.fuel_logs)
        expenses = sum((item.toll_cost or 0) + (item.repair_cost or 0) + (item.other_cost or 0) for item in trip.expenses)
        distance = trip.actual_distance_km or trip.planned_distance_km
        total = fuel + expenses
        rows.append({
            "trip_id": trip.id,
            "trip_code": trip.trip_code,
            "total_cost": total,
            "distance_km": distance,
            "cost_per_km": round(total / distance, 2) if distance else 0,
        })
    return rows


@router.get("/top-costly-vehicles")
def get_top_costly_vehicles(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    costs = vehicle_costs(db)
    vehicles = {vehicle.id: vehicle for vehicle in db.query(Vehicle).all()}
    rows = [
        {"vehicle_id": vehicle_id, "vehicle": vehicles[vehicle_id].name_model, "total_cost": total}
        for vehicle_id, total in costs.items()
        if vehicle_id in vehicles
    ]
    return sorted(rows, key=lambda row: row["total_cost"], reverse=True)[:5]


@router.get("/vehicle-roi")
def get_vehicle_roi(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    costs = vehicle_costs(db)
    rows = []
    for vehicle in db.query(Vehicle).all():
        revenue = sum((trip.actual_distance_km or trip.planned_distance_km) * 120 for trip in vehicle.trips)
        cost = costs.get(vehicle.id, 0)
        rows.append({
            "vehicle_id": vehicle.id,
            "vehicle": vehicle.name_model,
            "revenue": revenue,
            "operational_cost": cost,
            "roi": round((revenue - cost) / vehicle.acquisition_cost, 4) if vehicle.acquisition_cost else 0,
        })
    return rows
