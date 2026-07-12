import React, { useState } from 'react';
import { getDB, addVehicle, updateVehicle, saveDB } from '../db/storage';
import { isRegNumberUnique } from '../db/businessRules';
import { Search, Plus, X, Trash2, Edit2 } from 'lucide-react';

export default function Fleet({ user }) {
  const [db, setDb] = useState(getDB());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Heavy Truck');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('Available');
  const [error, setError] = useState('');

  const refreshDb = () => {
    setDb(getDB());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setRegNum('');
    setModel('');
    setType('Heavy Truck');
    setCapacity('');
    setOdometer('');
    setCost('');
    setStatus('Available');
    setError('');
    setIsOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.id);
    setRegNum(v.regNumber);
    setModel(v.model);
    setType(v.type);
    setCapacity(v.maxCapacity);
    setOdometer(v.odometer);
    setCost(v.acquisitionCost);
    setStatus(v.status);
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!regNum.trim()) return setError('Registration number is required.');
    if (!model.trim()) return setError('Model name is required.');
    if (Number(capacity) <= 0) return setError('Capacity must be greater than 0.');
    if (Number(odometer) < 0) return setError('Odometer cannot be negative.');
    if (Number(cost) <= 0) return setError('Acquisition cost must be greater than 0.');

    // Unique Reg Number Check
    if (!isRegNumberUnique(regNum, editingId)) {
      return setError(`Vehicle Registration Number '${regNum}' is already registered.`);
    }

    const payload = {
      regNumber: regNum.trim().toUpperCase(),
      model: model.trim(),
      type,
      maxCapacity: Number(capacity),
      odometer: Number(odometer),
      acquisitionCost: Number(cost),
      status
    };

    if (editingId) {
      updateVehicle(editingId, payload);
    } else {
      addVehicle(payload);
    }

    setIsOpen(false);
    refreshDb();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    const currentDb = getDB();
    
    // Check if vehicle is on active trip
    const vehicle = currentDb.vehicles.find(v => v.id === id);
    if (vehicle && vehicle.status === 'On Trip') {
      alert('Cannot delete a vehicle that is currently On Trip.');
      return;
    }

    currentDb.vehicles = currentDb.vehicles.filter(v => v.id !== id);
    // Also clear associated expenses if necessary, or just keep them
    saveDB(currentDb);
    refreshDb();
  };

  // Role permissions
  const canModify = ['Fleet Manager', 'Dispatcher'].includes(user.role);

  // Filtered List
  const filteredVehicles = db.vehicles.filter(v => {
    const matchesSearch = v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="main-content">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Fleet Registry</h1>
          <p>Manage and track vehicle logs, capacity, and current operational states</p>
        </div>
        <div className="user-profile-widget">
          {canModify && (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="filters-bar" style={{ margin: 0 }}>
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by model or registration number..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters-group">
            <span>Type:</span>
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
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          {filteredVehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              No vehicles found matching the search criteria.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Model / Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Odometer</th>
                  <th>Acquisition Cost</th>
                  <th>Status</th>
                  {canModify && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600, letterSpacing: '0.02em' }}>{v.regNumber}</td>
                    <td>{v.model}</td>
                    <td>{v.type}</td>
                    <td>{v.maxCapacity.toLocaleString()} kg</td>
                    <td>{v.odometer.toLocaleString()} km</td>
                    <td>₹{v.acquisitionCost.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${v.status.toLowerCase().replace(' ', '')}`}>{v.status}</span>
                    </td>
                    {canModify && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.5rem' }}
                            onClick={() => handleOpenEdit(v)}
                            title="Edit Vehicle"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.5rem', color: '#F5222D' }}
                            onClick={() => handleDelete(v.id)}
                            title="Delete Vehicle"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer Overlay for Add/Edit */}
      {isOpen && (
        <div className="drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}</h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="alert alert-danger">
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
              <div className="form-group">
                <label>Registration Number (Unique)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. GJ-01-AA-1234"
                  value={regNum}
                  onChange={e => setRegNum(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Model / Brand Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Volvo FH16"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vehicle Type</label>
                <select 
                  className="form-control"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Heavy Truck">Heavy Truck</option>
                  <option value="Semi-Truck">Semi-Truck</option>
                  <option value="Box Truck">Box Truck</option>
                  <option value="Van">Van</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Load Capacity (kg)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="e.g. 15000"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Starting Odometer Reading (km)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="e.g. 12000"
                  value={odometer}
                  onChange={e => setOdometer(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Acquisition Cost (₹)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="e.g. 1200000"
                  value={cost}
                  onChange={e => setCost(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Operational Status</label>
                <select 
                  className="form-control"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  disabled={status === 'On Trip'} // Cannot set status directly if they are On Trip
                >
                  <option value="Available">Available</option>
                  {editingId && <option value="On Trip" disabled>On Trip (Set via Trip Dispatcher)</option>}
                  <option value="In Shop">In Shop (Maintenance)</option>
                  <option value="Retired">Retired</option>
                </select>
                {status === 'On Trip' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Status must be restored via complete/cancel trip.
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Save Changes' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
