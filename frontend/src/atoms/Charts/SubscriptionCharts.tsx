import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartOptions } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Subscription } from '../../services/Subscription';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface SubscriptionChartsProps {
  subscriptions: Subscription[];
}

const SubscriptionCharts: React.FC<SubscriptionChartsProps> = ({ subscriptions }) => {
  const [textColor, setTextColor] = useState('#374151');

  useEffect(() => {
    const updateTextColor = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setTextColor(isDarkMode ? '#f3f4f6' : '#374151');
    };

    updateTextColor();

    const observer = new MutationObserver(updateTextColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const statusCounts = {
    active: subscriptions.filter(d => d.status === 'active').length,
    expired: subscriptions.filter(d => d.status === 'expired').length,
    canceled: subscriptions.filter(d => d.status === 'canceled').length,
    pending: subscriptions.filter(d => d.status === 'pending').length
  };

  const statusData = {
    labels: ['Active', 'Expired', 'Canceled', 'Pending'],
    datasets: [
      {
        label: 'Subscription Status',
        data: [statusCounts.active, statusCounts.expired, statusCounts.canceled, statusCounts.pending],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Active', 'Expired', 'Canceled', 'Pending'],
    datasets: [
      {
        label: 'Subscription Status',
        data: [statusCounts.active, statusCounts.expired, statusCounts.canceled, statusCounts.pending],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Subscription Status Distribution',
        color: textColor,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }
    }
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Subscription Status Count',
        color: textColor,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          precision: 0
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="h-72">
          <Pie 
            data={statusData} 
            options={pieOptions}
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="h-72">
          <Bar 
            data={barData} 
            options={barOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCharts;