import { useState } from 'react';
import SalesChart from './SalesChart.jsx';
import ExpenditureChart from './ExpenditureChart.jsx';
import ForecastCard from '/src/components/ForecastCard.jsx';
import { salesData, customerPurchasesByState } from '/src/data/mockData';
import { FaBell } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = [
    { id: 1, message: 'Sales target missed for Q3', unread: true },
    { id: 2, message: 'New customer added: Delta Corp', unread: false },
    { id: 3, message: 'Product B stock low in NY', unread: false }
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const salesTargetData = {
    labels: salesData.quarters,
    datasets: [
      {
        label: 'Target (₹)',
        data: salesData.targets,
        backgroundColor: '#0a9396',
        borderColor: '#005f73',
        borderWidth: 1
      },
      {
        label: 'Achieved (₹)',
        data: salesData.quarters.map((_, i) => 
          (salesData.directSales[i] + salesData.institutionalSales[i] + salesData.channelSales[i]) * 
          (salesData.achievedNotAchieved.achieved[i] / 100)
        ),
        backgroundColor: '#94d2bd',
        borderColor: '#005f73',
        borderWidth: 1
      }
    ]
  };

  const customerPurchasesData = {
    labels: ['Maharashtra', 'Uttar Pradesh', 'Tamil Nadu', 'Kerala', 'West Bengal'],
    datasets: [
      {
        label: 'Purchases (₹)',
        data: [5000000, 4500000, 3000000, 2500000, 2000000],
        backgroundColor: '#0a9396',
        borderColor: '#005f73',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => '₹' + value.toLocaleString('en-IN')
        }
      }
    }
  };

  const totalSales = salesData.quarters.reduce((sum, _, i) => sum + (salesData.directSales[i] + salesData.institutionalSales[i] + salesData.channelSales[i]), 0);
  const totalExpenditure = 17230000;
  const profitMargin = ((totalSales - totalExpenditure) / totalSales * 100).toFixed(2);
  const topState = customerPurchasesData.labels.reduce((maxState, state, i) => 
    customerPurchasesData.datasets[0].data[i] > (customerPurchasesData.datasets[0].data[maxState.index] || 0) ? { index: i, name: state } : maxState, { index: 0, name: customerPurchasesData.labels[0] }).name;
  const topProduct = 'ARMORED PHONE';

  const quarterlySales = salesData.quarters.map((_, i) => salesData.directSales[i] + salesData.institutionalSales[i] + salesData.channelSales[i]);
  const growthRates = quarterlySales.slice(1).map((current, i) => ((current - quarterlySales[i]) / quarterlySales[i] * 100).toFixed(2));
  const averageGrowthRate = growthRates.reduce((sum, rate) => sum + parseFloat(rate), 0) / growthRates.length || 0;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>MIS</h1>
        <div className="notification-container">
          <div style={{ position: 'relative' }}>
            <FaBell className="notification-bell" onClick={() => setShowNotifications(!showNotifications)} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: '#aecfeeff',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '600'
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          {showNotifications && (
            <div className="notification-dropdown">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className="notification-item"
                  style={{
                    backgroundColor: notification.unread ? '#e0f2fe' : 'white',
                    fontWeight: notification.unread ? '600' : '400',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {notification.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="insights" style={{ padding: '16px', backgroundColor: '#f8fafc', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '12px' }}>Key Insights</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Total Sales</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>₹{totalSales.toLocaleString('en-IN')}</p>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Profit Margin</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{profitMargin}%</p>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Total Expenditure</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>₹{totalExpenditure.toLocaleString('en-IN')}</p>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Top Performing State</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{topState}</p>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Top Product</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{topProduct}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-large" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div className="card">
          <h2>Sales Performance (All Quarters)</h2>
          <SalesChart filter="all" />
        </div>
        <div className="card">
          <h2>Total Sales Target vs. Achieved</h2>
          <div className="chart-container">
            <Bar data={salesTargetData} options={options} />
          </div>
        </div>
        <div className="card">
          <h2>Expenditure Breakdown</h2>
          <ExpenditureChart />
        </div>
        <div className="card">
          <h2>Customer Purchases by State</h2>
          <div className="chart-container">
            <Bar data={customerPurchasesData} options={options} />
          </div>
        </div>
        <div className="card forecast-card" style={{ gridColumn: 'span 2' }}>
          <h2>Sales Forecast</h2>
          <ForecastCard />
        </div>
        <div className="card kpi-card" style={{ height: '200px' }}>
          <h2>Sales Target Achievement</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
              {salesData.achievedNotAchieved.achieved.reduce((a, b) => a + b, 0) / salesData.achievedNotAchieved.achieved.length}%
            </p>
          </div>
        </div>
        <div className="card kpi-card" style={{ height: '200px' }}>
          <h2>Expenditure-to-Sales Ratio</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
              {(totalExpenditure / totalSales * 100).toFixed(2)}%
            </p>
          </div>
        </div>
        <div className="card kpi-card" style={{ height: '200px' }}>
          <h2>Sales Growth Rate</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
              {averageGrowthRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;