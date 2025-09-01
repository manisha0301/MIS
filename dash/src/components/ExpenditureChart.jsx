import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function ExpenditureChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#005f73', '#104681ff', '#aecfeeff', '#94d2bd', '#87c7caff', '#0a9396'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  });

  useEffect(() => {
    const fetchExpenditureData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/expenditures?quarter=All Quarters');
        if (!response.ok) {
          throw new Error('Failed to fetch expenditure data');
        }
        const data = await response.json();
        const expenditures = data.details;

        // Aggregate expenditure amounts by category
        const categoryTotals = expenditures.reduce((acc, category) => {
          const total = category.items.reduce((sum, item) => sum + item.amount, 0);
          acc[category.category] = (acc[category.category] || 0) + total;
          return acc;
        }, {});

        // Prepare data for Pie chart
        const labels = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);

        setChartData({
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: ['#005f73', '#104681ff', '#aecfeeff', '#94d2bd', '#87c7caff', '#0a9396'],
              borderColor: '#ffffff',
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching expenditure data:', error);
      }
    };

    fetchExpenditureData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12, family: 'Segoe UI' } } },
      title: { display: true, text: 'Expenditure by Category', font: { size: 16, family: 'Segoe UI' } },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ₹${value.toLocaleString('en-IN')}`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default ExpenditureChart;