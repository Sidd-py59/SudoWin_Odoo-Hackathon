// LocalStorage DB Layer for TransitOps

const DEFAULT_USERS = [
  { email: 'manager@transitops.com', password: 'manager123', role: 'Fleet Manager', name: 'Alice Manager' },
  { email: 'dispatcher@transitops.com', password: 'dispatcher123', role: 'Dispatcher', name: 'Bob Dispatcher' },
  { email: 'safety@transitops.com', password: 'safety123', role: 'Safety Officer', name: 'Charlie Safety' },
  { email: 'analyst@transitops.com', password: 'analyst123', role: 'Financial Analyst', name: 'Dana Analyst' }
];

const DEFAULT_VEHICLES = [
  { id: 'V-001', regNumber: 'GJ-01-AA-1111', model: 'Volvo FH16', type: 'Heavy Truck', maxCapacity: 15000, odometer: 85000, acquisitionCost: 120000, status: 'On Trip' },
  { id: 'V-002', regNumber: 'GJ-01-BB-2222', model: 'Freightliner Cascadia', type: 'Semi-Truck', maxCapacity: 20000, odometer: 142000, acquisitionCost: 150000, status: 'In Shop' },
  { id: 'V-003', regNumber: 'GJ-01-CC-3333', model: 'Isuzu NPR', type: 'Box Truck', maxCapacity: 4000, odometer: 65000, acquisitionCost: 45000, status: 'Available' },
  { id: 'V-004', regNumber: 'GJ-01-DD-4444', model: 'Mercedes Sprinter', type: 'Van', maxCapacity: 800, odometer: 32000, acquisitionCost: 40000, status: 'Retired' },
  { id: 'V-005', regNumber: 'GJ-01-EE-5555', model: 'Ford Transit', type: 'Van', maxCapacity: 500, odometer: 12000, acquisitionCost: 35000, status: 'Available' }
];

const DEFAULT_DRIVERS = [
  { id: 'D-001', name: 'Alex', licenseNumber: 'DL-58392', licenseCategory: 'Class B', expiryDate: '2027-12-31', contactNumber: '555-0101', safetyScore: 95, status: 'Available' },
  { id: 'D-002', name: 'Sarah', licenseNumber: 'DL-92841', licenseCategory: 'Class A', expiryDate: '2027-05-15', contactNumber: '555-0102', safetyScore: 88, status: 'On Trip' },
  { id: 'D-003', name: 'John', licenseNumber: 'DL-10492', licenseCategory: 'Class A', expiryDate: '2023-01-10', contactNumber: '555-0103', safetyScore: 65, status: 'Off Duty' },
  { id: 'D-004', name: 'Mike', licenseNumber: 'DL-88234', licenseCategory: 'Class B', expiryDate: '2028-09-20', contactNumber: '555-0104', safetyScore: 42, status: 'Suspended' },
  { id: 'D-005', name: 'David', licenseNumber: 'DL-23948', licenseCategory: 'Class B', expiryDate: '2026-08-30', contactNumber: '555-0105', safetyScore: 90, status: 'Available' }
];

const DEFAULT_TRIPS = [
  { id: 'T-1001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicleId: 'V-001', driverId: 'D-002', cargoWeight: 12000, distance: 45, status: 'Dispatched', fuelConsumed: 0, odometerStart: 84955, odometerEnd: 0 },
  { id: 'T-1002', source: 'Rajkot Station', destination: 'Surat Industrial Park', vehicleId: 'V-003', driverId: 'D-005', cargoWeight: 3500, distance: 280, status: 'Completed', fuelConsumed: 40, odometerStart: 64720, odometerEnd: 65000 }
];

const DEFAULT_MAINTENANCE = [
  { id: 'M-2001', vehicleId: 'V-002', type: 'Oil Change', description: 'Routine 10k mile maintenance and filter replacement.', dateOpened: '2026-07-10', dateClosed: '', cost: 250, status: 'Active' },
  { id: 'M-2002', vehicleId: 'V-003', type: 'Brake Pad Replacement', description: 'Front brake pads replaced.', dateOpened: '2026-06-15', dateClosed: '2026-06-16', cost: 450, status: 'Closed' }
];

const DEFAULT_EXPENSES = [
  { id: 'E-3001', vehicleId: 'V-003', type: 'Fuel', date: '2026-06-15', amount: 120, details: '40L Diesel' },
  { id: 'E-3002', vehicleId: 'V-003', type: 'Tolls', date: '2026-06-15', amount: 35, details: 'NH-8 Expressway Toll' },
  { id: 'E-3003', vehicleId: 'V-001', type: 'Fuel', date: '2026-07-11', amount: 450, details: '150L Diesel' },
  { id: 'E-3004', vehicleId: 'V-003', type: 'Maintenance', date: '2026-06-16', amount: 450, details: 'Brake Pad Replacement Cost' },
  { id: 'E-3005', vehicleId: 'V-002', type: 'Maintenance', date: '2026-07-10', amount: 250, details: 'Oil Change Cost' }
];

// LocalStorage helpers
const getJSON = (key, defaultValue) => {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultValue;
  }
};

const setJSON = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const initDB = () => {
  getJSON('to_users', DEFAULT_USERS);
  getJSON('to_vehicles', DEFAULT_VEHICLES);
  getJSON('to_drivers', DEFAULT_DRIVERS);
  getJSON('to_trips', DEFAULT_TRIPS);
  getJSON('to_maintenance', DEFAULT_MAINTENANCE);
  getJSON('to_expenses', DEFAULT_EXPENSES);
};

export const getDB = () => {
  initDB();
  return {
    users: getJSON('to_users', DEFAULT_USERS),
    vehicles: getJSON('to_vehicles', DEFAULT_VEHICLES),
    drivers: getJSON('to_drivers', DEFAULT_DRIVERS),
    trips: getJSON('to_trips', DEFAULT_TRIPS),
    maintenance: getJSON('to_maintenance', DEFAULT_MAINTENANCE),
    expenses: getJSON('to_expenses', DEFAULT_EXPENSES)
  };
};

export const saveDB = (data) => {
  if (data.users) setJSON('to_users', data.users);
  if (data.vehicles) setJSON('to_vehicles', data.vehicles);
  if (data.drivers) setJSON('to_drivers', data.drivers);
  if (data.trips) setJSON('to_trips', data.trips);
  if (data.maintenance) setJSON('to_maintenance', data.maintenance);
  if (data.expenses) setJSON('to_expenses', data.expenses);
};

// CRUD Entity Functions
export const addVehicle = (vehicle) => {
  const db = getDB();
  const newVehicle = { id: `V-00${db.vehicles.length + 1}`, ...vehicle };
  db.vehicles.push(newVehicle);
  saveDB(db);
  return newVehicle;
};

export const updateVehicle = (id, updatedFields) => {
  const db = getDB();
  db.vehicles = db.vehicles.map(v => v.id === id ? { ...v, ...updatedFields } : v);
  saveDB(db);
};

export const addDriver = (driver) => {
  const db = getDB();
  const newDriver = { id: `D-00${db.drivers.length + 1}`, ...driver };
  db.drivers.push(newDriver);
  saveDB(db);
  return newDriver;
};

export const updateDriver = (id, updatedFields) => {
  const db = getDB();
  db.drivers = db.drivers.map(d => d.id === id ? { ...d, ...updatedFields } : d);
  saveDB(db);
};

export const addTrip = (trip) => {
  const db = getDB();
  const newTrip = { id: `T-${1000 + db.trips.length + 1}`, ...trip };
  db.trips.push(newTrip);
  saveDB(db);
  return newTrip;
};

export const updateTrip = (id, updatedFields) => {
  const db = getDB();
  db.trips = db.trips.map(t => t.id === id ? { ...t, ...updatedFields } : t);
  saveDB(db);
};

export const addMaintenance = (log) => {
  const db = getDB();
  const newLog = { id: `M-${2000 + db.maintenance.length + 1}`, ...log };
  db.maintenance.push(newLog);
  saveDB(db);
  return newLog;
};

export const updateMaintenance = (id, updatedFields) => {
  const db = getDB();
  db.maintenance = db.maintenance.map(m => m.id === id ? { ...m, ...updatedFields } : m);
  saveDB(db);
};

export const addExpense = (expense) => {
  const db = getDB();
  const newExpense = { id: `E-${3000 + db.expenses.length + 1}`, ...expense };
  db.expenses.push(newExpense);
  saveDB(db);
  return newExpense;
};
