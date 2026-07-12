from typing import Optional

from fastapi import APIRouter, Depends, Query

from ..auth import AuthUser
from ..dependencies import require_roles
from ._responses import route_stub

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("")
def list_audit_logs(
    entity_type: Optional[str] = Query(default=None, min_length=2),
    entity_id: Optional[int] = None,
    current_user: AuthUser = Depends(require_roles(["safety_officer", "fleet_manager"])),
) -> dict:
    return route_stub(
        "audit_logs",
        "list",
        entity_type=entity_type,
        entity_id=entity_id,
        actor=current_user.email,
    )

