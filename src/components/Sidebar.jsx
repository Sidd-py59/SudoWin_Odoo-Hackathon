import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { id: 'fleet', name: 'Fleet Registry', icon: Truck, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { id: 'drivers', name: 'Drivers', icon: Users, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
    { id: 'trips', name: 'Trips', icon: Navigation, roles: ['Fleet Manager', 'Dispatcher', 'Driver'] },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench, roles: ['Fleet Manager', 'Dispatcher'] },
    { id: 'expenses', name: 'Fuel & Expenses', icon: DollarSign, roles: ['Fleet Manager', 'Financial Analyst'] },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, roles: ['Fleet Manager', 'Financial Analyst'] },
    { id: 'settings', name: 'Settings', icon: Settings, roles: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] }
  ];

  // Helper to check if user has access to a tab
  const hasAccess = (itemRoles) => {
    return itemRoles.includes(user.role);
  };

  return (
    <div 
      style={{
        width: '260px',
        backgroundColor: '#16161A',
        borderRight: '1px solid #2D2D34',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '1.5rem 1rem'
      }}
    >
      {/* Brand logo */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          marginBottom: '2.5rem',
          paddingLeft: '0.5rem'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #FF8A00 0%, #FFA033 100%)',
          padding: '0.45rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(255, 138, 0, 0.2)'
        }}>
          <Truck size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>TransitOps</h2>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const allowed = hasAccess(item.roles);
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => allowed && setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(255, 138, 0, 0.08)' : 'transparent',
                color: isActive ? '#FF8A00' : allowed ? '#9CA3AF' : '#4B5563',
                cursor: allowed ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                width: '100%',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (allowed && !isActive) {
                  e.currentTarget.style.color = '#F3F4F6';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }
              }}
              onMouseOut={(e) => {
                if (allowed && !isActive) {
                  e.currentTarget.style.color = '#9CA3AF';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} />
                <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
              </div>
              {!allowed && (
                <span 
                  style={{ 
                    fontSize: '0.65rem', 
                    padding: '0.1rem 0.35rem', 
                    backgroundColor: '#202024', 
                    color: '#4B5563',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}
                >
                  Lock
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User profile footer */}
      <div 
        style={{
          borderTop: '1px solid #2D2D34',
          paddingTop: '1.25rem',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.25rem' }}>
          <div className="avatar">
            {user.name.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F3F4F6' }}>{user.name}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
              <ShieldCheck size={12} color="#FF8A00" />
              <span style={{ fontSize: '0.725rem', color: '#9CA3AF', fontWeight: 500 }}>{user.role}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="btn btn-secondary"
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
