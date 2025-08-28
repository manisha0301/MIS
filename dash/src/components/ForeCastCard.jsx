import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { forecastData } from '/src/data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ForecastCard() {
  const data = {
    labels: forecastData.quarters,
    datasets: [
      {
        label: 'Revenue Targets',
        data: forecastData.revenueTargets,
        borderColor: '#ffffff',
        backgroundColor: '#ffffff',
        fill: false,
        tension: 0.3
      },
      {
        label: 'Forecasted Sales',
        data: forecastData.forecastedSales,
        borderColor: '#aecfeeff',
        backgroundColor: '#aecfeeff',
        fill: false,
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12, family: 'Segoe UI' } } },
      title: { display: true, text: 'Sales Forecast vs Targets', font: { size: 16, family: 'Segoe UI' } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#ffffff' } }
    }
  };

  return <div className="chart-container"><Line data={data} options={options} /></div>;
}

export default ForecastCard;