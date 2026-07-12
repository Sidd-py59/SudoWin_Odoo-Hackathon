# 🚛 TransitOps

A centralized Transport Operations Management Platform designed to streamline fleet operations, improve resource utilization, and simplify transport management through an intuitive web-based interface.

---

## 📌 Overview

TransitOps is an intelligent transport operations platform that goes beyond traditional CRUD by automating fleet availability, driver readiness, maintenance workflows, expense tracking, and operational analytics through a unified workflow.

---

## 🚨 Problem Statement

Logistics organizations often struggle with fragmented transport operations due to manual record-keeping, inefficient trip planning, delayed maintenance tracking, inaccurate expense management, and limited operational insights. These challenges result in increased costs, reduced productivity, and poor resource utilization.

TransitOps addresses these issues by providing a centralized and intelligent transport operations platform.

---

## 💡 Our Solution

TransitOps provides a unified platform that enables organizations to:

- Manage vehicles and drivers
- Schedule and monitor trips
- Track maintenance records
- Record fuel and operational expenses
- View fleet performance through dashboards
- Enforce transport business rules efficiently

---

## ✨ Key Features

- 🔐 Role-Based Authentication (RBAC)
- 🚚 Vehicle Management
- 👨‍✈️ Driver Management
- 🛣️ Trip Planning & Tracking
- 🛠️ Maintenance Tracking
- ⛽ Fuel & Expense Management
- 📊 Dashboard with KPIs
- 📈 Reports & Analytics

---

## 👥 User Roles

- Fleet Manager
- Driver
- Safety Officer
- Finance/Admin

---

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy ORM
- Pydantic
- JWT Authentication
- Passlib (bcrypt)
- Uvicorn

### Database
- SQLite

### Architecture

```
React + TypeScript
        │
        │ REST API
        ▼
FastAPI Backend
        │
        │ SQLAlchemy ORM
        ▼
SQLite Database
```

### Development Tools

- Git
- GitHub
- Visual Studio Code

### Project Highlights

- RESTful API Architecture
- Role-Based Access Control (RBAC)
- JWT Authentication
- Smart Dispatch Validation
- Automatic Status Synchronization
- Audit Logging
- Interactive Analytics Dashboard
- Responsive Web Interface

---

## 📂 Project Structure

```
transitops/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

---

## 🔄 Workflow

1. Register Vehicles
2. Register Drivers
3. Create & Assign Trips
4. Dispatch Trips
5. Track Fuel & Expenses
6. Schedule Vehicle Maintenance
7. Monitor Fleet Performance
8. Generate Reports

---

## 📊 Dashboard

The dashboard provides real-time insights including:

- Active Vehicles
- Available Vehicles
- Vehicles Under Maintenance
- Active Trips
- Pending Trips
- Driver Availability
- Fleet Utilization
- Expense Overview

---

## 📋 Business Rules

- Every vehicle must have a unique registration number.
- Drivers can only be assigned to one active trip at a time.
- Vehicle capacity cannot be exceeded.
- Vehicles under maintenance cannot be assigned to trips.
- Driver licenses must remain valid.
- Fuel and expense records are linked to their respective trips.

---

## 🚀 Future Enhancements

- Email & SMS Notifications
- PDF Report Generation
- Interactive Charts & Analytics
- Vehicle Document Management
- GPS Tracking Integration
- Predictive Maintenance using AI

---

## 🌟 Why TransitOps?

TransitOps is designed to simplify transport operations by combining fleet management, driver compliance, trip dispatch, maintenance tracking, expense monitoring, and operational analytics into a single intelligent workflow. By automating critical business rules and providing actionable insights, the platform helps organizations operate more safely, efficiently, and profitably.

## 👨‍💻 Team

**Team Name:** Sudo Win
