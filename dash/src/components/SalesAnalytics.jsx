import { useState } from 'react';
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

// For demo purposes, using inline data
const salesData = {
  quarters: ['Mar-Apr-May 2024', 'Jun-Jul-Aug 2024', 'Sep-Oct-Nov 2024', 'Dec-Jan-Feb 2025', 'Mar-Apr-May 2025'],
  directSales: [9960000, 12450000, 14940000, 16600000, 18000000],
  institutionalSales: [6640000, 7470000, 8300000, 9130000, 9500000],
  channelSales: [4150000, 4980000, 5810000, 6640000, 7000000],
  hitMiss: {
    hit: [75, 80, 85, 90, 88],
    miss: [25, 20, 15, 10, 12]
  },
  achievedNotAchieved: {
    achieved: [80, 85, 90, 95, 92],
    notAchieved: [20, 15, 10, 5, 8]
  },
  targets: [16600000, 20750000, 24900000, 29050000, 31000000]
};

const forecastData = {
  quarters: ['Mar-Apr-May 2024', 'Jun-Jul-Aug 2024', 'Sep-Oct-Nov 2024', 'Dec-Jan-Feb 2025', 'Mar-Apr-May 2025'],
  revenueTargets: [16600000, 20750000, 24900000, 29050000, 31000000],
  forecastedSales: [14940000, 19090000, 23240000, 27390000, 29500000]
};

const kpiData = {
  totalRevenue: 53600000,
  topProduct: 'ARMORED PHONE',
  topState: 'NY'
};

const productData = [
  { id: 1, name: 'ARMORED PHONE', price: 180000, category: 'Electronics', stock: 150, sales: 500, description: 'High-quality widget for enterprise solutions.', image: '/src/assets/Product1.png' },
  { id: 2, name: 'SGA 10', price: 41417, category: 'Gadgets', stock: 200, sales: 300, description: 'Premium gadget with advanced features.', image: '/src/assets/Product2.png' },
  { id: 3, name: 'SGA 100', price: 96517, category: 'Tools', stock: 120, sales: 400, description: 'Cost-effective tool for small businesses.', image: '/src/assets/Product3.png' },
];

const customerData = [
  { id: 1, name: 'Acme Corp', contact: 'john@acme.com', state: 'CA', totalPurchases: 1245000, lastPurchaseDate: '2025-07-15' },
  { id: 2, name: 'Beta Inc', contact: 'jane@beta.com', state: 'NY', totalPurchases: 1826000, lastPurchaseDate: '2025-07-20' },
  { id: 3, name: 'Gamma LLC', contact: 'bob@gamma.com', state: 'TX', totalPurchases: 830000, lastPurchaseDate: '2025-07-10' },
  { id: 4, name: 'Delta Co', contact: 'alice@delta.com', state: 'FL', totalPurchases: 950000, lastPurchaseDate: '2025-07-25' },
  { id: 5, name: 'Epsilon Ltd', contact: 'charlie@epsilon.com', state: 'IL', totalPurchases: 600000, lastPurchaseDate: '2025-07-18' }
];

function SalesChart({ filter, quarter }) {
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
  const [filter, setFilter] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('Mar-Apr-May 2025');
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const quarterIndex = salesData.quarters.indexOf(selectedQuarter);
  const totalSalesTarget = quarterIndex !== -1 ? salesData.targets[quarterIndex] : 0;
  const actualSales = quarterIndex !== -1 ? salesData.directSales[quarterIndex] + salesData.institutionalSales[quarterIndex] + salesData.channelSales[quarterIndex] : 0;
  const hitPercentage = quarterIndex !== -1 ? salesData.hitMiss.hit[quarterIndex] : 50;
  const missPercentage = quarterIndex !== -1 ? salesData.hitMiss.miss[quarterIndex] : 50;

  const totalCustomerValue = customerData.reduce((sum, customer) => sum + customer.totalPurchases, 0);
  const topCustomer = customerData.reduce((max, customer) => 
    customer.totalPurchases > max.totalPurchases ? customer : max
  , customerData[0]);
  
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
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
        </div>
      </div>

      {/* Enhanced Main Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
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
            <button style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#005f73',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Export Data
            </button>
            <button 
              onClick={() => setShowInsights(!showInsights)}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid #0a9396',
                borderRadius: '6px',
                backgroundColor: showInsights ? '#0a9396' : 'transparent',
                color: showInsights ? 'white' : '#0a9396',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Insights
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
              top: '50%',
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

        {/* Insights Panel */}
        {showInsights && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            gridColumn: 'span 2'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#1e293b', 
              marginBottom: '16px' 
            }}>
              📊 AI-Powered Insights
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                borderLeft: '4px solid #0369a1'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
                  Performance Trend
                </h4>
                <p style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>
                  Sales are trending {trendDirection === 'up' ? 'upward' : 'downward'} with {quarterGrowth > 0 ? 'a' : 'a'} {Math.abs(quarterGrowth)}% change from last quarter. 
                  {quarterGrowth > 10 ? ' Excellent growth momentum!' : quarterGrowth > 0 ? ' Steady improvement.' : ' Focus needed on growth strategies.'}
                </p>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                borderLeft: '4px solid #16a34a'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', marginBottom: '8px' }}>
                  Customer Insights
                </h4>
                <p style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>
                  Top customer {topCustomer.name} contributes ₹{(topCustomer.totalPurchases/100000).toFixed(1)}L ({((topCustomer.totalPurchases/totalCustomerValue)*100).toFixed(1)}% of total customer value). 
                  Focus on similar high-value prospects.
                </p>
              </div>
              
              <div style={{
                padding: '16px',
                backgroundColor: '#fefce8',
                borderRadius: '8px',
                borderLeft: '4px solid #ca8a04'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#ca8a04', marginBottom: '8px' }}>
                  Target Analysis
                </h4>
                <p style={{ fontSize: '13px', color: '#1e293b', margin: 0 }}>
                  Current achievement rate is {hitPercentage}%. To improve, focus on {hitPercentage < 85 ? 'institutional sales' : 'channel partnerships'} 
                  {hitPercentage < 80 ? ' and direct customer acquisition.' : '.'}
                </p>
              </div>
            </div>
          </div>
        )}

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
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(10, 147, 150, 0.1)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0a9396'
            }}>
              Confidence: 92%
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
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setShowForecastModal(true)}
              style={{
                padding: '10px 18px',
                fontSize: '12px',
                fontWeight: '600',
                border: '2px solid #0a9396',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#0a9396',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Adjust Forecast Parameters
            </button>
            <button style={{
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#0a9396',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Modal */}
      {showForecastModal && (
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
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              Adjust Forecast Parameters
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Growth Rate (%)
              </label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                defaultValue="8.5"
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ fontSize: '12px', color: '#64748b' }}>Current: 8.5%</div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Confidence Level (%)
              </label>
              <input 
                type="range" 
                min="70" 
                max="95" 
                defaultValue="92"
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ fontSize: '12px', color: '#64748b' }}>Current: 92%</div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Market Conditions
              </label>
              <select style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '6px', 
                border: '1px solid #e2e8f0' 
              }}>
                <option>Optimistic</option>
                <option>Realistic</option>
                <option>Conservative</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowForecastModal(false)}
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
                onClick={() => setShowForecastModal(false)}
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
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesAnalytics;