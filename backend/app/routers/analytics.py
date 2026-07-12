from fastapi import APIRouter

from app.routers._responses import route_stub

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/fleet-utilization")
def get_fleet_utilization() -> dict:
    return route_stub("analytics", "fleet_utilization")


@router.get("/fuel-efficiency")
def get_fuel_efficiency() -> dict:
    return route_stub("analytics", "fuel_efficiency")


@router.get("/cost-per-trip")
def get_cost_per_trip() -> dict:
    return route_stub("analytics", "cost_per_trip")


@router.get("/top-costly-vehicles")
def get_top_costly_vehicles() -> dict:
    return route_stub("analytics", "top_costly_vehicles")
