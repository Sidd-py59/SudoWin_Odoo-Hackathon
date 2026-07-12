"""Trips router placeholder.

TODO: Implement Trip Management endpoints:
    POST   /trips/                 – Create a new trip (Draft).
    GET    /trips/                 – List trips (with status filters).
    GET    /trips/{id}             – Get trip details.
    PUT    /trips/{id}             – Update trip information.
    POST   /trips/{id}/dispatch    – Dispatch a trip (Draft → Dispatched).
    POST   /trips/{id}/complete    – Complete a trip (Dispatched → Completed).
    POST   /trips/{id}/cancel      – Cancel a trip.

Business rules (from problem statement):
    • Trip lifecycle: Draft → Dispatched → Completed → Cancelled.
    • Cargo weight must not exceed the vehicle's maximum load capacity.
    • Dispatching auto-sets vehicle and driver status to On Trip.
    • Completing auto-restores vehicle and driver status to Available.
    • Cancelling a dispatched trip restores vehicle and driver to Available.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("/", summary="Trips module health check")
async def trips_health() -> dict[str, str]:
    """Verify the trips router is reachable."""
    return {"module": "trips", "status": "ready"}
