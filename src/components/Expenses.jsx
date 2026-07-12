import React, { useState } from 'react';
import { getDB, addExpense } from '../db/storage';
import { DollarSign, Plus, Eye, HelpCircle } from 'lucide-react';

export default function Expenses({ user }) {
  const [db, setDb] = useState(getDB());
  const [activeTab, setActiveTab] = useState('fuel'); // fuel, other, vehicle_summary

  // Form states (Fuel)
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelDetails, setFuelDetails] = useState('');

  // Form states (Expense)
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expType, setExpType] = useState('Tolls');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expDetails, setExpDetails] = useState('');

  const refreshDb = () => {
    setDb(getDB());
  };

  const handleLogFuel = (e) => {
    e.preventDefault();
    if (!fuelVehicleId || !fuelLiters || !fuelCost || !fuelDate) {
      alert('All fields are required.');
      return;
    }

    addExpense({
      vehicleId: fuelVehicleId,
      type: 'Fuel',
      date: fuelDate,
      amount: Number(fuelCost),
      details: `${fuelLiters}L Fuel ${fuelDetails ? `- ${fuelDetails}` : ''}`
    });

    setFuelVehicleId('');
    setFuelLiters('');
    setFuelCost('');
    setFuelDetails('');
    setShowFuelForm(false);
    refreshDb();
  };

  const handleLogExpense = (e) => {
    e.preventDefault();
    if (!expVehicleId || !expType || !expAmount || !expDate) {
      alert('All fields are required.');
      return;
    }

    addExpense({
      vehicleId: expVehicleId,
      type: expType,
      date: expDate,
      amount: Number(expAmount),
      details: expDetails
    });

    setExpVehicleId('');
    setExpAmount('');
    setExpDetails('');
    setShowExpenseForm(false);
    refreshDb();
  };

  const getVehicleLabel = (vId) => {
    const v = db.vehicles.find(item => item.id === vId);
    return v ? `${v.model} (${v.regNumber})` : 'General Expense';
  };

  // Grouping Fuel logs
  const fuelLogs = db.expenses.filter(e => e.type === 'Fuel');

  // Grouping Other expenses
  const otherExpenses = db.expenses.filter(e => e.type !== 'Fuel');

  // Compute operational summary per vehicle: Fuel + Maintenance + Tolls + Other
  const getVehicleExpenseSummary = () => {
    return db.vehicles.map(v => {
      const vehicleExpenses = db.expenses.filter(e => e.vehicleId === v.id);
      const fuelTotal = vehicleExpenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
      const maintenanceTotal = vehicleExpenses.filter(e => e.type === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
      const tollsTotal = vehicleExpenses.filter(e => e.type === 'Tolls').reduce((sum, e) => sum + e.amount, 0);
      const otherTotal = vehicleExpenses.filter(e => e.type === 'Other').reduce((sum, e) => sum + e.amount, 0);
      const grandTotal = fuelTotal + maintenanceTotal + tollsTotal + otherTotal;

      return {
        ...v,
        fuelTotal,
        maintenanceTotal,
        tollsTotal,
        otherTotal,
        grandTotal
      };
    });
  };

  // Role permissions: Financial Analyst and Fleet Manager can modify
  const canModify = ['Fleet Manager', 'Financial Analyst'].includes(user.role);

  return (
    <div className="main-content">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Fuel & Expense Management</h1>
          <p>Monitor operational expenses, diesel consumption, and toll charges</p>
        </div>
        
        {canModify && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => setShowFuelForm(true)}>
              <Plus size={18} />
              <span>Log Fuel</span>
            </button>
            <button className="btn btn-secondary" onClick={() => setShowExpenseForm(true)}>
              <Plus size={18} />
              <span>Add Expense</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {[
          { id: 'fuel', label: 'Fuel Logs' },
          { id: 'other', label: 'Other Expenses' },
          { id: 'vehicle_summary', label: 'Operational Cost by Vehicle' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: activeTab === t.id ? 'rgba(255, 138, 0, 0.1)' : 'transparent',
              color: activeTab === t.id ? '#FF8A00' : 'var(--text-secondary)',
              fontWeight: activeTab === t.id ? 600 : 400,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Fuel Logs Table */}
      {activeTab === 'fuel' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            {fuelLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                No fuel logs recorded.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Refueling Details</th>
                    <th>Amount Charged</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.date}</td>
                      <td style={{ fontWeight: 600 }}>{getVehicleLabel(log.vehicleId)}</td>
                      <td>{log.details}</td>
                      <td style={{ color: '#FF8A00', fontWeight: 600 }}>₹{log.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Other Expenses Table */}
      {activeTab === 'other' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            {otherExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                No toll, maintenance, or other expenses logged.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {otherExpenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td>{getVehicleLabel(exp.vehicleId)}</td>
                      <td>
                        <span className={`badge ${exp.type.toLowerCase() === 'maintenance' ? 'inshop' : 'ontrip'}`}>
                          {exp.type}
                        </span>
                      </td>
                      <td>{exp.details}</td>
                      <td style={{ color: '#FF8A00', fontWeight: 600 }}>₹{exp.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Summary Table */}
      {activeTab === 'vehicle_summary' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle Model</th>
                  <th>Reg Number</th>
                  <th>Fuel Cost</th>
                  <th>Maintenance Cost</th>
                  <th>Tolls & Fees</th>
                  <th>Other Costs</th>
                  <th>Total Operational Cost</th>
                </tr>
              </thead>
              <tbody>
                {getVehicleExpenseSummary().map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.model}</td>
                    <td>{v.regNumber}</td>
                    <td>₹{v.fuelTotal.toLocaleString()}</td>
                    <td>₹{v.maintenanceTotal.toLocaleString()}</td>
                    <td>₹{v.tollsTotal.toLocaleString()}</td>
                    <td>₹{v.otherTotal.toLocaleString()}</td>
                    <td style={{ color: '#FF8A00', fontWeight: 700, fontSize: '0.95rem' }}>
                      ₹{v.grandTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Fuel Dialog Modal */}
      {showFuelForm && (
        <div className="drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Refueling Log</h3>
              <button 
                onClick={() => setShowFuelForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem', marginLeft: 'auto' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleLogFuel}>
              <div className="form-group">
                <label>Select Refueled Vehicle</label>
                <select 
                  className="form-control"
                  value={fuelVehicleId}
                  onChange={e => setFuelVehicleId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {db.vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.model} [{v.regNumber}]</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Fuel Quantity (Liters)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 50" 
                    value={fuelLiters}
                    onChange={e => setFuelLiters(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Total Cost (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 5000" 
                    value={fuelCost}
                    onChange={e => setFuelCost(e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Log Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={fuelDate}
                  onChange={e => setFuelDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes / Fuel Station Brand</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. HP Petrol Pump" 
                  value={fuelDetails}
                  onChange={e => setFuelDetails(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFuelForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log Fuel Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Expense Dialog Modal */}
      {showExpenseForm && (
        <div className="drawer-overlay" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Log Operational Expense</h3>
              <button 
                onClick={() => setShowExpenseForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem', marginLeft: 'auto' }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleLogExpense}>
              <div className="form-group">
                <label>Select Associated Vehicle</label>
                <select 
                  className="form-control"
                  value={expVehicleId}
                  onChange={e => setExpVehicleId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {db.vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.model} [{v.regNumber}]</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Expense Category</label>
                <select 
                  className="form-control"
                  value={expType}
                  onChange={e => setExpType(e.target.value)}
                >
                  <option value="Tolls">Tolls / State Tax</option>
                  <option value="Maintenance">Maintenance Service (Manual Adjustment)</option>
                  <option value="Other">Other Operational Expenses</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Cost Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="e.g. 350" 
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Log Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={expDate}
                    onChange={e => setExpDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Expense Description</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Highway NH-8 Toll booth" 
                  value={expDetails}
                  onChange={e => setExpDetails(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
