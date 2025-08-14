import React, { useEffect, useState } from 'react';
import { VCardWithUser } from '../../services/api';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  ChartOptions
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface VCardsChartsProps {
  vcards: VCardWithUser[];
}

const VCardsCharts: React.FC<VCardsChartsProps> = ({ vcards }) => {
  const [textColor, setTextColor] = useState('#374151'); // Default to light mode color

  // Fonction pour détecter le changement de mode
  useEffect(() => {
    const updateTextColor = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setTextColor(isDarkMode ? '#f3f4f6' : '#374151');
    };

    // Initial detection
    updateTextColor();

    // Observer for theme changes
    const observer = new MutationObserver(updateTextColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  if (!vcards || vcards.length === 0) {
    return (
      <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          VCard Analytics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No data available for charts
        </p>
      </div>
    );
  }

  const activeCount = vcards.filter(v => v.is_active).length;
  const inactiveCount = vcards.filter(v => !v.is_active).length;

  const statusData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [activeCount, inactiveCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const topVCards = [...vcards]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const viewsData = {
    labels: topVCards.map(v => v.name || `VCard ${v.id.slice(0, 6)}`),
    datasets: [
      {
        label: 'Views',
        data: topVCards.map(v => v.views || 0),
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
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Status Distribution',
        color: textColor,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        },
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }
    },
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
        text: 'Top 10 Most Viewed VCards',
        color: textColor,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Views: ${context.raw}`;
          }
        },
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
          color: textColor,
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="mt-12 charts-mobile-reduce-right">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        VCard Analytics
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="h-80">
            <Pie data={statusData} options={pieOptions} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="h-80">
            <Bar data={viewsData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VCardsCharts;