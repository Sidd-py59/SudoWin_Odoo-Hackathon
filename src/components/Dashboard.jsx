import React, { useState } from 'react';
import { getDB } from '../db/storage';
import { cancelTrip, completeTrip } from '../db/businessRules';
import { Play, CheckCircle, XCircle, Search, HelpCircle, Navigation } from 'lucide-react';

export default function Dashboard({ user, onNavigateToTrips }) {
  const [db, setDb] = useState(getDB());
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Trigger db refresh
  const refreshDb = () => {
    setDb(getDB());
  };

  // KPI Calculations
  const totalVehiclesList = db.vehicles;
  const activeVehicles = totalVehiclesList.filter(v => v.status === 'On Trip').length;
  const availableVehicles = totalVehiclesList.filter(v => v.status === 'Available').length;
  const inMaintenanceVehicles = totalVehiclesList.filter(v => v.status === 'In Shop').length;
  const retiredVehicles = totalVehiclesList.filter(v => v.status === 'Retired').length;
  
  const activeTrips = db.trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = db.trips.filter(t => t.status === 'Draft').length;

  const driversOnDuty = db.drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;

  // Fleet Utilization = (Active / (Total - Retired)) * 100
  const activeFleetCount = totalVehiclesList.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = activeFleetCount > 0 
    ? Math.round((activeVehicles / activeFleetCount) * 100) 
    : 0;

  // Active Trips Table Data
  const activeTripsList = db.trips.filter(t => t.status === 'Dispatched' || t.status === 'Draft');

  // Cancel trip handler
  const handleCancelTrip = (tripId) => {
    try {
      cancelTrip(tripId);
      refreshDb();
    } catch (e) {
      alert(e.message);
    }
  };

  // Complete Trip dialog trigger (modal simulation)
  const [completingTrip, setCompletingTrip] = useState(null);
  const [finalOdom, setFinalOdom] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  const triggerCompleteTrip = (trip) => {
    setCompletingTrip(trip);
    // Suggest next odometer based on distance
    const vehicleObj = db.vehicles.find(v => v.id === trip.vehicleId);
    const startOdom = trip.odometerStart || (vehicleObj ? vehicleObj.odometer : 0);
    setFinalOdom(Number(startOdom) + Number(trip.distance));
    setFuelLiters(Math.round(trip.distance / 8)); // rough estimation (8 km/l)
    setFuelCost(Math.round((trip.distance / 8) * 95)); // rough cost estimation
  };

  const submitCompleteTrip = (e) => {
    e.preventDefault();
    try {
      completeTrip(completingTrip.id, finalOdom, fuelLiters, fuelCost);
      setCompletingTrip(null);
      refreshDb();
    } catch (e) {
      alert(e.message);
    }
  };

  // Role permissions
  const canModifyTrips = ['Fleet Manager', 'Dispatcher'].includes(user.role);

  return (
    <div className="main-content">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Real-time fleet operations overview & alerts</p>
        </div>
        <div className="user-profile-widget">
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Region: <strong>Gujarat</strong></span>
          <div className="avatar">{user.name.charAt(0)}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="filters-bar" style={{ margin: 0 }}>
          <div className="filters-group">
            <span>Region:</span>
            <select className="filter-select" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
              <option value="All">All Regions</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>
          <div className="filters-group">
            <span>Vehicle Type:</span>
            <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Heavy Truck">Heavy Truck</option>
              <option value="Semi-Truck">Semi-Truck</option>
              <option value="Box Truck">Box Truck</option>
              <option value="Van">Van</option>
            </select>
          </div>
          <div className="filters-group">
            <span>Status:</span>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ marginLeft: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            onClick={onNavigateToTrips}
          >
            <Navigation size={15} />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card active-vehicles">
          <span className="kpi-title">Active Vehicles</span>
          <span className="kpi-value">{activeVehicles}</span>
        </div>
        <div className="kpi-card available-vehicles">
          <span className="kpi-title">Available Vehicles</span>
          <span className="kpi-value">{availableVehicles}</span>
        </div>
        <div className="kpi-card maintenance">
          <span className="kpi-title">In Maintenance</span>
          <span className="kpi-value">{inMaintenanceVehicles}</span>
        </div>
        <div className="kpi-card active-trips">
          <span className="kpi-title">Active Trips</span>
          <span className="kpi-value">{activeTrips}</span>
        </div>
        <div className="kpi-card pending-trips">
          <span className="kpi-title">Pending Trips</span>
          <span className="kpi-value">{pendingTrips}</span>
        </div>
        <div className="kpi-card drivers-duty">
          <span className="kpi-title">Drivers On Duty</span>
          <span className="kpi-value">{driversOnDuty}</span>
        </div>
        <div className="kpi-card utilization">
          <span className="kpi-title">Fleet Util. (%)</span>
          <span className="kpi-value">{fleetUtilization}%</span>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="dashboard-grid">
        {/* Left Side - Active Trips */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Active / Dispatched Trips</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Showing {activeTripsList.length} trips</span>
          </div>
          <div className="table-container">
            {activeTripsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                No active or dispatched trips at the moment.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTripsList.map((trip) => {
                    const vehicle = db.vehicles.find(v => v.id === trip.vehicleId);
                    const driver = db.drivers.find(d => d.id === trip.driverId);
                    return (
                      <tr key={trip.id}>
                        <td style={{ fontWeight: 600 }}>{trip.id}</td>
                        <td>
                          <div>{vehicle?.model}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{vehicle?.regNumber}</div>
                        </td>
                        <td>{driver?.name}</td>
                        <td>{trip.source} → {trip.destination}</td>
                        <td>
                          <span className={`badge ${trip.status.toLowerCase()}`}>{trip.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {trip.status === 'Dispatched' && canModifyTrips && (
                              <button 
                                className="btn btn-success" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => triggerCompleteTrip(trip)}
                                title="Complete Trip"
                              >
                                <CheckCircle size={14} />
                                <span>Complete</span>
                              </button>
                            )}
                            {canModifyTrips && (
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => handleCancelTrip(trip.id)}
                                title="Cancel Trip"
                              >
                                <XCircle size={14} />
                                <span>Cancel</span>
                              </button>
                            )}
                            {!canModifyTrips && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>N/A (Read-only)</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side - Vehicle Status breakdown */}
        <div className="glass-card">
          <h3>Vehicle Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
            {[
              { label: 'Available', count: availableVehicles, color: 'var(--status-available-text)', bg: 'var(--status-available-bg)' },
              { label: 'On Trip', count: activeVehicles, color: 'var(--status-ontrip-text)', bg: 'var(--status-ontrip-bg)' },
              { label: 'In Shop', count: inMaintenanceVehicles, color: 'var(--status-inshop-text)', bg: 'var(--status-inshop-bg)' },
              { label: 'Retired', count: retiredVehicles, color: 'var(--status-suspended-text)', bg: 'var(--status-suspended-border)' }
            ].map(status => {
              const max = totalVehiclesList.length || 1;
              const percent = Math.round((status.count / max) * 100);
              return (
                <div key={status.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: status.color }}>{status.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{status.count} ({percent}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: status.color, borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div 
            style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: '1px dashed var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}
          >
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Active Licensing Warning</h4>
            {db.drivers.some(d => new Date(d.expiryDate) < new Date() && d.status !== 'Suspended') ? (
              <p style={{ color: '#F5222D' }}>
                Attention: Some active drivers have expired licenses and cannot be dispatched on trips. Please check the Drivers module.
              </p>
            ) : (
              <p>All on-duty drivers currently hold valid driving credentials.</p>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {completingTrip && (
        <div className="drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div 
            className="glass-card" 
            style={{ 
              width: '100%', 
              maxWidth: '460px', 
              margin: '1rem', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
              border: '1px solid var(--accent-color)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Complete Trip {completingTrip.id}</h3>
              <button 
                onClick={() => setCompletingTrip(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={submitCompleteTrip}>
              <div className="form-group">
                <label>Final Odometer Reading (km)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={finalOdom} 
                  onChange={e => setFinalOdom(e.target.value)} 
                  required
                  min={completingTrip.odometerStart || 0}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Odometer Start: {completingTrip.odometerStart} km (Trip Distance: {completingTrip.distance} km)
                </span>
              </div>

              <div className="form-group">
                <label>Fuel Consumed (Liters)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={fuelLiters} 
                  onChange={e => setFuelLiters(e.target.value)} 
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Fuel Cost Charged (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={fuelCost} 
                  onChange={e => setFuelCost(e.target.value)} 
                  required
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCompletingTrip(null)}>
                  Back
                </button>
                <button type="submit" className="btn btn-success">
                  Complete & Save Logs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
