from typing import Any


def route_stub(resource: str, action: str, **data: Any) -> dict[str, Any]:
    """Temporary response until DB services are wired."""
    return {
        "resource": resource,
        "action": action,
        "wired": False,
        "data": data,
    }

