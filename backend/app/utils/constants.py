"""Application-wide constants.

Keep domain-specific enums and magic values here so they stay DRY.
"""

# ── Vehicle statuses ────────────────────────────────────────────
VEHICLE_STATUS_AVAILABLE = "Available"
VEHICLE_STATUS_ON_TRIP = "On Trip"
VEHICLE_STATUS_IN_SHOP = "In Shop"
VEHICLE_STATUS_RETIRED = "Retired"

VEHICLE_STATUSES: list[str] = [
    VEHICLE_STATUS_AVAILABLE,
    VEHICLE_STATUS_ON_TRIP,
    VEHICLE_STATUS_IN_SHOP,
    VEHICLE_STATUS_RETIRED,
]

# ── Driver statuses ─────────────────────────────────────────────
DRIVER_STATUS_AVAILABLE = "Available"
DRIVER_STATUS_ON_TRIP = "On Trip"
DRIVER_STATUS_OFF_DUTY = "Off Duty"
DRIVER_STATUS_SUSPENDED = "Suspended"

DRIVER_STATUSES: list[str] = [
    DRIVER_STATUS_AVAILABLE,
    DRIVER_STATUS_ON_TRIP,
    DRIVER_STATUS_OFF_DUTY,
    DRIVER_STATUS_SUSPENDED,
]

# ── Trip lifecycle ──────────────────────────────────────────────
TRIP_STATUS_DRAFT = "Draft"
TRIP_STATUS_DISPATCHED = "Dispatched"
TRIP_STATUS_COMPLETED = "Completed"
TRIP_STATUS_CANCELLED = "Cancelled"

TRIP_STATUSES: list[str] = [
    TRIP_STATUS_DRAFT,
    TRIP_STATUS_DISPATCHED,
    TRIP_STATUS_COMPLETED,
    TRIP_STATUS_CANCELLED,
]

# ── User roles (RBAC) ──────────────────────────────────────────
ROLE_FLEET_MANAGER = "Fleet Manager"
ROLE_DRIVER = "Driver"
ROLE_SAFETY_OFFICER = "Safety Officer"
ROLE_FINANCIAL_ANALYST = "Financial Analyst"

USER_ROLES: list[str] = [
    ROLE_FLEET_MANAGER,
    ROLE_DRIVER,
    ROLE_SAFETY_OFFICER,
    ROLE_FINANCIAL_ANALYST,
]
