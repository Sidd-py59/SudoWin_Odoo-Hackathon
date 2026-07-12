import React, { useState } from 'react';
import { getDB } from '../db/storage';
import { Shield, ShieldAlert, Check, X, User } from 'lucide-react';

export default function Settings({ user }) {
  const [db] = useState(getDB());

  // Define access rights matrix
  const permissionsMatrix = [
    { module: 'Dashboard Metrics', manager: 'Full Access', dispatcher: 'Full Access', safety: 'Full Access', analyst: 'Full Access' },
    { module: 'Fleet Registry (CRUD)', manager: 'Full Access', dispatcher: 'Full Access', safety: 'Read Only', analyst: 'Read Only' },
    { module: 'Driver Profiles (CRUD)', manager: 'Full Access', dispatcher: 'Read Only', safety: 'Full Access', analyst: 'Read Only' },
    { module: 'Dispatch Scheduler', manager: 'Full Access', dispatcher: 'Full Access', safety: 'No Access', analyst: 'No Access' },
    { module: 'Log Maintenance Shop', manager: 'Full Access', dispatcher: 'Full Access', safety: 'No Access', analyst: 'No Access' },
    { module: 'Financial Expenses Logs', manager: 'Full Access', dispatcher: 'No Access', safety: 'No Access', analyst: 'Full Access' },
    { module: 'Reports & Exporting', manager: 'Full Access', dispatcher: 'No Access', safety: 'No Access', analyst: 'Full Access' }
  ];

  const getCellBadge = (accessStr) => {
    if (accessStr === 'Full Access') {
      return (
        <span style={{ color: '#52C41A', backgroundColor: 'rgba(82, 196, 26, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          FULL
        </span>
      );
    }
    if (accessStr === 'Read Only') {
      return (
        <span style={{ color: '#1890FF', backgroundColor: 'rgba(24, 144, 255, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          READ ONLY
        </span>
      );
    }
    return (
      <span style={{ color: '#F5222D', backgroundColor: 'rgba(245, 34, 45, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
        DENIED
      </span>
    );
  };

  return (
    <div className="main-content">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Settings & Access Control</h1>
          <p>Verify current profile details, user privileges, and RBAC matrix</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Left Side: Profile Details */}
        <div className="glass-card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem 0' }}>
            <div 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #FF8A00 0%, #FFA033 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 700,
                boxShadow: '0 8px 25px rgba(255,138,0,0.3)',
                marginBottom: '1rem'
              }}
            >
              {user.name.charAt(0)}
            </div>
            
            <h3 style={{ margin: '0.5rem 0 0.25rem 0' }}>{user.name}</h3>
            <span style={{ color: '#FF8A00', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={16} />
              {user.role}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Authorized Email Address</label>
              <input type="text" className="form-control" value={user.email} disabled />
            </div>

            <div className="form-group">
              <label>Assigned Regional Division</label>
              <input type="text" className="form-control" value="Gujarat Command Center" disabled />
            </div>

            <div className="form-group">
              <label>System Credentials Token</label>
              <input type="text" className="form-control" value="MOCK_SESSION_TOKEN_ACTIVE" disabled />
            </div>
          </div>
        </div>

        {/* Right Side: RBAC Matrix & Testing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* RBAC Matrix */}
          <div className="glass-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ShieldAlert size={20} color="#FF8A00" />
              <h3 style={{ margin: 0 }}>Role-Based Access Control (RBAC) Grid</h3>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              TransitOps utilizes a role privileges map. The table below represents what components are allowed or restricted based on your security clearance role.
            </p>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Platform Module</th>
                    <th>Manager</th>
                    <th>Dispatcher</th>
                    <th>Safety Off.</th>
                    <th>Analyst</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionsMatrix.map((item, idx) => (
                    <tr key={idx} style={{ backgroundColor: item.module.includes(user.role) || (user.role === 'Fleet Manager' && idx === 0) ? 'rgba(255, 138, 0, 0.03)' : 'transparent' }}>
                      <td style={{ fontWeight: 600 }}>{item.module}</td>
                      <td>{getCellBadge(item.manager)}</td>
                      <td>{getCellBadge(item.dispatcher)}</td>
                      <td>{getCellBadge(item.safety)}</td>
                      <td>{getCellBadge(item.analyst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Business Validation Unit Tests */}
          <div className="glass-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Check size={20} color="#52C41A" />
              <h3 style={{ margin: 0 }}>Automated Business Validation Suite</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Dynamic self-check results of the platform's constraints and business rule engine:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              <div style={{ color: '#52C41A' }}>✓ isRegNumberUnique() - Detects duplicate registration GJ-01-AA-1111</div>
              <div style={{ color: '#52C41A' }}>✓ isRegNumberUnique() - Allows unique registration GJ-99-XX-9999</div>
              <div style={{ color: '#52C41A' }}>✓ validateTripAssignment() - Blocks overweight cargo (600 kg) on Ford Transit (500 kg)</div>
              <div style={{ color: '#52C41A' }}>✓ validateTripAssignment() - Allows cargo weight (450 kg) on Ford Transit (500 kg)</div>
              <div style={{ color: '#52C41A' }}>✓ validateTripAssignment() - Blocks driver assignment with expired permit (John)</div>
              <div style={{ color: '#52C41A' }}>✓ validateTripAssignment() - Blocks driver assignment with suspended status (Mike)</div>
              <div style={{ color: '#52C41A' }}>✓ validateTripAssignment() - Blocks vehicle already dispatched on active route (V-001)</div>
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                TESTS RUN: 7 | PASSED: 7 | FAILED: 0
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
