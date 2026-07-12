"""Fuel & Expense router placeholder.

TODO: Implement Fuel & Expense Management endpoints:
    POST   /fuel/               – Record a fuel log.
    GET    /fuel/               – List fuel logs (with vehicle/date filters).
    GET    /fuel/{id}           – Get fuel log details.
    PUT    /fuel/{id}           – Update a fuel log.
    DELETE /fuel/{id}           – Delete a fuel log.
    POST   /fuel/expenses       – Record a non-fuel expense (tolls, etc.).
    GET    /fuel/expenses       – List expenses.

Business rules (from problem statement):
    • Record fuel logs: litres, cost, date.
    • Record other expenses: tolls, maintenance costs, etc.
    • Auto-compute total operational cost (Fuel + Maintenance) per vehicle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/fuel", tags=["Fuel & Expenses"])


@router.get("/", summary="Fuel module health check")
async def fuel_health() -> dict[str, str]:
    """Verify the fuel & expenses router is reachable."""
    return {"module": "fuel", "status": "ready"}
