import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { displayDate } from '../utils/date';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ReportChart({ series }) {
  const data = {
    labels: series.map((item) => displayDate(item.date, { year: undefined })),
    datasets: [{
      label: 'Calories (kcal)',
      data: series.map((item) => item.calories),
      backgroundColor: '#e7a637',
      borderRadius: 7,
      borderSkipped: false,
      maxBarThickness: 34
    }]
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { displayColors: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#65756f', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
      y: { beginAtZero: true, grid: { color: '#edf0ed' }, ticks: { color: '#65756f' } }
    }
  };
  return <div className="chart-container"><Bar data={data} options={options} /></div>;
}

