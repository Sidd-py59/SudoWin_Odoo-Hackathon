/**
 * Business Rules Automated Testing Suite
 * Validates core business transitions, weight checking, and license compliance rules.
 */

// Mock localStorage for Node.js environment
if (typeof localStorage === 'undefined' || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  global.localStorage = new LocalStorage('./scratch/scratch-db');
}

const storage = require('../db/storage.js');
const rules = require('../db/businessRules.js');

const runTests = () => {
  console.log('=== STARTING AUTOMATED VALIDATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`\x1b[32m[PASS] ${message}\x1b[0m`);
      passed++;
    } else {
      console.log(`\x1b[31m[FAIL] ${message}\x1b[0m`);
      failed++;
    }
  };

  // Seed / Reset Storage
  storage.initDB();
  const db = storage.getDB();

  // Test 1: Vehicle registration uniqueness
  const uniqueResult = rules.isRegNumberUnique('GJ-01-AA-1111');
  assert(uniqueResult === false, 'isRegNumberUnique returns false for duplicate registration number');

  const newUniqueResult = rules.isRegNumberUnique('GJ-99-ZZ-9999');
  assert(newUniqueResult === true, 'isRegNumberUnique returns true for new registration number');

  // Test 2: Cargo capacity check (weight limits)
  // V-005 (Ford Transit) has max capacity 500kg
  const overWeightCheck = rules.validateTripAssignment('V-005', 'D-001', 600);
  assert(overWeightCheck.valid === false && overWeightCheck.error.includes('exceeds'), 'validateTripAssignment blocks cargo weight (600 kg) exceeding capacity (500 kg)');

  const validWeightCheck = rules.validateTripAssignment('V-005', 'D-001', 450);
  assert(validWeightCheck.valid === true, 'validateTripAssignment allows cargo weight (450 kg) within capacity (500 kg)');

  // Test 3: Block expired driver license
  // D-003 (John) has expired license date: '2023-01-10'
  const expiredLicenseCheck = rules.validateTripAssignment('V-005', 'D-003', 400);
  assert(expiredLicenseCheck.valid === false && expiredLicenseCheck.error.includes('expired'), 'validateTripAssignment blocks driver with expired license');

  // Test 4: Block suspended driver
  // D-004 (Mike) is suspended
  const suspendedDriverCheck = rules.validateTripAssignment('V-005', 'D-004', 400);
  assert(suspendedDriverCheck.valid === false && suspendedDriverCheck.error.includes('Suspended'), 'validateTripAssignment blocks suspended driver');

  // Test 5: Block unavailable assets (already On Trip)
  // V-001 is On Trip
  const busyVehicleCheck = rules.validateTripAssignment('V-001', 'D-001', 400);
  assert(busyVehicleCheck.valid === false && busyVehicleCheck.error.includes('already On Trip'), 'validateTripAssignment blocks vehicle already assigned to an active trip');

  console.log(`\n=== TEST RUN SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
