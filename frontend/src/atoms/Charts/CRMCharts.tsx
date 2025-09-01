import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartOptions } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface CRMChartsProps {
  weeklyLeadCreation: { week: string; count: number }[];
  conversionRate: number;
  interactionsPerCustomer: { customerId: number; name: string | null; count: number }[];
}

const CRMCharts: React.FC<CRMChartsProps> = ({ weeklyLeadCreation, conversionRate, interactionsPerCustomer }) => {
  const [textColor, setTextColor] = useState('#374151');

  useEffect(() => {
    const updateTextColor = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setTextColor(isDarkMode ? '#f3f4f6' : '#374151');
    };
    updateTextColor();
    const observer = new MutationObserver(updateTextColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const weeklyData = {
    labels: weeklyLeadCreation.map((w) => w.week),
    datasets: [
      {
        label: 'Leads',
        data: weeklyLeadCreation.map((w) => w.count),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const conversionData = {
    labels: ['Converted', 'Remaining'],
    datasets: [
      {
        data: [conversionRate, 1 - conversionRate],
        backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const interactionsData = {
    labels: interactionsPerCustomer.map((i) => i.name || `#${i.customerId}`),
    datasets: [
      {
        label: 'Interactions',
        data: interactionsPerCustomer.map((i) => i.count),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { size: 12 },
        },
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
    },
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor, precision: 0 },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        ticks: { color: textColor },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Weekly Lead Creation</h3>
        <div className="h-72">
          <Bar data={weeklyData} options={barOptions} />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Lead Conversion Rate</h3>
        <div className="h-72">
          <Pie data={conversionData} options={pieOptions} />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow md:col-span-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Interactions per Customer</h3>
        <div className="h-72">
          <Bar data={interactionsData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default CRMCharts;
