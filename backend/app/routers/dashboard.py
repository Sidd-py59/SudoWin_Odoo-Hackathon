from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import Driver, DriverStatus, Trip, TripStatus, Vehicle, VehicleStatus

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def get_dashboard_kpis(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    type_filter: Optional[str] = Query(default=None, alias="type"),
    region_filter: Optional[str] = Query(default=None, alias="region"),
    current_user: AuthUser = Depends(
        require_roles(["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"])
    ),
    db: Session = Depends(get_db),
) -> dict:
    v_query = db.query(Vehicle)
    if type_filter:
        v_query = v_query.filter(Vehicle.type == type_filter)
    if status_filter:
        v_query = v_query.filter(Vehicle.status == status_filter)
    if region_filter:
        v_query = v_query.filter(Vehicle.region.ilike(f"%{region_filter}%"))

    total_vehicles = v_query.count()
    available_vehicles = v_query.filter(Vehicle.status == VehicleStatus.available.value).count()
    active_vehicles = v_query.filter(Vehicle.status == VehicleStatus.on_trip.value).count()
    in_maintenance = v_query.filter(Vehicle.status == VehicleStatus.in_shop.value).count()

    t_query = db.query(Trip)
    if type_filter or status_filter or region_filter:
        t_query = t_query.join(Vehicle, Trip.vehicle_id == Vehicle.id)
        if type_filter:
            t_query = t_query.filter(Vehicle.type == type_filter)
        if status_filter:
            t_query = t_query.filter(Vehicle.status == status_filter)
        if region_filter:
            t_query = t_query.filter(Vehicle.region.ilike(f"%{region_filter}%"))

    active_trips = t_query.filter(Trip.status == TripStatus.dispatched.value).count()
    pending_trips = t_query.filter(Trip.status == TripStatus.draft.value).count()
    completed_trips = t_query.filter(Trip.status == TripStatus.completed.value).count()

    if type_filter or status_filter or region_filter:
        d_query = db.query(Driver).join(Trip, Driver.id == Trip.driver_id).filter(Trip.status == TripStatus.dispatched.value).join(Vehicle, Trip.vehicle_id == Vehicle.id)
        if type_filter:
            d_query = d_query.filter(Vehicle.type == type_filter)
        if status_filter:
            d_query = d_query.filter(Vehicle.status == status_filter)
        if region_filter:
            d_query = d_query.filter(Vehicle.region.ilike(f"%{region_filter}%"))
        drivers_on_duty = d_query.filter(Driver.status == DriverStatus.on_trip.value).count()
    else:
        drivers_on_duty = db.query(Driver).filter(Driver.status == DriverStatus.on_trip.value).count()

    utilization = round((active_vehicles / total_vehicles) * 100, 2) if total_vehicles else 0

    return {
        "total_vehicles": total_vehicles,
        "active_vehicles": active_vehicles,
        "available_vehicles": available_vehicles,
        "vehicles_in_maintenance": in_maintenance,
        "active_trips": active_trips,
        "pending_trips": pending_trips,
        "completed_trips": completed_trips,
        "drivers_on_duty": drivers_on_duty,
        "fleet_utilization_percent": utilization,
    }

