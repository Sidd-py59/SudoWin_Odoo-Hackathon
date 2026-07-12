import React, { useState } from 'react';
import { getDB, addMaintenance } from '../db/storage';
import { openMaintenance, closeMaintenanceLog } from '../db/businessRules';
import { Wrench, Plus, CheckCircle, Clock } from 'lucide-react';

export default function Maintenance({ user }) {
  const [db, setDb] = useState(getDB());
  
  // Form states
  const [vehicleId, setVehicleId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('Oil Change');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [dateOpened, setDateOpened] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Close log modal simulation
  const [closingLogId, setClosingLogId] = useState(null);
  const [dateClosed, setDateClosed] = useState(new Date().toISOString().split('T')[0]);

  const refreshDb = () => {
    setDb(getDB());
  };

  // Vehicles eligible for maintenance: Not Retired, Not On Trip
  const maintenanceEligibleVehicles = db.vehicles.filter(v => v.status !== 'Retired' && v.status !== 'On Trip');

  const handleOpenMaintenance = (e) => {
    e.preventDefault();
    setError('');

    if (!vehicleId || !maintenanceType || !description.trim() || !cost || !dateOpened) {
      setError('All fields are required.');
      return;
    }

    if (Number(cost) < 0) {
      setError('Cost cannot be negative.');
      return;
    }

    try {
      openMaintenance(vehicleId, maintenanceType, description.trim(), Number(cost), dateOpened);
      
      // Reset form
      setVehicleId('');
      setDescription('');
      setCost('');
      setError('');
      refreshDb();
      alert('Maintenance record opened! Vehicle status is now set to In Shop.');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleTriggerCloseLog = (logId) => {
    setClosingLogId(logId);
  };

  const handleSubmitCloseLog = (e) => {
    e.preventDefault();
    try {
      closeMaintenanceLog(closingLogId, dateClosed);
      setClosingLogId(null);
      refreshDb();
      alert('Maintenance log closed! Vehicle status restored to Available.');
    } catch (e) {
      alert(e.message);
    }
  };

  const getVehicleLabel = (vId) => {
    const v = db.vehicles.find(item => item.id === vId);
    return v ? `${v.model} (${v.regNumber})` : 'Unknown Vehicle';
  };

  // Role check
  const canModify = ['Fleet Manager', 'Dispatcher'].includes(user.role);

  return (
    <div className="main-content">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Maintenance Management</h1>
          <p>Schedule service checkups, repairs, and track vehicle shop locking</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side - Log Maintenance */}
        <div className="glass-card">
          <h3>Log Maintenance Record</h3>
          {error && (
            <div className="alert alert-danger">
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleOpenMaintenance}>
            <div className="form-group">
              <label>Select Vehicle</label>
              <select 
                className="form-control"
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
                required
              >
                <option value="">-- Choose Vehicle --</option>
                {maintenanceEligibleVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.model} [{v.regNumber}] - Status: {v.status}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Note: Vehicles currently On Trip or Retired cannot enter maintenance.
              </span>
            </div>

            <div className="form-group">
              <label>Maintenance Type</label>
              <select 
                className="form-control"
                value={maintenanceType}
                onChange={e => setMaintenanceType(e.target.value)}
              >
                <option value="Oil Change">Oil Change</option>
                <option value="Engine Repair">Engine Repair</option>
                <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                <option value="Tire Rotation">Tire Rotation</option>
                <option value="Electrical Repair">Electrical Repair</option>
                <option value="General Inspection">General Inspection</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Date Opened</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={dateOpened}
                  onChange={e => setDateOpened(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Estimated Cost (₹)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="e.g. 5000"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Service Description & Notes</label>
              <textarea 
                className="form-control"
                rows="3"
                placeholder="Describe service detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>

            {canModify ? (
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Wrench size={16} />
                <span>Log Maintenance (Send to Shop)</span>
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Your role does not permit logging vehicle maintenance.
              </div>
            )}
          </form>
        </div>

        {/* Right Side - Active & Previous Shop Logs */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Shop Log History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem', overflowY: 'auto', flex: 1, maxHeight: '420px' }}>
            {db.maintenance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No maintenance history recorded.
              </div>
            ) : (
              db.maintenance.map(log => {
                const isActive = log.status === 'Active';
                return (
                  <div 
                    key={log.id} 
                    className="card-item" 
                    style={{ 
                      borderLeft: isActive ? '3px solid #FF8A00' : '3px solid #52C41A',
                      padding: '1rem',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.type}</span>
                      <span className={`badge ${isActive ? 'inshop' : 'completed'}`}>
                        {isActive ? 'In Shop' : 'Available'}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div>Vehicle: <strong>{getVehicleLabel(log.vehicleId)}</strong></div>
                      <div style={{ marginTop: '0.2rem', color: 'var(--text-primary)' }}>{log.description}</div>
                      <div style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>
                        Opened: {log.dateOpened} {log.dateClosed && `| Closed: ${log.dateClosed}`}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                        Cost: ₹{log.cost.toLocaleString()}
                      </div>
                    </div>

                    {isActive && canModify && (
                      <button 
                        className="btn btn-success" 
                        style={{ padding: '0.35rem', fontSize: '0.8rem', marginTop: '0.5rem' }}
                        onClick={() => handleTriggerCloseLog(log.id)}
                      >
                        <CheckCircle size={14} />
                        <span>Close Service Log</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Close Maintenance Modal */}
      {closingLogId && (
        <div className="drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '380px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Close Service Log</h3>
              <button 
                onClick={() => setClosingLogId(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitCloseLog}>
              <div className="form-group">
                <label>Date Closed</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dateClosed} 
                  onChange={e => setDateClosed(e.target.value)} 
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setClosingLogId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Complete Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
