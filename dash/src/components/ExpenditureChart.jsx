import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { expenditureData } from '/src/data/mockData';

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenditureChart() {
  const data = {
    labels: expenditureData.categories,
    datasets: [
      {
        data: expenditureData.values,
        backgroundColor: ['#005f73','#104681ff','#aecfeeff', '#94d2bd','#87c7caff','#0a9396'],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12, family: 'Segoe UI' } } },
      title: { display: true, text: 'Expenditure by Category', font: { size: 16, family: 'Segoe UI' } }
    }
  };

  return <div className="chart-container"><Pie data={data} options={options} /></div>;
}

export default ExpenditureChart;