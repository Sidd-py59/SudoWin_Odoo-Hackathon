from fastapi import APIRouter

from app.routers._responses import route_stub

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def get_dashboard_kpis() -> dict:
    return route_stub("dashboard", "kpis")
