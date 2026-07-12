from fastapi import APIRouter, Depends

from ..auth import AuthUser
from ..dependencies import require_roles
from ._responses import route_stub

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/fleet-utilization")
def get_fleet_utilization(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
) -> dict:
    return route_stub("analytics", "fleet_utilization", actor=current_user.email)


@router.get("/fuel-efficiency")
def get_fuel_efficiency(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
) -> dict:
    return route_stub("analytics", "fuel_efficiency", actor=current_user.email)


@router.get("/cost-per-trip")
def get_cost_per_trip(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
) -> dict:
    return route_stub("analytics", "cost_per_trip", actor=current_user.email)


@router.get("/top-costly-vehicles")
def get_top_costly_vehicles(
    current_user: AuthUser = Depends(require_roles(["fleet_manager", "financial_analyst"])),
) -> dict:
    return route_stub("analytics", "top_costly_vehicles", actor=current_user.email)

