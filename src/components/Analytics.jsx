import React, { useState } from 'react';
import { getDB } from '../db/storage';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { FileDown, Info } from 'lucide-react';

export default function Analytics({ user }) {
  const [db, setDb] = useState(getDB());

  // 1. Metric calculations
  const totalVehiclesList = db.vehicles;
  const activeVehicles = totalVehiclesList.filter(v => v.status === 'On Trip').length;
  const activeFleetCount = totalVehiclesList.filter(v => v.status !== 'Retired').length;
  
  // Utilization
  const fleetUtilization = activeFleetCount > 0 
    ? Math.round((activeVehicles / activeFleetCount) * 100) 
    : 0;

  // Operational costs (Fuel + Maintenance + Tolls + Other)
  const totalExpenses = db.expenses.reduce((sum, e) => sum + e.amount, 0);

  // Completed trips
  const completedTrips = db.trips.filter(t => t.status === 'Completed');
  
  // Fuel Efficiency = (Total Completed Trip Distance) / (Total Completed Trip Fuel)
  const totalDistance = completedTrips.reduce((sum, t) => sum + t.distance, 0);
  const totalFuelLiters = completedTrips.reduce((sum, t) => sum + t.fuelConsumed, 0);
  const fleetFuelEfficiency = totalFuelLiters > 0 
    ? Math.round((totalDistance / totalFuelLiters) * 10) / 10 
    : 0;

  // Mock revenue model: ₹80 per kilometer * cargo cargo weight factor (weight / 1000)
  // Let's calculate vehicle revenue for ROI
  const getVehicleROI = () => {
    return db.vehicles.map(v => {
      // Find completed trips for this vehicle
      const vehicleTrips = db.trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
      
      // Revenue = distance * 80 + cargo_weight * 2
      const revenue = vehicleTrips.reduce((sum, t) => sum + (t.distance * 80) + (t.cargoWeight * 2), 0);
      
      // Costs
      const vehicleExpenses = db.expenses.filter(e => e.vehicleId === v.id);
      const fuelCost = vehicleExpenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
      const maintCost = vehicleExpenses.filter(e => e.type === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
      const tollCost = vehicleExpenses.filter(e => e.type === 'Tolls').reduce((sum, e) => sum + e.amount, 0);
      
      const totalCosts = fuelCost + maintCost + tollCost;
      const netProfit = revenue - totalCosts;

      // ROI = ((Revenue - (Maint + Fuel)) / Acquisition Cost) * 100
      const roi = v.acquisitionCost > 0 
        ? Math.round((netProfit / v.acquisitionCost) * 10000) / 100 
        : 0;

      return {
        ...v,
        revenue,
        costs: totalCosts,
        netProfit,
        roi
      };
    });
  };

  const vehiclesROIList = getVehicleROI();
  const averageROI = vehiclesROIList.length > 0 
    ? Math.round(vehiclesROIList.reduce((sum, v) => sum + v.roi, 0) / vehiclesROIList.length * 10) / 10 
    : 0;

  // 2. Chart Data mapping
  // Cost breakdown chart data
  const costBreakdownData = db.vehicles.map(v => {
    const expenses = db.expenses.filter(e => e.vehicleId === v.id);
    return {
      name: v.model,
      Fuel: expenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0),
      Maintenance: expenses.filter(e => e.type === 'Maintenance').reduce((sum, e) => sum + e.amount, 0),
      Tolls: expenses.filter(e => e.type === 'Tolls').reduce((sum, e) => sum + e.amount, 0)
    };
  });

  // Fuel Efficiency comparison data
  const fuelEfficiencyData = completedTrips.map(t => {
    const vehicle = db.vehicles.find(v => v.id === t.vehicleId);
    return {
      tripId: t.id,
      vehicle: vehicle ? vehicle.model : 'Unknown',
      efficiency: t.fuelConsumed > 0 ? Math.round((t.distance / t.fuelConsumed) * 10) / 10 : 0
    };
  });

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header
    csvContent += 'Vehicle Name,Registration Number,Acquisition Cost,Status,Odometer,Total Expenses,Revenue,ROI (%)\n';
    
    // Rows
    vehiclesROIList.forEach(v => {
      csvContent += `"${v.model}","${v.regNumber}",${v.acquisitionCost},"${v.status}",${v.odometer},${v.costs},${v.revenue},${v.roi}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transitops_fleet_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="main-content">
      {/* Top Navbar */}
      <div className="top-nav">
        <div className="page-title">
          <h1>Reports & Analytics</h1>
          <p>Analyze operational metrics, fleet ROI, fuel economy and expenses</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <FileDown size={18} />
            <span>Export Fleet CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Fuel Efficiency
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', color: '#FF8A00' }}>
            {fleetFuelEfficiency > 0 ? `${fleetFuelEfficiency} km/l` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Fleet-wide average economy
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Fleet Utilization
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', color: '#1890FF' }}>
            {fleetUtilization}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Active vs Total operating fleet
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Operational Cost
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', color: '#FA8C16' }}>
            ₹{totalExpenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Fuel + Maintenance + Toll expenses
          </div>
        </div>

        <div className="glass-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Average Fleet ROI
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem', color: '#52C41A' }}>
            {averageROI}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Capital return on fleet assets
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Cost breakdown chart */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3>Cost Breakdown by Vehicle (₹)</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costBreakdownData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D34" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Legend />
                <Bar dataKey="Fuel" stackId="a" fill="#FF8A00" />
                <Bar dataKey="Maintenance" stackId="a" fill="#FA8C16" />
                <Bar dataKey="Tolls" stackId="a" fill="#1890FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel economy over time/trips */}
        <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3>Trip Fuel Efficiency Trend (km/l)</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            {fuelEfficiencyData.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                No completed trips to display efficiency trends.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={fuelEfficiencyData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D34" />
                  <XAxis dataKey="tripId" label={{ value: 'Trip ID', position: 'insideBottomRight', offset: -5 }} stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" name="Fuel Economy" stroke="#52C41A" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Detailed ROI Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Vehicle ROI Summary</h3>
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle Model</th>
                <th>Reg Number</th>
                <th>Acquisition Cost</th>
                <th>Total Expenses</th>
                <th>Calculated Revenue</th>
                <th>Net Returns</th>
                <th>Asset ROI</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesROIList.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.model}</td>
                  <td>{v.regNumber}</td>
                  <td>₹{v.acquisitionCost.toLocaleString()}</td>
                  <td>₹{v.costs.toLocaleString()}</td>
                  <td>₹{v.revenue.toLocaleString()}</td>
                  <td style={{ color: v.netProfit >= 0 ? '#52C41A' : '#F5222D' }}>
                    {v.netProfit >= 0 ? '+' : ''}₹{v.netProfit.toLocaleString()}
                  </td>
                  <td>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        color: v.roi >= 0 ? '#52C41A' : '#F5222D',
                        backgroundColor: v.roi >= 0 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(245, 34, 45, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px'
                      }}
                    >
                      {v.roi}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
