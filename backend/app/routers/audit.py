from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..auth import AuthUser
from ..database import get_db
from ..dependencies import require_roles
from ..models import AuditLog

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


def serialize_audit(item: AuditLog) -> dict:
    return {
        "id": item.id,
        "entity_type": item.entity_type,
        "entity_id": item.entity_id,
        "action": item.action,
        "old_value": item.old_value,
        "new_value": item.new_value,
        "actor_user_id": item.actor_user_id,
        "timestamp": item.timestamp,
    }


@router.get("")
def list_audit_logs(
    entity_type: Optional[str] = Query(default=None, min_length=2),
    entity_id: Optional[int] = None,
    current_user: AuthUser = Depends(require_roles(["safety_officer", "fleet_manager"])),
    db: Session = Depends(get_db),
) -> list[dict]:
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    return [serialize_audit(item) for item in query.order_by(AuditLog.id.desc()).limit(100).all()]
