import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { salesData } from '/src/data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
        backgroundColor: '#0a9396',
        hidden: filter !== 'all' && filter !== 'direct'
      },
      {
        label: 'Institutional Sales',
        data: quarter && quarter !== 'all'
          ? [salesData.institutionalSales[salesData.quarters.indexOf(quarter)]]
          : salesData.institutionalSales,
        borderColor: '#94d2bd',
        backgroundColor: '#94d2bd',
        hidden: filter !== 'all' && filter !== 'institutional'
      },
      {
        label: 'Channel Sales',
        data: quarter && quarter !== 'all'
          ? [salesData.channelSales[salesData.quarters.indexOf(quarter)]]
          : salesData.channelSales,
        borderColor: '#aecfeeff',
        backgroundColor: '#aecfeeff',
        hidden: filter !== 'all' && filter !== 'channel'
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

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
}

export default SalesChart;