/**
 * CommonJS self-contained test script for Node.js runner.
 * Validates the core business rule functions.
 */
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch/test-db');

// --- Mock Storage Logic ---
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

// --- Mock Validation Rules ---
const isRegNumberUnique = (regNumber, vehicles) => {
  const regNormalized = regNumber.trim().toUpperCase();
  return !vehicles.some(v => v.regNumber.trim().toUpperCase() === regNormalized);
};

const validateTripAssignment = (vehicle, driver, cargoWeight) => {
  if (!vehicle) return { valid: false, error: 'Vehicle does not exist.' };
  if (!driver) return { valid: false, error: 'Driver does not exist.' };

  if (vehicle.status === 'Retired') return { valid: false, error: `Vehicle is Retired.` };
  if (vehicle.status === 'In Shop') return { valid: false, error: `Vehicle is In Shop.` };
  if (driver.status === 'Suspended') return { valid: false, error: `Driver is Suspended.` };
  
  const today = new Date();
  const expiryDate = new Date(driver.expiryDate);
  if (expiryDate < today) return { valid: false, error: `Driver license is expired.` };

  if (vehicle.status === 'On Trip') return { valid: false, error: `Vehicle is already On Trip.` };
  if (driver.status === 'On Trip') return { valid: false, error: `Driver is already On Trip.` };

  if (Number(cargoWeight) > Number(vehicle.maxCapacity)) {
    return { valid: false, error: `Cargo weight (${cargoWeight} kg) exceeds capacity (${vehicle.maxCapacity} kg).` };
  }

  return { valid: true, error: null };
};

// --- Test Runner ---
const runTests = () => {
  console.log('=== RUNNING TRANSITOPS RULE VALIDATION TESTS ===');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`\x1b[32m[PASS]\x1b[0m ${message}`);
      passed++;
    } else {
      console.log(`\x1b[31m[FAIL]\x1b[0m ${message}`);
      failed++;
    }
  };

  // Test 1: Unique reg number
  assert(isRegNumberUnique('GJ-01-AA-1111', DEFAULT_VEHICLES) === false, 'Detects duplicate registration GJ-01-AA-1111');
  assert(isRegNumberUnique('GJ-99-XX-9999', DEFAULT_VEHICLES) === true, 'Allows unique registration GJ-99-XX-9999');

  // Test 2: Cargo Weight limit checking
  const v5 = DEFAULT_VEHICLES.find(v => v.id === 'V-005'); // Ford Transit (500kg)
  const d1 = DEFAULT_DRIVERS.find(d => d.id === 'D-001'); // Alex (Available, valid)
  
  const overweight = validateTripAssignment(v5, d1, 600);
  assert(overweight.valid === false && overweight.error.includes('exceeds'), 'Blocks cargo cargo weight 600kg for 500kg capacity vehicle');

  const validweight = validateTripAssignment(v5, d1, 450);
  assert(validweight.valid === true, 'Allows cargo cargo weight 450kg for 500kg capacity vehicle');

  // Test 3: Expired permit check
  const d3 = DEFAULT_DRIVERS.find(d => d.id === 'D-003'); // John (Expired license)
  const expired = validateTripAssignment(v5, d3, 400);
  assert(expired.valid === false && expired.error.includes('expired'), 'Blocks driver with expired license permit');

  // Test 4: Suspended check
  const d4 = DEFAULT_DRIVERS.find(d => d.id === 'D-004'); // Mike (Suspended)
  const suspended = validateTripAssignment(v5, d4, 400);
  assert(suspended.valid === false && suspended.error.includes('Suspended'), 'Blocks suspended driver from assignment');

  // Test 5: On Trip status check
  const v1 = DEFAULT_VEHICLES.find(v => v.id === 'V-001'); // On Trip
  const busy = validateTripAssignment(v1, d1, 400);
  assert(busy.valid === false && busy.error.includes('already On Trip'), 'Blocks already dispatched vehicle');

  console.log(`\nTests Run: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
  process.exit(0);
};

runTests();
