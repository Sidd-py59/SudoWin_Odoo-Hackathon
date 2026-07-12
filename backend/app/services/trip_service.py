from datetime import date, datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models import Driver, DriverStatus, Expense, FuelLog, Trip, TripStatus, Vehicle, VehicleStatus
from .audit_service import log_audit


def serialize_trip(trip: Trip) -> dict:
    return {
        "id": trip.id,
        "trip_code": trip.trip_code,
        "source": trip.source,
        "destination": trip.destination,
        "vehicle_id": trip.vehicle_id,
        "driver_id": trip.driver_id,
        "cargo_weight_kg": trip.cargo_weight_kg,
        "planned_distance_km": trip.planned_distance_km,
        "actual_distance_km": trip.actual_distance_km,
        "status": trip.status,
        "dispatched_at": trip.dispatched_at,
        "completed_at": trip.completed_at,
        "created_at": trip.created_at,
        "vehicle": {
            "id": trip.vehicle.id,
            "registration_number": trip.vehicle.registration_number,
            "name_model": trip.vehicle.name_model,
            "status": trip.vehicle.status,
            "odometer": trip.vehicle.odometer,
        }
        if trip.vehicle
        else None,
        "driver": {
            "id": trip.driver.id,
            "name": trip.driver.name,
            "license_number": trip.driver.license_number,
            "status": trip.driver.status,
        }
        if trip.driver
        else None,
    }


def get_trip_or_404(db: Session, trip_id: int) -> Trip:
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


def create_trip(db: Session, payload, actor_id: Optional[int]) -> Trip:
    trip = Trip(**payload.model_dump(mode="json"), status=TripStatus.draft.value)
    db.add(trip)
    db.flush()
    log_audit(db, "trip", trip.id, "created", None, trip.status, actor_id)
    db.commit()
    db.refresh(trip)
    return trip


def dispatch_trip(db: Session, trip_id: int, vehicle_id: int, driver_id: int, actor_id: Optional[int]) -> Trip:
    trip = get_trip_or_404(db, trip_id)
    vehicle = db.get(Vehicle, vehicle_id)
    driver = db.get(Driver, driver_id)

    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    if driver is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    if trip.status != TripStatus.draft.value:
        raise HTTPException(status_code=400, detail="Only draft trips can be dispatched")
    if vehicle.status != VehicleStatus.available.value:
        raise HTTPException(status_code=400, detail="Vehicle is not available for dispatch")
    if driver.status != DriverStatus.available.value:
        raise HTTPException(status_code=400, detail="Driver is not available for dispatch")
    if driver.license_expiry < date.today():
        raise HTTPException(status_code=400, detail="Driver license is expired")
    if driver.status == DriverStatus.suspended.value:
        raise HTTPException(status_code=400, detail="Suspended driver cannot be assigned")
    if trip.cargo_weight_kg > vehicle.max_load_kg:
        raise HTTPException(status_code=400, detail="Cargo weight exceeds vehicle capacity")

    old_trip_status = trip.status
    old_vehicle_status = vehicle.status
    old_driver_status = driver.status

    trip.vehicle_id = vehicle.id
    trip.driver_id = driver.id
    trip.status = TripStatus.dispatched.value
    trip.dispatched_at = datetime.utcnow()
    vehicle.status = VehicleStatus.on_trip.value
    driver.status = DriverStatus.on_trip.value

    log_audit(db, "trip", trip.id, "status_change", old_trip_status, trip.status, actor_id)
    log_audit(db, "vehicle", vehicle.id, "status_change", old_vehicle_status, vehicle.status, actor_id)
    log_audit(db, "driver", driver.id, "status_change", old_driver_status, driver.status, actor_id)
    db.commit()
    db.refresh(trip)
    return trip


def complete_trip(
    db: Session,
    trip_id: int,
    actual_distance_km: float,
    final_odometer: float,
    fuel_liters: Optional[float],
    fuel_cost: Optional[float],
    toll_cost: Optional[float],
    other_cost: Optional[float],
    actor_id: Optional[int],
) -> Trip:
    trip = get_trip_or_404(db, trip_id)
    if trip.status != TripStatus.dispatched.value:
        raise HTTPException(status_code=400, detail="Only dispatched trips can be completed")
    if trip.vehicle is None or trip.driver is None:
        raise HTTPException(status_code=400, detail="Trip does not have assigned resources")
    if final_odometer < trip.vehicle.odometer:
        raise HTTPException(status_code=400, detail="Final odometer cannot be lower than current odometer")

    vehicle = trip.vehicle
    driver = trip.driver
    old_trip_status = trip.status
    old_vehicle_status = vehicle.status
    old_driver_status = driver.status

    trip.status = TripStatus.completed.value
    trip.actual_distance_km = actual_distance_km
    trip.completed_at = datetime.utcnow()
    vehicle.odometer = final_odometer
    vehicle.status = VehicleStatus.available.value
    driver.status = DriverStatus.available.value

    if fuel_liters and fuel_liters > 0:
        db.add(
            FuelLog(
                vehicle_id=vehicle.id,
                trip_id=trip.id,
                liters=fuel_liters,
                cost=fuel_cost or 0,
                log_date=date.today(),
            )
        )
    if (toll_cost or 0) > 0 or (other_cost or 0) > 0:
        db.add(
            Expense(
                trip_id=trip.id,
                vehicle_id=vehicle.id,
                toll_cost=toll_cost or 0,
                other_cost=other_cost or 0,
            )
        )

    log_audit(db, "trip", trip.id, "status_change", old_trip_status, trip.status, actor_id)
    log_audit(db, "vehicle", vehicle.id, "status_change", old_vehicle_status, vehicle.status, actor_id)
    log_audit(db, "driver", driver.id, "status_change", old_driver_status, driver.status, actor_id)
    db.commit()
    db.refresh(trip)
    return trip


def cancel_trip(db: Session, trip_id: int, actor_id: Optional[int]) -> Trip:
    trip = get_trip_or_404(db, trip_id)
    if trip.status not in (TripStatus.draft.value, TripStatus.dispatched.value):
        raise HTTPException(status_code=400, detail="Only draft or dispatched trips can be cancelled")

    old_trip_status = trip.status
    trip.status = TripStatus.cancelled.value

    if trip.vehicle and old_trip_status == TripStatus.dispatched.value:
        old_vehicle_status = trip.vehicle.status
        trip.vehicle.status = VehicleStatus.available.value
        log_audit(db, "vehicle", trip.vehicle.id, "status_change", old_vehicle_status, trip.vehicle.status, actor_id)
    if trip.driver and old_trip_status == TripStatus.dispatched.value:
        old_driver_status = trip.driver.status
        trip.driver.status = DriverStatus.available.value
        log_audit(db, "driver", trip.driver.id, "status_change", old_driver_status, trip.driver.status, actor_id)

    log_audit(db, "trip", trip.id, "status_change", old_trip_status, trip.status, actor_id)
    db.commit()
    db.refresh(trip)
    return trip


