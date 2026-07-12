from fastapi import APIRouter, Depends

from ..auth import AuthUser
from ..dependencies import require_roles
from ._responses import route_stub

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def get_dashboard_kpis(
    current_user: AuthUser = Depends(
        require_roles(["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"])
    ),
) -> dict:
    return route_stub("dashboard", "kpis", actor=current_user.email)

