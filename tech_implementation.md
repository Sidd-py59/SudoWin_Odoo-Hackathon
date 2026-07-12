# TransitOps Technical Implementation Plan

## 1. Goal

Build TransitOps as an Odoo-ready fleet and trip operations module using:

- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite
- Frontend: React, Vite, TypeScript
- Styling: TailwindCSS
- Charts: Recharts

The product should not feel like simple CRUD. The main winning idea is:

> Every trip action automatically protects fleet availability, driver safety, cost visibility, and auditability.

TransitOps should help an Odoo user connect fleet status, driver readiness, trip dispatch, maintenance, expenses, and analytics in one operational workflow.

## 2. High-Level Architecture

```text
React + TypeScript frontend
        |
        | REST API
        v
FastAPI backend
        |
        | SQLAlchemy ORM
        v
SQLite database
```

Recommended folder structure:

```text
transitops/
  backend/
    app/
      main.py
      database.py
      models.py
      schemas.py
      seed.py
      auth.py
      dependencies.py
      routers/
        auth.py
        dashboard.py
        vehicles.py
        drivers.py
        trips.py
        maintenance.py
        expenses.py
        analytics.py
        audit.py
      services/
        trip_service.py
        maintenance_service.py
        analytics_service.py
        audit_service.py
    requirements.txt

  frontend/
    src/
      api/
      auth/
      components/
      pages/
      App.tsx
      main.tsx
    package.json
```

## 3. Backend Stack

Use:

- Python
- FastAPI
- SQLite
- SQLAlchemy
- Pydantic
- JWT authentication
- passlib bcrypt
- Uvicorn

Install:

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib[bcrypt] python-multipart
```

## 4. Frontend Stack

Use:

- React
- Vite
- TypeScript
- TailwindCSS
- React Router
- TanStack Query
- Axios
- Recharts
- Lucide React

Install:

```bash
npm create vite@latest frontend -- --template react-ts
npm install axios @tanstack/react-query react-router-dom recharts lucide-react
npm install -D tailwindcss postcss autoprefixer
```

## 5. Database Models

Core tables:

- `users`
- `roles`
- `vehicles`
- `drivers`
- `trips`
- `maintenance_logs`
- `fuel_logs`
- `expenses`
- `audit_logs`

Important relationships:

- `User -> Role`
- `Trip -> Vehicle`
- `Trip -> Driver`
- `MaintenanceLog -> Vehicle`
- `FuelLog -> Vehicle`
- `FuelLog -> Trip`
- `Expense -> Trip`
- `AuditLog -> User`

### Vehicle Model

Fields:

- `id`
- `registration_number`
- `name_model`
- `type`
- `max_load_kg`
- `odometer`
- `acquisition_cost`
- `status`: `available | on_trip | in_shop | retired`
- `region`
- `created_at`

### Driver Model

Fields:

- `id`
- `name`
- `license_number`
- `license_category`
- `license_expiry`
- `contact_number`
- `safety_score`
- `status`: `available | on_trip | off_duty | suspended`
- `created_at`

### Trip Model

Fields:

- `id`
- `trip_code`
- `source`
- `destination`
- `vehicle_id`
- `driver_id`
- `cargo_weight_kg`
- `planned_distance_km`
- `actual_distance_km`
- `status`: `draft | dispatched | completed | cancelled`
- `dispatched_at`
- `completed_at`
- `created_at`

### Maintenance Log Model

Fields:

- `id`
- `vehicle_id`
- `service_type`
- `cost`
- `service_date`
- `status`: `active | completed`
- `created_at`

### Fuel Log Model

Fields:

- `id`
- `vehicle_id`
- `trip_id`
- `liters`
- `cost`
- `log_date`

### Expense Model

Fields:

- `id`
- `trip_id`
- `vehicle_id`
- `toll_cost`
- `repair_cost`
- `other_cost`
- `created_at`

### Audit Log Model

Fields:

- `id`
- `entity_type`
- `entity_id`
- `action`
- `old_value`
- `new_value`
- `actor_user_id`
- `timestamp`

Example audit entries:

```text
Trip TR-001 changed draft -> dispatched
Vehicle MH-12-8899 changed available -> on_trip
Driver Ravi Kumar changed available -> on_trip
```

## 6. Business Logic Layer

This is the most important part of the project.

Create:

```text
backend/app/services/trip_service.py
```

All trip status changes must happen inside service functions, not directly inside routers or React components.

Required functions:

- `create_trip()`
- `dispatch_trip()`
- `complete_trip()`
- `cancel_trip()`

### Dispatch Validation Rules

Before dispatching a trip, validate:

- Vehicle exists.
- Driver exists.
- Trip is in `draft` state.
- Vehicle status is `available`.
- Driver status is `available`.
- Vehicle is not in maintenance.
- Vehicle is not retired.
- Driver license is not expired.
- Driver is not suspended.
- Cargo weight is less than or equal to vehicle capacity.

### Dispatch Success Behavior

When dispatch succeeds:

- `trip.status = dispatched`
- `vehicle.status = on_trip`
- `driver.status = on_trip`
- `trip.dispatched_at` is set.
- Audit logs are created.

### Trip Completion Behavior

When a trip completes:

- `trip.status = completed`
- `vehicle.status = available`
- `driver.status = available`
- `vehicle.odometer` is updated.
- Fuel log is optionally created.
- Expense entry is optionally created.
- `trip.completed_at` is set.
- Audit logs are created.

### Trip Cancellation Behavior

When a dispatched trip is cancelled:

- `trip.status = cancelled`
- `vehicle.status = available`
- `driver.status = available`
- Audit logs are created.

## 7. API Routes

### Auth

```text
POST /auth/login
GET  /auth/me
```

### Vehicles

```text
GET    /vehicles
POST   /vehicles
GET    /vehicles/{id}
PUT    /vehicles/{id}
DELETE /vehicles/{id}
GET    /vehicles/available
```

### Drivers

```text
GET    /drivers
POST   /drivers
GET    /drivers/{id}
PUT    /drivers/{id}
DELETE /drivers/{id}
GET    /drivers/available
```

### Trips

```text
GET  /trips
POST /trips
POST /trips/{id}/dispatch
POST /trips/{id}/complete
POST /trips/{id}/cancel
```

### Maintenance

```text
GET  /maintenance
POST /maintenance
POST /maintenance/{id}/close
```

### Expenses And Fuel

```text
GET  /expenses
POST /expenses
GET  /fuel-logs
POST /fuel-logs
```

### Dashboard

```text
GET /dashboard/kpis
```

### Analytics

```text
GET /analytics/fleet-utilization
GET /analytics/fuel-efficiency
GET /analytics/cost-per-trip
GET /analytics/top-costly-vehicles
```

### Audit

```text
GET /audit-logs
```

## 8. RBAC Plan

Roles:

- `admin`
- `fleet_manager`
- `dispatcher`
- `safety_officer`
- `financial_analyst`

Access matrix:

| Role | Access |
| --- | --- |
| Admin | Everything |
| Fleet Manager | Vehicles, maintenance, dashboard, analytics |
| Dispatcher | Trips, drivers, dashboard |
| Safety Officer | Drivers, audit logs, dashboard |
| Financial Analyst | Expenses, analytics, dashboard |

Implement backend role checks using a FastAPI dependency:

```python
require_roles(["admin", "dispatcher"])
```

On the frontend, hide sidebar items based on the logged-in user's role. Backend authorization should still be enforced, because frontend hiding is only a UX convenience.

## 9. Frontend Pages

Build pages in this order:

1. Login
2. Dashboard
3. Fleet
4. Drivers
5. Trips
6. Maintenance
7. Fuel And Expenses
8. Analytics
9. Audit Logs
10. Settings / RBAC Matrix

### Dashboard

Show KPI cards:

- Total vehicles
- Available vehicles
- Vehicles on trip
- Vehicles in maintenance
- Active drivers
- Active trips
- Completed trips
- Fleet utilization percentage
- Total trip cost

### Trips Page

This should be the centerpiece of the demo.

Features:

- Create trip form
- Vehicle dropdown with only available vehicles
- Driver dropdown with only available drivers
- Dispatch button
- Complete button
- Cancel button
- Validation error panel
- Trip lifecycle stepper

Lifecycle:

```text
Draft -> Dispatched -> Completed
```

Validation panel example:

```text
Cannot dispatch:
- Vehicle is currently in maintenance
- Driver license expired
- Cargo exceeds vehicle capacity

Suggested fix:
- Select Truck-04
- Assign driver Ravi Kumar
```

### Maintenance Page

Features:

- Open maintenance
- Close maintenance
- Vehicle status changes to `in_shop`
- Vehicle disappears from dispatch dropdown
- Maintenance cost is tracked

### Fuel And Expenses Page

Track:

- Fuel liters
- Fuel cost
- Toll cost
- Repair cost
- Other cost

### Analytics Page

Use Recharts.

Charts:

- Fleet utilization bar chart
- Fuel cost by vehicle
- Cost per trip
- Top 5 costliest vehicles
- Monthly expenses

### Audit Logs Page

Show table columns:

- Timestamp
- Actor
- Entity type
- Entity ID
- Action
- Old value
- New value

Example:

```text
12:40 PM | Dispatcher | Trip TR-001 | status_change | draft -> dispatched
12:40 PM | Dispatcher | Vehicle MH-12-8899 | status_change | available -> on_trip
```

## 10. Winning Differentiators

### Smart Dispatch Validator

This is the highest-priority feature. It proves the app understands real transport operations.

The app should block unsafe or invalid dispatches and explain why.

### Why Can't I Dispatch Panel

When dispatch fails, show:

```text
Cannot dispatch this trip because:
- Vehicle is currently in maintenance
- Driver license expires in 2 days
- Cargo exceeds vehicle capacity by 420 kg

Suggested fix:
- Choose Truck-08
- Assign driver Meera
```

This turns validation into an intelligent assistant experience.

### Automatic Status Synchronization

Important status changes should cascade automatically:

- Dispatch trip: vehicle and driver become `on_trip`.
- Complete trip: vehicle and driver become `available`.
- Open maintenance: vehicle becomes `in_shop`.
- Close maintenance: vehicle becomes `available`.

### Audit Logs

Every important action should be tracked:

- Trip created
- Trip dispatched
- Trip completed
- Vehicle status changed
- Driver status changed
- Maintenance opened
- Maintenance closed

### Cost Analytics

For every trip, calculate:

```text
total_cost = fuel_cost + toll_cost + repair_cost + other_expenses
cost_per_km = total_cost / distance
```

Show:

- Cheapest vehicle
- Costliest vehicle
- Fuel efficiency
- Cost per kilometer
- Total expenses

## 11. Seed Data

Create realistic demo data:

- 5 users
- 10 vehicles
- 10 drivers
- 8 trips
- 4 maintenance logs
- 10 fuel logs
- 8 expenses
- Audit logs

Important demo cases:

- One available vehicle
- One vehicle in maintenance
- One vehicle already on trip
- One retired vehicle
- One driver with expired license
- One suspended driver
- One available driver
- One overweight cargo scenario

These cases allow the team to demonstrate both successful and failed dispatch flows.

## 12. Eight-Hour Build Order

### Hour 1: Backend Setup

- FastAPI project
- SQLite connection
- SQLAlchemy models
- Create tables
- Seed script

### Hour 2: Auth And RBAC

- Login endpoint
- JWT token creation
- Current user endpoint
- Role dependency
- Frontend login page
- Protected routes

### Hour 3: Vehicles And Drivers

- Vehicle CRUD APIs
- Driver CRUD APIs
- Available vehicle API
- Available driver API
- Fleet page
- Drivers page

### Hour 4: Trip Engine

- Trip create endpoint
- Dispatch validation
- Complete trip
- Cancel trip
- Status updates
- Audit logs

### Hour 5: Frontend Trip Page

- Trip form
- Vehicle dropdown
- Driver dropdown
- Dispatch button
- Complete button
- Validation panel
- Lifecycle stepper

### Hour 6: Maintenance And Expenses

- Open maintenance
- Close maintenance
- Fuel logs
- Expenses
- Cost calculation

### Hour 7: Dashboard And Analytics

- KPI cards
- Charts
- Cost per km
- Top costly vehicles
- Utilization percentage

### Hour 8: Polish And Demo

- Fix bugs
- Responsive check
- Seed data reset button
- Prepare demo script
- README
- Screenshots

## 13. Demo Script

Use this exact flow:

1. Login as dispatcher.
2. Open Dashboard and show live KPIs.
3. Create a trip.
4. Try dispatching with a vehicle in maintenance.
5. Show validation failure.
6. Try an expired-license driver.
7. Show validation failure.
8. Select valid vehicle and driver.
9. Dispatch trip.
10. Show vehicle and driver status changed automatically.
11. Complete trip with fuel and toll cost.
12. Open Analytics and show cost per km.
13. Open Audit Logs and show every action was tracked.

## 14. Final Winning Message

The final pitch should be:

> TransitOps helps Odoo users run transport operations safely, profitably, and automatically by connecting fleet status, driver readiness, trip dispatch, maintenance, and cost analytics in one workflow.

The features most likely to impress judges are:

- Smart Dispatch Validator
- Why Can't I Dispatch panel
- Automatic status synchronization
- Audit logs
- Cost per km analytics
- Role-based access
- Maintenance blocking
