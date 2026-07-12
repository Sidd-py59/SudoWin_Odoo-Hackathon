"""Reports & Analytics router placeholder.

TODO: Implement reporting endpoints:
    GET /reports/dashboard         – Dashboard KPIs (active vehicles, utilization %).
    GET /reports/fuel-efficiency   – Fuel efficiency (distance / fuel) per vehicle.
    GET /reports/fleet-utilization – Fleet utilization breakdown.
    GET /reports/operational-cost  – Operational cost per vehicle.
    GET /reports/vehicle-roi       – Vehicle ROI = (Revenue − (Maint + Fuel)) / Acquisition Cost.
    GET /reports/export/csv        – Export data as CSV.
    GET /reports/export/pdf        – (Bonus) Export data as PDF.

KPIs from problem statement:
    • Active Vehicles, Available Vehicles, Vehicles in Maintenance
    • Active Trips, Pending Trips, Drivers On Duty
    • Fleet Utilization (%)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/", summary="Reports module health check")
async def reports_health() -> dict[str, str]:
    """Verify the reports router is reachable."""
    return {"module": "reports", "status": "ready"}
