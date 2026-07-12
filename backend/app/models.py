from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    # Relationships
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    role = relationship("Role", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="actor")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    name_model = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., truck, van, sedan, etc.
    max_load_kg = Column(Float, nullable=False)
    odometer = Column(Float, default=0.0, nullable=False)
    acquisition_cost = Column(Float, nullable=False)
    status = Column(String, default="available", nullable=False)  # available | on_trip | in_shop | retired
    region = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    trips = relationship("Trip", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)
    license_expiry = Column(Date, nullable=False)
    contact_number = Column(String, nullable=False)
    safety_score = Column(Float, default=100.0, nullable=False)
    status = Column(String, default="available", nullable=False)  # available | on_trip | off_duty | suspended
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    trips = relationship("Trip", back_populates="driver")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    trip_code = Column(String, unique=True, index=True, nullable=False)  # e.g., TR-001
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    cargo_weight_kg = Column(Float, nullable=False)
    planned_distance_km = Column(Float, nullable=False)
    actual_distance_km = Column(Float, nullable=True)
    status = Column(String, default="draft", nullable=False)  # draft | dispatched | completed | cancelled
    dispatched_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
    fuel_logs = relationship("FuelLog", back_populates="trip")
    expenses = relationship("Expense", back_populates="trip")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    service_date = Column(Date, nullable=False)
    status = Column(String, default="active", nullable=False)  # active | completed
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="maintenance_logs")

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    liters = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    log_date = Column(Date, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="fuel_logs")
    trip = relationship("Trip", back_populates="fuel_logs")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    toll_cost = Column(Float, default=0.0, nullable=False)
    repair_cost = Column(Float, default=0.0, nullable=False)
    other_cost = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    trip = relationship("Trip", back_populates="expenses")
    vehicle = relationship("Vehicle", back_populates="expenses")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)  # e.g., 'Trip', 'Vehicle', 'Driver'
    entity_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False)  # e.g., 'status_change', 'create', 'update'
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)

    # Relationships
    actor = relationship("User", back_populates="audit_logs")
