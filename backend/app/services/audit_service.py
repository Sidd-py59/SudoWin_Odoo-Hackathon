from typing import Optional

from sqlalchemy.orm import Session

from ..models import AuditLog


def log_audit(
    db: Session,
    entity_type: str,
    entity_id: int,
    action: str,
    old_value: Optional[str],
    new_value: Optional[str],
    actor_user_id: Optional[int],
) -> AuditLog:
    log = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
        actor_user_id=actor_user_id,
    )
    db.add(log)
    return log
