export type VehicleStatus = "available" | "on_trip" | "maintenance" | "retired";
export type DriverStatus = "available" | "on_trip" | "suspended" | "off_duty";
export type TripStatus = "draft" | "dispatched" | "completed" | "cancelled";
export type MaintenanceStatus = "open" | "in_progress" | "closed";

export type VehicleType = "Truck" | "Van" | "Bus" | "Mini Truck";

export type Vehicle = {
  id: string;
  registrationNumber: string;
  name: string;
  type: VehicleType;
  capacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
};

export type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  category: "Heavy" | "Medium" | "Light";
  expiryDate: string;
  phone: string;
  safetyScore: number;
  status: DriverStatus;
};

export type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  source: string;
  destination: string;
  cargoWeightKg: number;
  distanceKm: number;
  status: TripStatus;
};

export type MaintenanceLog = {
  id: string;
  vehicleId: string;
  issue: string;
  cost: number;
  workshop: string;
  date: string;
  status: MaintenanceStatus;
};

export type FuelLog = {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
};

export type ExpenseLog = {
  id: string;
  vehicleId: string;
  type: "Maintenance" | "Insurance" | "Toll" | "Permit" | "Other";
  amount: number;
  notes: string;
};

export const vehicles: Vehicle[] = [
  {
    id: "veh-1",
    registrationNumber: "TX-09-AB-1290",
    name: "Atlas Hauler",
    type: "Truck",
    capacityKg: 18000,
    odometerKm: 124560,
    acquisitionCost: 8400000,
    status: "on_trip",
  },
  {
    id: "veh-2",
    registrationNumber: "TX-09-QD-2241",
    name: "Metro Runner",
    type: "Van",
    capacityKg: 4500,
    odometerKm: 74210,
    acquisitionCost: 2550000,
    status: "available",
  },
  {
    id: "veh-3",
    registrationNumber: "TX-11-KR-4408",
    name: "Cargo Swift",
    type: "Mini Truck",
    capacityKg: 3200,
    odometerKm: 68904,
    acquisitionCost: 1980000,
    status: "maintenance",
  },
  {
    id: "veh-4",
    registrationNumber: "TX-10-BN-5592",
    name: "Urban Shuttle",
    type: "Bus",
    capacityKg: 9000,
    odometerKm: 201450,
    acquisitionCost: 12900000,
    status: "available",
  },
  {
    id: "veh-5",
    registrationNumber: "TX-12-CT-7833",
    name: "Heavy Liner",
    type: "Truck",
    capacityKg: 22000,
    odometerKm: 93440,
    acquisitionCost: 9800000,
    status: "retired",
  },
];

export const drivers: Driver[] = [
  {
    id: "drv-1",
    name: "Aarav Mehta",
    licenseNumber: "DL-HEV-11290",
    category: "Heavy",
    expiryDate: "2028-04-11",
    phone: "+91 98765 44210",
    safetyScore: 93,
    status: "on_trip",
  },
  {
    id: "drv-2",
    name: "Isha Rao",
    licenseNumber: "DL-MED-21804",
    category: "Medium",
    expiryDate: "2027-09-05",
    phone: "+91 98901 22563",
    safetyScore: 96,
    status: "available",
  },
  {
    id: "drv-3",
    name: "Rohit Saini",
    licenseNumber: "DL-LGT-81193",
    category: "Light",
    expiryDate: "2024-12-10",
    phone: "+91 99871 66420",
    safetyScore: 71,
    status: "suspended",
  },
  {
    id: "drv-4",
    name: "Priya Nair",
    licenseNumber: "DL-HEV-77654",
    category: "Heavy",
    expiryDate: "2029-01-24",
    phone: "+91 98440 22516",
    safetyScore: 89,
    status: "off_duty",
  },
];

export const trips: Trip[] = [
  {
    id: "TRP-1091",
    vehicleId: "veh-1",
    driverId: "drv-1",
    source: "Chennai",
    destination: "Bengaluru",
    cargoWeightKg: 12500,
    distanceKm: 352,
    status: "dispatched",
  },
  {
    id: "TRP-1092",
    vehicleId: "veh-2",
    driverId: "drv-2",
    source: "Mumbai",
    destination: "Pune",
    cargoWeightKg: 2100,
    distanceKm: 151,
    status: "completed",
  },
  {
    id: "TRP-1093",
    vehicleId: "veh-4",
    driverId: "drv-4",
    source: "Hyderabad",
    destination: "Vijayawada",
    cargoWeightKg: 5600,
    distanceKm: 273,
    status: "draft",
  },
  {
    id: "TRP-1094",
    vehicleId: "veh-3",
    driverId: "drv-2",
    source: "Delhi",
    destination: "Noida",
    cargoWeightKg: 1000,
    distanceKm: 24,
    status: "cancelled",
  },
];

export const maintenanceLogs: MaintenanceLog[] = [
  {
    id: "mnt-1",
    vehicleId: "veh-3",
    issue: "Brake pad replacement",
    cost: 48000,
    workshop: "Prime Auto Works",
    date: "2026-07-02",
    status: "in_progress",
  },
  {
    id: "mnt-2",
    vehicleId: "veh-1",
    issue: "Engine diagnostics",
    cost: 26500,
    workshop: "Highway Motors",
    date: "2026-06-29",
    status: "open",
  },
  {
    id: "mnt-3",
    vehicleId: "veh-2",
    issue: "AC compressor service",
    cost: 14000,
    workshop: "FleetCare Hub",
    date: "2026-06-20",
    status: "closed",
  },
];

export const fuelLogs: FuelLog[] = [
  { id: "fuel-1", vehicleId: "veh-1", liters: 280, cost: 27860, date: "2026-07-10" },
  { id: "fuel-2", vehicleId: "veh-2", liters: 96, cost: 9312, date: "2026-07-10" },
  { id: "fuel-3", vehicleId: "veh-4", liters: 190, cost: 18905, date: "2026-07-08" },
];

export const expenseLogs: ExpenseLog[] = [
  {
    id: "exp-1",
    vehicleId: "veh-1",
    type: "Maintenance",
    amount: 26500,
    notes: "Engine diagnostics and filter change",
  },
  {
    id: "exp-2",
    vehicleId: "veh-2",
    type: "Insurance",
    amount: 124000,
    notes: "Annual comprehensive policy",
  },
  {
    id: "exp-3",
    vehicleId: "veh-4",
    type: "Toll",
    amount: 1890,
    notes: "Interstate toll movement",
  },
  {
    id: "exp-4",
    vehicleId: "veh-3",
    type: "Other",
    amount: 5200,
    notes: "Spare lamps and consumables",
  },
];

export const monthlyFuelCosts = [
  { month: "Jan", amount: 184000 },
  { month: "Feb", amount: 201500 },
  { month: "Mar", amount: 193400 },
  { month: "Apr", amount: 214100 },
  { month: "May", amount: 227800 },
  { month: "Jun", amount: 219400 },
  { month: "Jul", amount: 230900 },
];

export const utilizationTrend = [
  { week: "W1", utilization: 61 },
  { week: "W2", utilization: 65 },
  { week: "W3", utilization: 69 },
  { week: "W4", utilization: 72 },
  { week: "W5", utilization: 70 },
  { week: "W6", utilization: 74 },
  { week: "W7", utilization: 76 },
];

export const reportSeries = {
  vehicleRoi: [
    { name: "Truck", value: 18, fill: "var(--color-Truck)" },
    { name: "Van", value: 22, fill: "var(--color-Van)" },
    { name: "Bus", value: 15, fill: "var(--color-Bus)" },
    { name: "Mini", value: 27, fill: "var(--color-Mini)" },
  ],
  fuelEfficiency: [
    { month: "Jan", score: 78 },
    { month: "Feb", score: 80 },
    { month: "Mar", score: 79 },
    { month: "Apr", score: 82 },
    { month: "May", score: 84 },
    { month: "Jun", score: 83 },
  ],
  maintenanceCost: [
    { month: "Jan", amount: 86000 },
    { month: "Feb", amount: 92000 },
    { month: "Mar", amount: 78000 },
    { month: "Apr", amount: 110000 },
    { month: "May", amount: 97000 },
    { month: "Jun", amount: 103000 },
  ],
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function getVehicleName(vehicleId: string) {
  return vehicles.find((vehicle) => vehicle.id === vehicleId)?.name ?? "Unknown Vehicle";
}

export function getDriverName(driverId: string) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? "Unknown Driver";
}

export function isLicenseExpired(expiryDate: string) {
  const todayUtc = new Date();
  const todayIso = `${todayUtc.getUTCFullYear()}-${String(todayUtc.getUTCMonth() + 1).padStart(2, "0")}-${String(todayUtc.getUTCDate()).padStart(2, "0")}`;
  return expiryDate < todayIso;
}

export function getDashboardKpis() {
  const activeVehicles = vehicles.filter((v) => v.status !== "retired").length;
  const availableVehicles = vehicles.filter((v) => v.status === "available").length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length;
  const activeTrips = trips.filter((t) => t.status === "dispatched").length;
  const driversOnDuty = drivers.filter(
    (d) => d.status === "on_trip" || d.status === "available",
  ).length;
  const fleetUtilization = Math.round(
    (vehicles.filter((v) => v.status === "on_trip").length / activeVehicles) * 100,
  );

  return {
    activeVehicles,
    availableVehicles,
    maintenanceVehicles,
    activeTrips,
    driversOnDuty,
    fleetUtilization,
  };
}

export function validateTrip(payload: {
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
}) {
  const messages: string[] = [];
  const vehicle = vehicles.find((item) => item.id === payload.vehicleId);
  const driver = drivers.find((item) => item.id === payload.driverId);

  if (!vehicle || vehicle.status !== "available") {
    messages.push("Vehicle unavailable");
  }

  if (!driver || driver.status !== "available") {
    messages.push("Driver unavailable");
  }

  if (vehicle && payload.cargoWeightKg > vehicle.capacityKg) {
    messages.push("Cargo exceeds capacity");
  }

  if (driver && isLicenseExpired(driver.expiryDate)) {
    messages.push("License expired");
  }

  return messages;
}
