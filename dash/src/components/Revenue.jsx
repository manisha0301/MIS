import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Revenue() {
  const [view, setView] = useState('all'); // 'all', 'sales', 'project'
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesRes = await fetch('http://localhost:5000/api/invoices/sales');
        const sales = await salesRes.json();
        setSalesInvoices(sales);

        const projectsRes = await fetch('http://localhost:5000/api/projects');
        const projects = await projectsRes.json();
        setProjectData(projects);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Define companies
  const companies = ['Kristellar Aerospace', 'Kristellar Cyberspace', 'Protelion'];

  // Aggregate revenue from sales invoices and project-based revenue
  const totalSalesRevenue = salesInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0);
  const projectRevenue = projectData.reduce((sum, project) => sum + parseFloat(project.revenue), 0);
  const totalRevenue = totalSalesRevenue + projectRevenue;

  // Revenue by company
  const companyRevenue = {
    'Protelion India': salesInvoices
      .filter(invoice => invoice.customer.includes('Acme'))
      .reduce((sum, invoice) => sum + invoice.amount, 0),
    'Kristellar Cyberspace': salesInvoices
      .filter(invoice => invoice.customer.includes('Beta'))
      .reduce((sum, invoice) => sum + invoice.amount, 0) +
      projectData
      .filter(project => project.company === 'Kristellar Cyberspace')
      .reduce((sum, project) => sum + project.revenue, 0),
    'Kristellar Aerospace': projectData
      .filter(project => project.company === 'Kristellar Aerospace')
      .reduce((sum, project) => sum + project.revenue, 0)
  };

  // Data for the chart based on view
  const getChartData = () => {
    const labels = companies;
    let data = [];

    if (view === 'all') {
      data = companies.map(company => {
        const sales = salesInvoices
          .filter(invoice => invoice.company === company || (company === 'Protelion' && invoice.company === 'Protelion India'))
          .reduce((sum, inv) => sum + inv.amount, 0);
        const projects = projectData
          .filter(project => project.company === company)
          .reduce((sum, p) => sum + p.revenue, 0);
        return sales + projects;
      });
    } else if (view === 'sales') {
      data = companies.map(company => {
        return salesInvoices
          .filter(invoice => invoice.company === company || (company === 'Protelion' && invoice.company === 'Protelion India'))
          .reduce((sum, inv) => sum + inv.amount, 0);
      });
    } else if (view === 'project') {
      data = companies.map(company => {
        return projectData
          .filter(project => project.company === company)
          .reduce((sum, p) => sum + p.revenue, 0);
      });
    }

    return {
      labels,
      datasets: [
        {
          label: `Revenue (₹) - ${view.charAt(0).toUpperCase() + view.slice(1)}`,
          data,
          backgroundColor: '#0a9396',
          borderColor: '#005f73',
          borderWidth: 1,
          hoverBackgroundColor: '#0a9396cc'
        }
      ]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, family: 'Segoe UI', weight: '500' },
          padding: 16,
          usePointStyle: true,
          boxWidth: 8,
          color: '#1e293b'
        }
      },
      title: {
        display: true,
        text: `Revenue by Company (${view.charAt(0).toUpperCase() + view.slice(1)})`,
        font: { size: 18, family: 'Segoe UI', weight: '600' },
        padding: { top: 16, bottom: 16 },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, family: 'Segoe UI', weight: '600' },
        bodyFont: { size: 12, family: 'Segoe UI' },
        padding: 12,
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => '₹' + value.toLocaleString('en-IN')
        },
        grid: {
          color: '#e2e8f0',
          lineWidth: 1
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad'
    }
  };

  return (
    <div className="dashboard" style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div className="header" style={{
        background: 'linear-gradient(135deg, #005f73, #0a9396)',
        padding: '20px',
        borderRadius: '8px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          letterSpacing: '0.2px'
        }}>Revenue Overview</h1>
      </div>
      <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        animation: 'fadeIn 0.5s ease-in'
      }}>
        <div className="card" style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
        >
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>Total Revenue</h2>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b'
          }}>₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="card" style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
        >
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>Sales Revenue</h2>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b'
          }}>₹{totalSalesRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="card" style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
        >
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
          }}>Project Revenue</h2>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b'
          }}>₹{projectRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setView('all')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'all' ? '#0a9396' : '#e2e8f0',
            color: view === 'all' ? '#ffffff' : '#1e293b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = view === 'all' ? '#005f73' : '#d1d5db';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = view === 'all' ? '#0a9396' : '#e2e8f0';
            e.target.style.transform = 'scale(1)';
          }}
        >
          All Revenue
        </button>
        <button
          onClick={() => setView('sales')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'sales' ? '#0a9396' : '#e2e8f0',
            color: view === 'sales' ? '#ffffff' : '#1e293b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = view === 'sales' ? '#005f73' : '#d1d5db';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = view === 'sales' ? '#0a9396' : '#e2e8f0';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Sales Revenue
        </button>
        <button
          onClick={() => setView('project')}
          style={{
            padding: '8px 16px',
            backgroundColor: view === 'project' ? '#0a9396' : '#e2e8f0',
            color: view === 'project' ? '#ffffff' : '#1e293b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = view === 'project' ? '#005f73' : '#d1d5db';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = view === 'project' ? '#0a9396' : '#e2e8f0';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Project Revenue
        </button>
      </div>
      <div className="card" style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
        maxWidth: '900px',
        margin: '0 auto',
        border: '1px solid #e8ecef',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.1)';
      }}
      >
        <h2 style={{
          fontSize: '22px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          letterSpacing: '0.2px'
        }}>Revenue by Company</h2>
        <div className="chart-container" style={{
          height: '300px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <Bar data={getChartData()} options={options} />
        </div>
      </div>
    </div>
  );
}

export default Revenue;