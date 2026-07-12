import React, { useState } from 'react';
import { getDB, addDriver, updateDriver, saveDB } from '../db/storage';
import { Search, Plus, X, Trash2, Edit2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Drivers({ user }) {
  const [db, setDb] = useState(getDB());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All'); // All, High (>80), Med (60-80), Low (<60)

  // Form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Class A');
  const [expiryDate, setExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('');
  const [status, setStatus] = useState('Available');
  const [error, setError] = useState('');

  const refreshDb = () => {
    setDb(getDB());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setLicenseNumber('');
    setLicenseCategory('Class A');
    setExpiryDate('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('Available');
    setError('');
    setIsOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingId(d.id);
    setName(d.name);
    setLicenseNumber(d.licenseNumber);
    setLicenseCategory(d.licenseCategory);
    setExpiryDate(d.expiryDate);
    setContactNumber(d.contactNumber);
    setSafetyScore(d.safetyScore);
    setStatus(d.status);
    setError('');
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) return setError('Name is required.');
    if (!licenseNumber.trim()) return setError('License number is required.');
    if (!expiryDate) return setError('License expiry date is required.');
    if (!contactNumber.trim()) return setError('Contact number is required.');
    
    const scoreVal = Number(safetyScore);
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 100) {
      return setError('Safety score must be between 0 and 100.');
    }

    const payload = {
      name: name.trim(),
      licenseNumber: licenseNumber.trim().toUpperCase(),
      licenseCategory,
      expiryDate,
      contactNumber: contactNumber.trim(),
      safetyScore: scoreVal,
      status
    };

    if (editingId) {
      updateDriver(editingId, payload);
    } else {
      addDriver(payload);
    }

    setIsOpen(false);
    refreshDb();
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    const currentDb = getDB();
    
    const driver = currentDb.drivers.find(d => d.id === id);
    if (driver && driver.status === 'On Trip') {
      alert('Cannot delete a driver who is currently On Trip.');
      return;
    }

    currentDb.drivers = currentDb.drivers.filter(d => d.id !== id);
    saveDB(currentDb);
    refreshDb();
  };

  // Check License Expiry logic
  const checkExpiryStatus = (dateStr) => {
    const today = new Date();
    const expiry = new Date(dateStr);
    const timeDiff = expiry.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) return { label: 'Expired', color: '#F5222D', class: 'expired' };
    if (dayDiff <= 30) return { label: `${dayDiff} days left`, color: '#FA8C16', class: 'warning' };
    return { label: 'Valid', color: '#52C41A', class: 'valid' };
  };

  // Color coding safety score
  const getSafetyScoreColor = (score) => {
    if (score >= 80) return '#52C41A';
    if (score >= 60) return '#FA8C16';
    return '#F5222D';
  };

  // Role permissions: Fleet Manager and Safety Officer have modify rights
  const canModify = ['Fleet Manager', 'Safety Officer'].includes(user.role);

  // Filtered list
  const filteredDrivers = db.drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    
    let matchesScore = true;
    if (scoreFilter === 'High') matchesScore = d.safetyScore >= 80;
    else if (scoreFilter === 'Med') matchesScore = d.safetyScore >= 60 && d.safetyScore < 80;
    else if (scoreFilter === 'Low') matchesScore = d.safetyScore < 60;

    return matchesSearch && matchesStatus && matchesScore;
  });

  // Calculate critical alerts
  const expiredDrivers = db.drivers.filter(d => {
    const statusObj = checkExpiryStatus(d.expiryDate);
    return statusObj.label === 'Expired';
  });

  return (
    <div className="main-content">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Drivers & Safety Profiles</h1>
          <p>Verify compliance, licenses, and safety records of active personnel</p>
        </div>
        <div className="user-profile-widget">
          {canModify && (
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={18} />
              <span>Add Driver</span>
            </button>
          )}
        </div>
      </div>

      {/* Compliance Alerts banner */}
      {expiredDrivers.length > 0 && (
        <div className="alert alert-danger" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <AlertTriangle size={18} />
            <span>CRITICAL COMPLIANCE NOTICE: Expired Licenses Detected</span>
          </div>
          <div style={{ fontSize: '0.85rem', paddingLeft: '1.5rem' }}>
            The following drivers have expired driving permits and are restricted from dispatch assignment:
            <ul style={{ marginTop: '0.25rem', listStyle: 'inside square' }}>
              {expiredDrivers.map(d => (
                <li key={d.id}><strong>{d.name}</strong> (License: {d.licenseNumber}, Expired: {d.expiryDate})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="filters-bar" style={{ margin: 0 }}>
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by driver name or license no..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters-group">
            <span>Status:</span>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="filters-group">
            <span>Safety Score:</span>
            <select className="filter-select" value={scoreFilter} onChange={e => setScoreFilter(e.target.value)}>
              <option value="All">All Scores</option>
              <option value="High">Excellent (≥ 80)</option>
              <option value="Med">Satisfactory (60-70)</option>
              <option value="Low">Unsafe (&lt; 60)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          {filteredDrivers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              No driver records found.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>License Number</th>
                  <th>Category</th>
                  <th>Expiry Date</th>
                  <th>License Status</th>
                  <th>Contact</th>
                  <th>Safety Score</th>
                  <th>Status</th>
                  {canModify && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map(d => {
                  const expStatus = checkExpiryStatus(d.expiryDate);
                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.licenseNumber}</td>
                      <td>{d.licenseCategory}</td>
                      <td>{d.expiryDate}</td>
                      <td>
                        <span 
                          style={{ 
                            fontSize: '0.8rem', 
                            color: expStatus.color, 
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          {expStatus.label !== 'Valid' && <AlertTriangle size={12} />}
                          {expStatus.label}
                        </span>
                      </td>
                      <td>{d.contactNumber}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div 
                            style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: getSafetyScoreColor(d.safetyScore) 
                            }}
                          ></div>
                          <span style={{ fontWeight: 600 }}>{d.safetyScore}/100</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${d.status.toLowerCase().replace(' ', '')}`}>{d.status}</span>
                      </td>
                      {canModify && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.35rem 0.5rem' }}
                              onClick={() => handleOpenEdit(d)}
                              title="Edit Profile"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.35rem 0.5rem', color: '#F5222D' }}
                              onClick={() => handleDelete(d.id)}
                              title="Delete Profile"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
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
              <h2>{editingId ? 'Edit Driver Profile' : 'Register New Driver'}</h2>
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
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Alex Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>License Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. DL-12345"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>License Category</label>
                <select 
                  className="form-control"
                  value={licenseCategory}
                  onChange={e => setLicenseCategory(e.target.value)}
                >
                  <option value="Class A">Class A (Heavy Commercial)</option>
                  <option value="Class B">Class B (Commercial Trucks)</option>
                  <option value="Class C">Class C (Vans & Small Transports)</option>
                </select>
              </div>

              <div className="form-group">
                <label>License Expiry Date</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input 
                  type="tel" 
                  className="form-control"
                  placeholder="e.g. 555-0101"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Safety Performance Score (0-100)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="e.g. 95"
                  min="0"
                  max="100"
                  value={safetyScore}
                  onChange={e => setSafetyScore(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duty Status</label>
                <select 
                  className="form-control"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  disabled={status === 'On Trip'} // Cannot set status manually if they are On Trip
                >
                  <option value="Available">Available</option>
                  {editingId && <option value="On Trip" disabled>On Trip (Set via Trip Dispatcher)</option>}
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Save Profile' : 'Register Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
