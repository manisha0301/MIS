import { useEffect, useState } from 'react';
import SalesChart from './SalesChart.jsx';
import ExpenditureChart from './ExpenditureChart.jsx';
import ForecastCard from '/src/components/ForecastCard.jsx';
import { salesData, customerPurchasesByState } from '/src/data/mockData';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topProduct, setTopProduct] = useState('');
  const [salesData, setSalesData] = useState({
    quarters: [],
    directSales: [],
    institutionalSales: [],
    channelSales: [],
    hitMiss: { hit: [], miss: [] },
    achievedNotAchieved: { achieved: [], notAchieved: [] },
    targets: []
  });
  const [forecastData, setForecastData] = useState({
    quarters: [],
    revenueTargets: [],
    forecastedSales: []
  });
  const [customerPurchasesData, setCustomerPurchasesData] = useState({
    labels: [],
    datasets: [{
      label: 'Purchases (₹)',
      data: [],
      backgroundColor: '#0a9396',
      borderColor: '#005f73',
      borderWidth: 1
    }]
  });
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

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/sales');
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const { salesData: fetchedSalesData, forecastData: fetchedForecastData } = await response.json();
        setSalesData(fetchedSalesData);
        setForecastData(fetchedForecastData);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchCustomerData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/customers');
        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }
        const customers = await response.json();

        // Aggregate total purchases by state
        const statePurchases = customers.reduce((acc, customer) => {
          const state = customer.state;
          const purchases = parseFloat(customer.total_purchases) || 0;
          acc[state] = (acc[state] || 0) + purchases;
          return acc;
        }, {});

        // Prepare data for the chart
        const labels = Object.keys(statePurchases);
        const data = Object.values(statePurchases);

        setCustomerPurchasesData({
          labels,
          datasets: [{
            label: 'Purchases (₹)',
            data,
            backgroundColor: '#0a9396',
            borderColor: '#005f73',
            borderWidth: 1
          }]
        });
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchTopProduct = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        if (products.length > 0) {
          const highestPricedProduct = products.reduce((max, product) =>
            parseFloat(product.price) > parseFloat(max.price) ? product : max, products[0]);
          setTopProduct(highestPricedProduct.name);
        } else {
          setTopProduct('N/A');
        }
      } catch (err) {
        console.error('Error fetching top product:', err);
        setTopProduct('N/A');
      }
    };

    const fetchAllData = async () => {
      try {
        await Promise.all([fetchSalesData(), fetchCustomerData(), fetchTopProduct()]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const totalSales = salesData.quarters.reduce((sum, _, i) => sum + (salesData.directSales[i] + salesData.institutionalSales[i] + salesData.channelSales[i]), 0);
  const totalExpenditure = 17230000;
  const profitMargin = totalSales ? ((totalSales - totalExpenditure) / totalSales * 100).toFixed(2) : 0;
  const topState = customerPurchasesData.labels.length > 0
    ? customerPurchasesData.labels.reduce((maxState, state, i) =>
        customerPurchasesData.datasets[0].data[i] > (customerPurchasesData.datasets[0].data[maxState.index] || 0)
          ? { index: i, name: state }
          : maxState, { index: 0, name: customerPurchasesData.labels[0] }).name
    : 'N/A';
  const quarterlySales = salesData.quarters.map((_, i) => salesData.directSales[i] + salesData.institutionalSales[i] + salesData.channelSales[i]);
  const growthRates = quarterlySales.slice(1).map((current, i) => ((current - quarterlySales[i]) / quarterlySales[i] * 100).toFixed(2));
  const averageGrowthRate = growthRates.length > 0 ? growthRates.reduce((sum, rate) => sum + parseFloat(rate), 0) / growthRates.length : 0;
  
  return (
    <div className="dashboard">
      <div className="header">
        <h1>MIS</h1>
        <div className="notification-container">
          <div 
          style={{ position: 'relative', alignItems: 'center', cursor: 'pointer', justifyContent: 'center', display: 'flex', gap: '8px' }}
          onClick={() => {
            sessionStorage.clear();
            window.location.href = "/";
          }}
          >
            <FaSignOutAlt 
            className="notification-bell"
             />
            Logout
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
          <SalesChart filter="all" salesData={salesData} />
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
          <ForecastCard forecastData={forecastData} />
        </div>
        <div className="card kpi-card" style={{ height: '200px' }}>
          <h2>Sales Target Achievement</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
              {salesData.achievedNotAchieved.achieved.length > 0
                ? (salesData.achievedNotAchieved.achieved.reduce((a, b) => a + b, 0) / salesData.achievedNotAchieved.achieved.length).toFixed(2)
                : 0}%
            </p>
          </div>
        </div>
        <div className="card kpi-card" style={{ height: '200px' }}>
          <h2>Expenditure-to-Sales Ratio</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <p style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
              {totalSales ? (totalExpenditure / totalSales * 100).toFixed(2) : 0}%
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