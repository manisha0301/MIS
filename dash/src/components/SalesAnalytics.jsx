import { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement 
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const customerData = [
  { id: 1,  state: 'CA', totalPurchases: 1245000 },
  { id: 2,  state: 'NY', totalPurchases: 1826000 },
  { id: 3, state: 'TX', totalPurchases: 830000 },
  { id: 4, state: 'FL', totalPurchases: 950000 },
  { id: 5, state: 'IL', totalPurchases: 600000 }
];

function SalesChart({ filter, quarter }) {
  const [salesData, setSalesData] = useState({
    quarters: [],
    directSales: [],
    institutionalSales: [],
    channelSales: [],
    hitMiss: { hit: [], miss: [] },
    achievedNotAchieved: { achieved: [], notAchieved: [] },
    targets: []
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sales');
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const data = await response.json();
        setSalesData(data.salesData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };
    fetchSalesData();
  }, []);

  const labels = quarter && quarter !== 'all' ? [quarter] : salesData.quarters;

  const data = {
    labels,
    datasets: [
      {
        label: 'Direct Sales',
        data: quarter && quarter !== 'all'
          ? [salesData.directSales[salesData.quarters.indexOf(quarter)]]
          : salesData.directSales,
        borderColor: '#0a9396',
        backgroundColor: 'rgba(10, 147, 150, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#0a9396',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
        hidden: filter !== 'all' && filter !== 'direct'
      },
      {
        label: 'Institutional Sales',
        data: quarter && quarter !== 'all'
          ? [salesData.institutionalSales[salesData.quarters.indexOf(quarter)]]
          : salesData.institutionalSales,
        borderColor: '#94d2bd',
        backgroundColor: 'rgba(148, 210, 189, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#94d2bd',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
        hidden: filter !== 'all' && filter !== 'institutional'
      },
      {
        label: 'Channel Sales',
        data: quarter && quarter !== 'all'
          ? [salesData.channelSales[salesData.quarters.indexOf(quarter)]]
          : salesData.channelSales,
        borderColor: '#005f73',
        backgroundColor: 'rgba(0, 95, 115, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#005f73',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
        hidden: filter !== 'all' && filter !== 'channel'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ₹${context.raw.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: value => '₹' + value.toLocaleString('en-IN'),
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '250px', position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  );
}

function SalesAnalytics() {
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
  const [customerData, setCustomerData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newQuarterData, setNewQuarterData] = useState({
    quarter: '',
    directSales: '',
    institutionalSales: '',
    channelSales: '',
    hit: '',
    achieved: '',
    target: '',
    forecastedSales: ''
  });
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/sales');
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const data = await response.json();
        console.log('Fetched sales data:', data);
        setSalesData(data.salesData);
        setForecastData(data.forecastData);
        if (data.salesData.quarters.length > 0) {
          setSelectedQuarter(data.salesData.quarters[data.salesData.quarters.length - 1]);
        }
        const customersResponse = await fetch('http://localhost:5000/api/customers');
        if (!customersResponse.ok) {
          throw new Error('Failed to fetch customer data');
        }
        const customers = await customersResponse.json();
        console.log('Fetched customer data:', customers);
        setCustomerData(customers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quarterIndex = salesData.quarters.indexOf(selectedQuarter);
  const totalSalesTarget = quarterIndex !== -1 ? salesData.targets[quarterIndex] : 0;
  const actualSales = quarterIndex !== -1 ? salesData.directSales[quarterIndex] + salesData.institutionalSales[quarterIndex] + salesData.channelSales[quarterIndex] : 0;
  const hitPercentage = quarterIndex !== -1 ? salesData.hitMiss.hit[quarterIndex] : 50;
  const missPercentage = quarterIndex !== -1 ? salesData.hitMiss.miss[quarterIndex] : 50;

  const totalCustomerValue = customerData.reduce((sum, customer) => sum + (parseFloat(customer.total_purchases) || 0), 0);  

  const quarterGrowth = quarterIndex > 0 ? 
    ((actualSales - (salesData.directSales[quarterIndex - 1] + salesData.institutionalSales[quarterIndex - 1] + salesData.channelSales[quarterIndex - 1])) 
    / (salesData.directSales[quarterIndex - 1] + salesData.institutionalSales[quarterIndex - 1] + salesData.channelSales[quarterIndex - 1]) * 100).toFixed(1) 
    : 0;

  const avgHitRate = salesData.hitMiss.hit.reduce((sum, hit) => sum + hit, 0) / salesData.hitMiss.hit.length;
  const trendDirection = quarterIndex > 0 && salesData.hitMiss.hit[quarterIndex] > salesData.hitMiss.hit[quarterIndex - 1] ? 'up' : 'down';

  const nextQuarterForecast = quarterIndex < forecastData.forecastedSales.length - 1 ? 
    forecastData.forecastedSales[quarterIndex + 1] : forecastData.forecastedSales[quarterIndex];

  const hitMissData = {
    labels: ['Target Achieved', 'Target Missed'],
    datasets: [
      {
        data: [hitPercentage, missPercentage],
        backgroundColor: ['#269a50ff', '#c34444ff'],
        borderColor: ['#269a50ff', '#c34444ff'],
        borderWidth: 0,
        hoverBackgroundColor: ['#64c788ff', '#d24848ff'],
        hoverBorderWidth: 0,
        hoverBorderColor: ['transparent', 'transparent'],
        cutout: '60%',
        spacing: 2
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { 
            size: 14, 
            family: 'system-ui, -apple-system, sans-serif', 
            weight: '600' 
          },
          color: '#1e293b',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#1e293b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: context => `${context.label}: ${context.raw}%`
        }
      }
    },
    elements: {
      arc: {
        borderRadius: 8,
        borderWidth: 0,
        hoverBorderWidth: 0
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuarterData({ ...newQuarterData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newQuarterData.quarter ||
      !newQuarterData.directSales ||
      !newQuarterData.institutionalSales ||
      !newQuarterData.channelSales ||
      !newQuarterData.hit ||
      !newQuarterData.achieved ||
      !newQuarterData.target ||
      !newQuarterData.forecastedSales
    ) {
      setNotification({ message: 'Please fill all fields.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }

    const hitNum = parseFloat(newQuarterData.hit);
    const achievedNum = parseFloat(newQuarterData.achieved);
    if (isNaN(hitNum) || hitNum < 0 || hitNum > 100 || isNaN(achievedNum) || achievedNum < 0 || achievedNum > 100) {
      setNotification({ message: 'Hit and Achieved percentages must be between 0 and 100.', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quarter: newQuarterData.quarter,
          direct_sales: parseFloat(newQuarterData.directSales),
          institutional_sales: parseFloat(newQuarterData.institutionalSales),
          channel_sales: parseFloat(newQuarterData.channelSales),
          hit_percentage: hitNum,
          achieved_percentage: achievedNum,
          target: parseFloat(newQuarterData.target),
          forecasted_sales: parseFloat(newQuarterData.forecastedSales)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add sales data');
      }

      const newData = await response.json();
      // Update local state with new data
      const fetchData = async () => {
        const res = await fetch('http://localhost:5000/api/sales');
        if (res.ok) {
          const data = await res.json();
          setSalesData(data.salesData);
          setForecastData(data.forecastData);
          setSelectedQuarter(newQuarterData.quarter);
        }
      };
      fetchData();
      setNotification({ message: 'Sales data added successfully!', visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
      setNewQuarterData({
        quarter: '',
        directSales: '',
        institutionalSales: '',
        channelSales: '',
        hit: '',
        achieved: '',
        target: '',
        forecastedSales: ''
      });
      setIsFormOpen(false);
    } catch (error) {
      setNotification({ message: error.message, visible: true });
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  const handleExport = () => {
    if (salesData.quarters.length === 0) {
      setNotification({ message: 'No data to export', visible: true });
      setTimeout(() => setNotification({ message: '', visible: false }), 3000);
      return;
    }
    const headers = [
      'Quarter',
      'Direct Sales (₹)',
      'Institutional Sales (₹)',
      'Channel Sales (₹)',
      'Hit Percentage (%)',
      'Achieved Percentage (%)',
      'Target (₹)',
      'Forecasted Sales (₹)'
    ];
    const rows = salesData.quarters.map((quarter, index) => [
      quarter,
      salesData.directSales[index].toLocaleString('en-IN'),
      salesData.institutionalSales[index].toLocaleString('en-IN'),
      salesData.channelSales[index].toLocaleString('en-IN'),
      salesData.hitMiss.hit[index],
      salesData.achievedNotAchieved.achieved[index],
      salesData.targets[index].toLocaleString('en-IN'),
      forecastData.forecastedSales[index].toLocaleString('en-IN')
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales_analytics_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotification({ message: 'Data exported successfully', visible: true });
    setTimeout(() => setNotification({ message: '', visible: false }), 3000);
  };

  // The rest of the JSX remains unchanged
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #005f73, #0a9396)',
        padding: '20px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0, 95, 115, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
          Sales Analytics Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <select
            value={selectedQuarter}
            onChange={e => setSelectedQuarter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              minWidth: '180px'
            }}
          >
            {salesData.quarters.map(quarter => (
              <option key={quarter} value={quarter}>{quarter}</option>
            ))}
          </select>
          <div style={{ 
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '2px' }}>
              Target
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>
              ₹{(totalSalesTarget/10000000).toFixed(1)}Cr
            </div>
          </div>
          <div style={{ 
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '2px' }}>
              Actual Sales
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>
              ₹{(actualSales/10000000).toFixed(1)}Cr
            </div>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className='action-button'
          >
            Add Sales Data
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {notification.visible && (
        <div style={{
          minHeight: '100vh',
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px',
          backgroundColor: notification.message.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: notification.message.includes('successfully') ? '#155724' : '#721c24',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {notification.message}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Sales Performance Chart */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginBottom: '4px' 
            }}>
              Sales Performance
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              {selectedQuarter} - Growth: {quarterGrowth > 0 ? '+' : ''}{quarterGrowth}%
            </p>
          </div>
          
          <div style={{ height: '250px', marginBottom: '16px' }}>
            <SalesChart filter={filter} quarter={selectedQuarter} />
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'direct', label: 'Direct' },
              { key: 'institutional', label: 'Institutional' },
              { key: 'channel', label: 'Channel' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: filter === key ? '#0a9396' : '#f1f5f9',
                  color: filter === key ? 'white' : '#64748b'
                }}
              >
                {label}
              </button>
            ))}
            </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#005f73',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={handleExport}>
              Export Data
            </button>
          </div>
          </div>

        {/* Hit/Miss Chart */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginBottom: '4px' 
            }}>
              Target Achievement
          </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
              {selectedQuarter} - Trend: {trendDirection === 'up' ? '📈' : '📉'} {avgHitRate.toFixed(1)}% avg
            </p>
          </div>
          
          <div style={{ height: '200px', position: 'relative', marginBottom: '16px' }}>
            <Pie data={hitMissData} options={pieOptions} />
            
            {/* Center text overlay */}
            <div style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0a2552ff' }}>
                {hitPercentage}%
          </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                Achievement
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px'
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#dcfce7',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
                {hitPercentage}%
              </div>
              <div style={{ fontSize: '11px', color: '#15803d', marginTop: '2px' }}>
                Target Hit
              </div>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626' }}>
                {missPercentage}%
              </div>
              <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                Target Miss
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Sales Forecast Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
          borderRadius: '12px',
          padding: '24px',
          color: '#1e293b',
          gridColumn: 'span 2',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                marginBottom: '4px' 
              }}>
                Sales Forecast & Projections
              </h2>
              <p style={{ opacity: 0.7, fontSize: '13px', margin: 0 }}>
                Next Quarter: ₹{(nextQuarterForecast/10000000).toFixed(1)}Cr projected
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>
                ₹{(forecastData.forecastedSales[forecastData.forecastedSales.length-1]/10000000).toFixed(1)}Cr
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                Current Forecast
              </div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>
                +{((nextQuarterForecast - actualSales) / actualSales * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                Expected Growth
              </div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0a9396' }}>
                {avgHitRate.toFixed(0)}%
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                Avg Hit Rate
              </div>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#ca8a04' }}>
                ₹{(totalCustomerValue/10000000).toFixed(1)}Cr
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                Customer Pipeline
              </div>
            </div>
          </div>
        </div>

        {/* Form for adding new quarter data */}
        {isFormOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
                Add New Quarter Data
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Quarter
                  </label>
                  <input
                    type="text"
                    name="quarter"
                    value={newQuarterData.quarter}
                    onChange={handleInputChange}
                    placeholder="e.g., Jun-Jul-Aug 2025"
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Direct Sales (₹)
                  </label>
                  <input
                    type="number"
                    name="directSales"
                    value={newQuarterData.directSales}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Institutional Sales (₹)
                  </label>
                  <input
                    type="number"
                    name="institutionalSales"
                    value={newQuarterData.institutionalSales}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Channel Sales (₹)
                  </label>
                  <input
                    type="number"
                    name="channelSales"
                    value={newQuarterData.channelSales}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Hit Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="hit"
                    value={newQuarterData.hit}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Achieved Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="achieved"
                    value={newQuarterData.achieved}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Target (₹)
                  </label>
                  <input
                    type="number"
                    name="target"
                    value={newQuarterData.target}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Forecasted Sales (₹)
                  </label>
                  <input
                    type="number"
                    name="forecastedSales"
                    value={newQuarterData.forecastedSales}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#0a9396',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SalesAnalytics;