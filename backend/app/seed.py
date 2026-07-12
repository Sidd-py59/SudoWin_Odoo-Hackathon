from datetime import date

from sqlalchemy.orm import Session

from .auth import hash_password
from .models import (
    Driver,
    DriverStatus,
    Expense,
    FuelLog,
    MaintenanceLog,
    MaintenanceStatus,
    Role,
    Trip,
    TripStatus,
    User,
    Vehicle,
    VehicleStatus,
)

ROLES = ["admin", "fleet_manager", "dispatcher", "safety_officer", "financial_analyst"]

USERS = [
    ("admin@transitops.dev", "admin123", "TransitOps Admin", "admin"),
    ("dispatcher@transitops.dev", "dispatch123", "Dispatch Lead", "dispatcher"),
    ("fleet@transitops.dev", "fleet123", "Fleet Manager", "fleet_manager"),
    ("safety@transitops.dev", "safety123", "Safety Officer", "safety_officer"),
    ("finance@transitops.dev", "finance123", "Finance Analyst", "financial_analyst"),
]

VEHICLES = [
    {"registration_number": "TX-09-AB-1290", "name_model": "Atlas Hauler", "type": "truck", "max_load_kg": 18000, "odometer": 124560, "acquisition_cost": 8400000, "status": VehicleStatus.on_trip.value, "region": "Chennai"},
    {"registration_number": "TX-09-QD-2241", "name_model": "Metro Runner", "type": "van", "max_load_kg": 4500, "odometer": 74210, "acquisition_cost": 2550000, "status": VehicleStatus.available.value, "region": "Mumbai"},
    {"registration_number": "TX-11-KR-4408", "name_model": "Cargo Swift", "type": "mini", "max_load_kg": 3200, "odometer": 68904, "acquisition_cost": 1980000, "status": VehicleStatus.in_shop.value, "region": "Delhi"},
    {"registration_number": "TX-10-BN-5592", "name_model": "Urban Shuttle", "type": "bus", "max_load_kg": 9000, "odometer": 201450, "acquisition_cost": 12900000, "status": VehicleStatus.available.value, "region": "Hyderabad"},
    {"registration_number": "TX-12-CT-7833", "name_model": "Heavy Liner", "type": "truck", "max_load_kg": 22000, "odometer": 93440, "acquisition_cost": 9800000, "status": VehicleStatus.retired.value, "region": "Pune"},
]

DRIVERS = [
    {"name": "Aarav Mehta", "license_number": "DL-HEV-11290", "license_category": "Heavy", "license_expiry": date(2028, 4, 11), "contact_number": "+91 98765 44210", "safety_score": 93, "status": DriverStatus.on_trip.value},
    {"name": "Isha Rao", "license_number": "DL-MED-21804", "license_category": "Medium", "license_expiry": date(2027, 9, 5), "contact_number": "+91 98901 22563", "safety_score": 96, "status": DriverStatus.available.value},
    {"name": "Rohit Saini", "license_number": "DL-LGT-81193", "license_category": "Light", "license_expiry": date(2024, 12, 10), "contact_number": "+91 99871 66420", "safety_score": 71, "status": DriverStatus.suspended.value},
    {"name": "Priya Nair", "license_number": "DL-HEV-77654", "license_category": "Heavy", "license_expiry": date(2029, 1, 24), "contact_number": "+91 98440 22516", "safety_score": 89, "status": DriverStatus.off_duty.value},
]


def seed_database(db: Session) -> None:
    roles_by_name: dict[str, Role] = {role.name: role for role in db.query(Role).all()}
    for name in ROLES:
        if name not in roles_by_name:
            role = Role(name=name)
            db.add(role)
            roles_by_name[name] = role
    db.flush()

    for email, password, full_name, role_name in USERS:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(email=email, password_hash=hash_password(password), full_name=full_name, role_id=roles_by_name[role_name].id))

    for vehicle in VEHICLES:
        if not db.query(Vehicle).filter(Vehicle.registration_number == vehicle["registration_number"]).first():
            db.add(Vehicle(**vehicle))

    for driver in DRIVERS:
        if not db.query(Driver).filter(Driver.license_number == driver["license_number"]).first():
            db.add(Driver(**driver))

    db.commit()

    vehicles = {vehicle.registration_number: vehicle for vehicle in db.query(Vehicle).all()}
    drivers = {driver.license_number: driver for driver in db.query(Driver).all()}

    demo_trips = [
        {"trip_code": "TRP-1091", "source": "Chennai", "destination": "Bengaluru", "vehicle_id": vehicles["TX-09-AB-1290"].id, "driver_id": drivers["DL-HEV-11290"].id, "cargo_weight_kg": 12500, "planned_distance_km": 352, "actual_distance_km": None, "status": TripStatus.dispatched.value},
        {"trip_code": "TRP-1092", "source": "Mumbai", "destination": "Pune", "vehicle_id": vehicles["TX-09-QD-2241"].id, "driver_id": drivers["DL-MED-21804"].id, "cargo_weight_kg": 2100, "planned_distance_km": 151, "actual_distance_km": 151, "status": TripStatus.completed.value},
        {"trip_code": "TRP-1093", "source": "Hyderabad", "destination": "Vijayawada", "vehicle_id": None, "driver_id": None, "cargo_weight_kg": 5600, "planned_distance_km": 273, "actual_distance_km": None, "status": TripStatus.draft.value},
    ]
    for trip in demo_trips:
        if not db.query(Trip).filter(Trip.trip_code == trip["trip_code"]).first():
            db.add(Trip(**trip))
    db.commit()

    completed_trip = db.query(Trip).filter(Trip.trip_code == "TRP-1092").first()
    if completed_trip and not db.query(FuelLog).first():
        db.add(FuelLog(vehicle_id=completed_trip.vehicle_id, trip_id=completed_trip.id, liters=34, cost=3260, log_date=date(2026, 7, 5)))
        db.add(Expense(vehicle_id=completed_trip.vehicle_id, trip_id=completed_trip.id, toll_cost=850, repair_cost=0, other_cost=400))

    shop_vehicle = vehicles.get("TX-11-KR-4408")
    if shop_vehicle and not db.query(MaintenanceLog).first():
        db.add(MaintenanceLog(vehicle_id=shop_vehicle.id, service_type="Brake pad replacement", cost=48000, service_date=date(2026, 7, 2), status=MaintenanceStatus.active.value))

    db.commit()
