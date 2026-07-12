"""Maintenance router placeholder.

TODO: Implement Maintenance workflow endpoints:
    POST   /maintenance/           – Create a maintenance record.
    GET    /maintenance/           – List maintenance records (with filters).
    GET    /maintenance/{id}       – Get maintenance record details.
    PUT    /maintenance/{id}       – Update a maintenance record.
    POST   /maintenance/{id}/close – Close / complete a maintenance record.

Business rules (from problem statement):
    • Creating an active maintenance record auto-sets vehicle status to In Shop.
    • Closing maintenance restores the vehicle to Available (unless retired).
    • In Shop vehicles are removed from the dispatch selection pool.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.get("/", summary="Maintenance module health check")
async def maintenance_health() -> dict[str, str]:
    """Verify the maintenance router is reachable."""
    return {"module": "maintenance", "status": "ready"}
