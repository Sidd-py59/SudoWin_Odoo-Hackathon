import React, { useState, useEffect } from 'react';
import { initDB } from './db/storage';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Fleet from './components/Fleet';
import Drivers from './components/Drivers';
import Trips from './components/Trips';
import Maintenance from './components/Maintenance';
import Expenses from './components/Expenses';
import Analytics from './components/Analytics';
import Settings from './components/Settings';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');

  // Initialize LocalStorage database
  useEffect(() => {
    initDB();
    
    // Check if session exists
    const session = localStorage.getItem('to_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        localStorage.removeItem('to_session');
      }
    }
  }, []);

  const handleLogin = (authenticatedUser) => {
    setUser(authenticatedUser);
    localStorage.setItem('to_session', JSON.stringify(authenticatedUser));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('to_session');
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Render current tab based on role clearance
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} onNavigateToTrips={() => setActiveTab('trips')} />;
      case 'fleet':
        return <Fleet user={user} />;
      case 'drivers':
        return <Drivers user={user} />;
      case 'trips':
        // Dispatcher, Manager
        if (['Fleet Manager', 'Dispatcher'].includes(user.role)) {
          return <Trips user={user} />;
        }
        return <div className="main-content"><div className="glass-card"><h3>Access Denied</h3><p>Your role clearance ({user.role}) does not have permission to access Trip dispatcher tools.</p></div></div>;
      case 'maintenance':
        // Dispatcher, Manager
        if (['Fleet Manager', 'Dispatcher'].includes(user.role)) {
          return <Maintenance user={user} />;
        }
        return <div className="main-content"><div className="glass-card"><h3>Access Denied</h3><p>Your role clearance ({user.role}) does not have permission to log or edit Maintenance records.</p></div></div>;
      case 'expenses':
        // Analyst, Manager
        if (['Fleet Manager', 'Financial Analyst'].includes(user.role)) {
          return <Expenses user={user} />;
        }
        return <div className="main-content"><div className="glass-card"><h3>Access Denied</h3><p>Your role clearance ({user.role}) does not have permission to view financial expense logs.</p></div></div>;
      case 'analytics':
        // Analyst, Manager
        if (['Fleet Manager', 'Financial Analyst'].includes(user.role)) {
          return <Analytics user={user} />;
        }
        return <div className="main-content"><div className="glass-card"><h3>Access Denied</h3><p>Your role clearance ({user.role}) does not have permission to view full Analytics dashboards.</p></div></div>;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  // Unauthenticated Flow
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Authenticated Flow
  return (
    <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      {/* Content Renderer */}
      {renderTabContent()}

      {/* Light / Dark Mode Toggle Float Button */}
      <button
        onClick={handleToggleTheme}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--card-shadow)',
          zIndex: 999,
          fontSize: '1.1rem'
        }}
        title="Toggle Theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
