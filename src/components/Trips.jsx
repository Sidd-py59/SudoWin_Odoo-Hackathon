import React, { useState } from 'react';
import { getDB, addTrip, updateTrip, saveDB } from '../db/storage';
import { validateTripAssignment, dispatchTrip, cancelTrip } from '../db/businessRules';
import { Play, Check, AlertTriangle, ArrowRight, Trash2, HelpCircle } from 'lucide-react';

export default function Trips({ user }) {
  const [db, setDb] = useState(getDB());
  const [activeSubTab, setActiveSubTab] = useState('dispatcher'); // dispatcher, history

  // Form states
  const [source, setSource] = useState('Gandhinagar Depot');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [distance, setDistance] = useState('');
  
  // Validation / status states
  const [formError, setFormError] = useState('');
  const [formWarning, setFormWarning] = useState('');

  const refreshDb = () => {
    setDb(getDB());
  };

  // Get eligible vehicles: Not Retired, Not In Shop, Not On Trip
  const availableVehicles = db.vehicles.filter(v => v.status === 'Available');

  // Get eligible drivers: Not Suspended, Not On Trip, and License not expired
  const availableDrivers = db.drivers.filter(d => {
    if (d.status === 'Suspended' || d.status === 'On Trip') return false;
    // Check expiry
    const today = new Date();
    const expiry = new Date(d.expiryDate);
    return expiry >= today;
  });

  // Dynamic weight checking
  const handleWeightChange = (weightVal) => {
    setCargoWeight(weightVal);
    setFormWarning('');

    if (vehicleId && weightVal) {
      const vehicle = db.vehicles.find(v => v.id === vehicleId);
      if (vehicle && Number(weightVal) > Number(vehicle.maxCapacity)) {
        setFormWarning(`Warning: Cargo weight (${weightVal} kg) exceeds maximum capacity (${vehicle.maxCapacity} kg) for vehicle ${vehicle.model}.`);
      }
    }
  };

  const handleVehicleSelect = (id) => {
    setVehicleId(id);
    setFormWarning('');

    if (id && cargoWeight) {
      const vehicle = db.vehicles.find(v => v.id === id);
      if (vehicle && Number(cargoWeight) > Number(vehicle.maxCapacity)) {
        setFormWarning(`Warning: Cargo weight (${cargoWeight} kg) exceeds maximum capacity (${vehicle.maxCapacity} kg) for vehicle ${vehicle.model}.`);
      }
    }
  };

  const handleCreateTrip = (e) => {
    e.preventDefault();
    setFormError('');

    if (!source.trim() || !destination.trim() || !vehicleId || !driverId || !cargoWeight || !distance) {
      setFormError('All fields are required.');
      return;
    }

    // Run business validation
    const validation = validateTripAssignment(vehicleId, driverId, cargoWeight);
    if (!validation.valid) {
      setFormError(validation.error);
      return;
    }

    const newTrip = {
      source: source.trim(),
      destination: destination.trim(),
      vehicleId,
      driverId,
      cargoWeight: Number(cargoWeight),
      distance: Number(distance),
      status: 'Draft',
      fuelConsumed: 0,
      odometerStart: 0,
      odometerEnd: 0
    };

    addTrip(newTrip);
    
    // Reset form fields
    setDestination('');
    setVehicleId('');
    setDriverId('');
    setCargoWeight('');
    setDistance('');
    setFormWarning('');
    setFormError('');
    
    refreshDb();
    alert('Trip draft created successfully! You can now dispatch it.');
  };

  const handleDispatch = (tripId) => {
    try {
      dispatchTrip(tripId);
      refreshDb();
      alert(`Trip ${tripId} has been dispatched. Vehicle and Driver status set to 'On Trip'.`);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCancel = (tripId) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    try {
      cancelTrip(tripId);
      refreshDb();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteDraft = (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip draft?')) return;
    const currentDb = getDB();
    currentDb.trips = currentDb.trips.filter(t => t.id !== tripId);
    saveDB(currentDb);
    refreshDb();
  };

  const getVehicleLabel = (vId) => {
    const v = db.vehicles.find(item => item.id === vId);
    return v ? `${v.model} (${v.regNumber})` : 'Unknown Vehicle';
  };

  const getDriverLabel = (dId) => {
    const d = db.drivers.find(item => item.id === dId);
    return d ? d.name : 'Unknown Driver';
  };

  // Role check
  const canModify = ['Fleet Manager', 'Dispatcher'].includes(user.role);

  // Group Trips by state
  const draftTrips = db.trips.filter(t => t.status === 'Draft');
  const dispatchedTrips = db.trips.filter(t => t.status === 'Dispatched');
  const finishedTrips = db.trips.filter(t => t.status === 'Completed' || t.status === 'Cancelled');

  return (
    <div className="main-content">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Trip Dispatcher</h1>
          <p>Schedule shipments, assign assets, and dispatch carriers on active routes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeSubTab === 'dispatcher' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('dispatcher')}
          >
            Dispatch Panel
          </button>
          <button 
            className={`btn ${activeSubTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveSubTab('history')}
          >
            Trip History ({db.trips.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'dispatcher' ? (
        <div className="dashboard-grid">
          {/* Left panel - Dispatcher Form */}
          <div className="glass-card">
            <h3>Create Dispatch Route</h3>
            
            {/* Steps indicator */}
            <div className="steps-indicator">
              <div className="step-item active">
                <div className="step-bubble">1</div>
                <div className="step-label">Draft</div>
              </div>
              <div className="step-item">
                <div className="step-bubble">2</div>
                <div className="step-label">Dispatch</div>
              </div>
              <div className="step-item">
                <div className="step-bubble">3</div>
                <div className="step-label">Complete</div>
              </div>
            </div>

            {formError && (
              <div className="alert alert-danger">
                <AlertTriangle size={16} />
                <div>{formError}</div>
              </div>
            )}

            {formWarning && (
              <div className="alert alert-warning">
                <AlertTriangle size={16} />
                <div>{formWarning}</div>
              </div>
            )}

            <form onSubmit={handleCreateTrip}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Source Depot</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Destination Hub</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Ahmedabad Hub"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Select Vehicle (Available)</label>
                <select 
                  className="form-control"
                  value={vehicleId}
                  onChange={e => handleVehicleSelect(e.target.value)}
                  required
                >
                  <option value="">-- Choose Available Vehicle --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.model} [{v.regNumber}] - Cap: {v.maxCapacity} kg | Odom: {v.odometer} km
                    </option>
                  ))}
                </select>
                {availableVehicles.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#FA8C16', marginTop: '0.25rem' }}>
                    No available vehicles in stock. Complete trips or close maintenance records to free up resources.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Select Driver (Available & Valid License)</label>
                <select 
                  className="form-control"
                  value={driverId}
                  onChange={e => setDriverId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Available Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} (License: {d.licenseNumber} - {d.licenseCategory}) - Score: {d.safetyScore}/100
                    </option>
                  ))}
                </select>
                {availableDrivers.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#FA8C16', marginTop: '0.25rem' }}>
                    No available compliant drivers on duty.
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Cargo Weight (kg)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="e.g. 450"
                    value={cargoWeight}
                    onChange={e => handleWeightChange(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Planned Route Distance (km)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="e.g. 50"
                    value={distance}
                    onChange={e => setDistance(e.target.value)}
                    required
                  />
                </div>
              </div>

              {canModify ? (
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                  disabled={formWarning.includes('exceeds')}
                >
                  Create Trip Draft
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Your role does not permit creating or dispatching trips.
                </div>
              )}
            </form>
          </div>

          {/* Right panel - Draft list ready for Dispatch */}
          <div className="glass-card">
            <h3>Trips Awaiting Dispatch</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {draftTrips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No pending drafts. Create a route on the left to queue for dispatch.
                </div>
              ) : (
                draftTrips.map(trip => (
                  <div key={trip.id} className="card-item" style={{ borderLeft: '3px solid #FA8C16' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Trip Draft #{trip.id}</span>
                        <span className="badge draft">Draft</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        <div style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{trip.source}</span>
                          <ArrowRight size={14} />
                          <span>{trip.destination}</span>
                        </div>
                        <div style={{ marginTop: '0.25rem' }}>Vehicle: {getVehicleLabel(trip.vehicleId)}</div>
                        <div>Driver: {getDriverLabel(trip.driverId)}</div>
                        <div>Distance: {trip.distance} km | Cargo: {trip.cargoWeight} kg</div>
                      </div>
                    </div>

                    {canModify && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                          onClick={() => handleDispatch(trip.id)}
                        >
                          <Play size={14} />
                          <span>Dispatch Now</span>
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem', color: '#F5222D' }}
                          onClick={() => handleDeleteDraft(trip.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Trip History Tab */
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            {db.trips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                No trips logged.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Weight</th>
                    <th>Distance</th>
                    <th>Status</th>
                    <th>Fuel Consumed</th>
                    {canModify && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {db.trips.map(trip => (
                    <tr key={trip.id}>
                      <td style={{ fontWeight: 600 }}>{trip.id}</td>
                      <td>{trip.source} → {trip.destination}</td>
                      <td>{getVehicleLabel(trip.vehicleId)}</td>
                      <td>{getDriverLabel(trip.driverId)}</td>
                      <td>{trip.cargoWeight} kg</td>
                      <td>{trip.distance} km</td>
                      <td>
                        <span className={`badge ${trip.status.toLowerCase()}`}>{trip.status}</span>
                      </td>
                      <td>{trip.status === 'Completed' ? `${trip.fuelConsumed} Liters` : '--'}</td>
                      {canModify && (
                        <td>
                          {trip.status === 'Dispatched' ? (
                            <button 
                              className="btn btn-danger"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => handleCancel(trip.id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Locked</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
