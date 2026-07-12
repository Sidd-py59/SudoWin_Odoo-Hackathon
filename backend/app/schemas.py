from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ==========================================
# Role Schemas
# ==========================================
class RoleBase(BaseModel):
    name: str = Field(..., description="Name of the role (e.g., admin, fleet_manager)")

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True

# ==========================================
# User Schemas
# ==========================================
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    role_id: int

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    role_id: int
    created_at: datetime
    role: Optional[Role] = None

    class Config:
        from_attributes = True

# ==========================================
# Vehicle Schemas
# ==========================================
class VehicleBase(BaseModel):
    registration_number: str
    name_model: str
    type: str
    max_load_kg: float = Field(..., gt=0)
    odometer: float = Field(default=0.0, ge=0)
    acquisition_cost: float = Field(..., ge=0)
    status: str = Field(default="available", description="available | on_trip | in_shop | retired")
    region: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    name_model: Optional[str] = None
    type: Optional[str] = None
    max_load_kg: Optional[float] = Field(None, gt=0)
    odometer: Optional[float] = Field(None, ge=0)
    acquisition_cost: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    region: Optional[str] = None

class Vehicle(VehicleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# Driver Schemas
# ==========================================
class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry: date
    contact_number: str
    safety_score: float = Field(default=100.0, ge=0, le=100)
    status: str = Field(default="available", description="available | on_trip | off_duty | suspended")

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = None

class Driver(DriverBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# Trip Schemas
# ==========================================
class TripBase(BaseModel):
    trip_code: str
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight_kg: float = Field(..., gt=0)
    planned_distance_km: float = Field(..., gt=0)
    actual_distance_km: Optional[float] = Field(None, ge=0)
    status: str = Field(default="draft", description="draft | dispatched | completed | cancelled")
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class TripCreate(BaseModel):
    trip_code: str
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight_kg: float = Field(..., gt=0)
    planned_distance_km: float = Field(..., gt=0)

class TripUpdate(BaseModel):
    source: Optional[str] = None
    destination: Optional[str] = None
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    cargo_weight_kg: Optional[float] = Field(None, gt=0)
    planned_distance_km: Optional[float] = Field(None, gt=0)
    actual_distance_km: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class Trip(TripBase):
    id: int
    created_at: datetime
    vehicle: Optional[Vehicle] = None
    driver: Optional[Driver] = None

    class Config:
        from_attributes = True

# ==========================================
# Maintenance Log Schemas
# ==========================================
class MaintenanceLogBase(BaseModel):
    vehicle_id: int
    service_type: str
    cost: float = Field(..., ge=0)
    service_date: date
    status: str = Field(default="active", description="active | completed")

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    service_type: Optional[str] = None
    cost: Optional[float] = Field(None, ge=0)
    service_date: Optional[date] = None
    status: Optional[str] = None

class MaintenanceLog(MaintenanceLogBase):
    id: int
    created_at: datetime
    vehicle: Optional[Vehicle] = None

    class Config:
        from_attributes = True

# ==========================================
# Fuel Log Schemas
# ==========================================
class FuelLogBase(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    liters: float = Field(..., gt=0)
    cost: float = Field(..., ge=0)
    log_date: date

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    trip_id: Optional[int] = None
    liters: Optional[float] = Field(None, gt=0)
    cost: Optional[float] = Field(None, ge=0)
    log_date: Optional[date] = None

class FuelLog(FuelLogBase):
    id: int
    vehicle: Optional[Vehicle] = None
    trip: Optional[Trip] = None

    class Config:
        from_attributes = True

# ==========================================
# Expense Schemas
# ==========================================
class ExpenseBase(BaseModel):
    trip_id: Optional[int] = None
    vehicle_id: int
    toll_cost: float = Field(default=0.0, ge=0)
    repair_cost: float = Field(default=0.0, ge=0)
    other_cost: float = Field(default=0.0, ge=0)

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    trip_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    toll_cost: Optional[float] = Field(None, ge=0)
    repair_cost: Optional[float] = Field(None, ge=0)
    other_cost: Optional[float] = Field(None, ge=0)

class Expense(ExpenseBase):
    id: int
    created_at: datetime
    trip: Optional[Trip] = None
    vehicle: Optional[Vehicle] = None

    class Config:
        from_attributes = True

# ==========================================
# Audit Log Schemas
# ==========================================
class AuditLogBase(BaseModel):
    entity_type: str
    entity_id: int
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    actor_user_id: Optional[int] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int
    timestamp: datetime
    actor: Optional[User] = None

    class Config:
        from_attributes = True

# ==========================================
# Authentication Schemas
# ==========================================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
