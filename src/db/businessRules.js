import { getDB, updateVehicle, updateDriver, updateTrip, addExpense } from './storage';

/**
 * Validates if a registration number is unique across all vehicles except the one with matching id
 */
export const isRegNumberUnique = (regNumber, excludeId = null) => {
  const db = getDB();
  const regNormalized = regNumber.trim().toUpperCase();
  return !db.vehicles.some(v => v.id !== excludeId && v.regNumber.trim().toUpperCase() === regNormalized);
};

/**
 * Validates trip requirements.
 * Returns { valid: boolean, error: string | null }
 */
export const validateTripAssignment = (vehicleId, driverId, cargoWeight) => {
  const db = getDB();
  const vehicle = db.vehicles.find(v => v.id === vehicleId);
  const driver = db.drivers.find(d => d.id === driverId);

  if (!vehicle) {
    return { valid: false, error: 'Vehicle does not exist.' };
  }
  if (!driver) {
    return { valid: false, error: 'Driver does not exist.' };
  }

  // 1. Retired or In Shop vehicles must never appear in dispatch
  if (vehicle.status === 'Retired') {
    return { valid: false, error: `Vehicle ${vehicle.regNumber} is Retired and cannot be dispatched.` };
  }
  if (vehicle.status === 'In Shop') {
    return { valid: false, error: `Vehicle ${vehicle.regNumber} is In Shop (Maintenance) and cannot be dispatched.` };
  }

  // 2. Drivers with expired licenses or Suspended status cannot be assigned
  if (driver.status === 'Suspended') {
    return { valid: false, error: `Driver ${driver.name} is Suspended and cannot be assigned.` };
  }
  
  const today = new Date();
  const expiryDate = new Date(driver.expiryDate);
  if (expiryDate < today) {
    return { valid: false, error: `Driver ${driver.name} has an expired license (Expired on ${driver.expiryDate}) and cannot be assigned.` };
  }

  // 3. Driver or vehicle already On Trip cannot be assigned
  if (vehicle.status === 'On Trip') {
    return { valid: false, error: `Vehicle ${vehicle.regNumber} is already On Trip.` };
  }
  if (driver.status === 'On Trip') {
    return { valid: false, error: `Driver ${driver.name} is already On Trip.` };
  }

  // 4. Cargo Weight must not exceed the vehicle's maximum load capacity
  if (Number(cargoWeight) > Number(vehicle.maxCapacity)) {
    return { valid: false, error: `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxCapacity} kg).` };
  }

  return { valid: true, error: null };
};

/**
 * State Transition: Dispatches a trip and locks vehicle and driver
 */
export const dispatchTrip = (tripId) => {
  const db = getDB();
  const trip = db.trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found.');
  
  if (trip.status !== 'Draft') {
    throw new Error(`Only Draft trips can be dispatched. Current status is ${trip.status}`);
  }

  // Final check of availability
  const check = validateTripAssignment(trip.vehicleId, trip.driverId, trip.cargoWeight);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const vehicle = db.vehicles.find(v => v.id === trip.vehicleId);

  // Update Trip
  updateTrip(tripId, { 
    status: 'Dispatched',
    odometerStart: vehicle.odometer
  });

  // Update Vehicle & Driver to On Trip
  updateVehicle(trip.vehicleId, { status: 'On Trip' });
  updateDriver(trip.driverId, { status: 'On Trip' });
};

/**
 * State Transition: Completes a trip, updates odometer, and logs fuel cost
 */
export const completeTrip = (tripId, finalOdometer, fuelLiters, fuelCost) => {
  const db = getDB();
  const trip = db.trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found.');

  if (trip.status !== 'Dispatched') {
    throw new Error('Only Dispatched trips can be completed.');
  }

  const vehicle = db.vehicles.find(v => v.id === trip.vehicleId);
  
  if (Number(finalOdometer) < Number(trip.odometerStart)) {
    throw new Error(`Final odometer (${finalOdometer}) cannot be less than starting odometer (${trip.odometerStart}).`);
  }

  // Update Trip
  updateTrip(tripId, {
    status: 'Completed',
    odometerEnd: Number(finalOdometer),
    fuelConsumed: Number(fuelLiters)
  });

  // Update Vehicle status to Available & update odometer
  updateVehicle(trip.vehicleId, { 
    status: 'Available', 
    odometer: Number(finalOdometer) 
  });

  // Update Driver status to Available
  updateDriver(trip.driverId, { status: 'Available' });

  // Log fuel expense if cost > 0
  if (Number(fuelCost) > 0) {
    addExpense({
      vehicleId: trip.vehicleId,
      type: 'Fuel',
      date: new Date().toISOString().split('T')[0],
      amount: Number(fuelCost),
      details: `${fuelLiters}L Fuel for Trip ${trip.id}`
    });
  }
};

/**
 * State Transition: Cancels a dispatched trip and frees vehicle and driver
 */
export const cancelTrip = (tripId) => {
  const db = getDB();
  const trip = db.trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found.');

  if (trip.status !== 'Dispatched' && trip.status !== 'Draft') {
    throw new Error('Only Draft or Dispatched trips can be cancelled.');
  }

  const wasDispatched = trip.status === 'Dispatched';

  updateTrip(tripId, { status: 'Cancelled' });

  if (wasDispatched) {
    updateVehicle(trip.vehicleId, { status: 'Available' });
    updateDriver(trip.driverId, { status: 'Available' });
  }
};

/**
 * State Transition: Opens maintenance, locks vehicle
 */
export const openMaintenance = (vehicleId, maintenanceType, description, cost, dateOpened) => {
  const db = getDB();
  const vehicle = db.vehicles.find(v => v.id === vehicleId);
  if (!vehicle) throw new Error('Vehicle not found.');

  if (vehicle.status === 'Retired') {
    throw new Error('Retired vehicles cannot enter maintenance.');
  }

  // Create Maintenance Log
  const newLog = {
    vehicleId,
    type: maintenanceType,
    description,
    dateOpened: dateOpened || new Date().toISOString().split('T')[0],
    dateClosed: '',
    cost: Number(cost),
    status: 'Active'
  };

  const log = db.maintenance.push(newLog); // Note: we'll use storage helper instead
  
  // Set Vehicle status to In Shop
  updateVehicle(vehicleId, { status: 'In Shop' });

  // Add Maintenance to expenses
  addExpense({
    vehicleId,
    type: 'Maintenance',
    date: dateOpened || new Date().toISOString().split('T')[0],
    amount: Number(cost),
    details: `${maintenanceType}: ${description}`
  });
};

/**
 * State Transition: Closes maintenance, releases vehicle
 */
export const closeMaintenanceLog = (logId, dateClosed) => {
  const db = getDB();
  const log = db.maintenance.find(m => m.id === logId);
  if (!log) throw new Error('Maintenance log not found.');

  if (log.status !== 'Active') {
    throw new Error('Maintenance log is already closed.');
  }

  // Update Log
  updateMaintenance(logId, {
    status: 'Closed',
    dateClosed: dateClosed || new Date().toISOString().split('T')[0]
  });

  // Release vehicle unless it's Retired
  const vehicle = db.vehicles.find(v => v.id === log.vehicleId);
  if (vehicle && vehicle.status !== 'Retired') {
    updateVehicle(log.vehicleId, { status: 'Available' });
  }
};
