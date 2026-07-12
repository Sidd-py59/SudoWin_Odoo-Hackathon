import React, { useState } from 'react';
import { getDB } from '../db/storage';
import { Truck } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('manager@transitops.com');
  const [password, setPassword] = useState('manager123');
  const [selectedRole, setSelectedRole] = useState('Fleet Manager');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const db = getDB();
    const user = db.users.find(
      (u) => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password && 
        u.role === selectedRole
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials or role selection. Please check the mock credentials.');
    }
  };

  const handleMockFill = (role) => {
    setSelectedRole(role);
    if (role === 'Fleet Manager') {
      setEmail('manager@transitops.com');
      setPassword('manager123');
    } else if (role === 'Dispatcher') {
      setEmail('dispatcher@transitops.com');
      setPassword('dispatcher123');
    } else if (role === 'Safety Officer') {
      setEmail('safety@transitops.com');
      setPassword('safety123');
    } else if (role === 'Financial Analyst') {
      setEmail('analyst@transitops.com');
      setPassword('analyst123');
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div 
        style={{
          flex: 1.2,
          background: 'linear-gradient(135deg, #16161A 0%, #0F0F11 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          borderRight: '1px solid #2D2D34',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="auth-left"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF8A00 0%, #FFA033 100%)',
            padding: '0.6rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 138, 0, 0.3)'
          }}>
            <Truck size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>TransitOps</h1>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '0.2rem' }}>Smart Transport Operations Platform</p>
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#F3F4F6' }}>Centralized Fleet Lifecycle Control</h2>
          <p style={{ color: '#9CA3AF', lineHeight: '1.6', fontSize: '0.95rem', maxWidth: '440px' }}>
            A comprehensive, digital terminal for vehicle registration, driver compliance, route dispatching, real-time maintenance logging, and instant cost analytics.
          </p>
        </div>

        <div 
          style={{
            backgroundColor: '#202024',
            border: '1px solid #2D2D34',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '460px'
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FF8A00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Quick Credentials (Click to Autofill)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { role: 'Fleet Manager', user: 'manager@transitops.com', pass: 'manager123' },
              { role: 'Dispatcher', user: 'dispatcher@transitops.com', pass: 'dispatcher123' },
              { role: 'Safety Officer', user: 'safety@transitops.com', pass: 'safety123' },
              { role: 'Financial Analyst', user: 'analyst@transitops.com', pass: 'analyst123' }
            ].map((cred) => (
              <div 
                key={cred.role} 
                onClick={() => handleMockFill(cred.role)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.825rem', 
                  padding: '0.5rem 0.75rem', 
                  backgroundColor: '#16161A', 
                  border: '1px solid #2D2D34',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  color: selectedRole === cred.role ? '#FF8A00' : '#F3F4F6'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#FF8A00'}
                onMouseOut={(e) => {
                  if (selectedRole !== cred.role) {
                    e.currentTarget.style.borderColor = '#2D2D34';
                  }
                }}
              >
                <div>
                  <strong>{cred.role}</strong>: {cred.user}
                </div>
                <div style={{ color: '#9CA3AF' }}>pass: {cred.pass}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          backgroundColor: '#0F0F11'
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Sign in to your account</h2>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem', marginTop: '0.25rem' }}>Enter credentials or click a profile on the left</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="email@transitops.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Select Role</label>
              <select 
                className="form-control"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.75rem', marginTop: '0.5rem', width: '100%', fontSize: '0.95rem' }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
