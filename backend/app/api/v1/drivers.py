"""Drivers router placeholder.

TODO: Implement CRUD for Driver Management:
    POST   /drivers/       – Register a new driver.
    GET    /drivers/       – List drivers (with status/license filters).
    GET    /drivers/{id}   – Get driver details.
    PUT    /drivers/{id}   – Update driver profile.
    DELETE /drivers/{id}   – Deactivate / suspend a driver.

Business rules (from problem statement):
    • Status values: Available, On Trip, Off Duty, Suspended.
    • Drivers with expired licenses or Suspended status cannot be assigned to trips.
    • A driver already On Trip cannot be assigned to another trip.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.get("/", summary="Drivers module health check")
async def drivers_health() -> dict[str, str]:
    """Verify the drivers router is reachable."""
    return {"module": "drivers", "status": "ready"}
