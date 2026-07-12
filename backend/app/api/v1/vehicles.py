"""Vehicles router placeholder.

TODO: Implement CRUD for the Vehicle Registry:
    POST   /vehicles/       – Register a new vehicle.
    GET    /vehicles/       – List vehicles (with filters: type, status, region).
    GET    /vehicles/{id}   – Get vehicle details.
    PUT    /vehicles/{id}   – Update vehicle information.
    DELETE /vehicles/{id}   – Retire / soft-delete a vehicle.

Business rules (from problem statement):
    • Registration number must be unique.
    • Status values: Available, On Trip, In Shop, Retired.
    • Retired / In Shop vehicles must not appear in dispatch selection.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("/", summary="Vehicles module health check")
async def vehicles_health() -> dict[str, str]:
    """Verify the vehicles router is reachable."""
    return {"module": "vehicles", "status": "ready"}
