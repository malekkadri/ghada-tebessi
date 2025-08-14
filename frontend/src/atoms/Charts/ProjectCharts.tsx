import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartOptions } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Project } from '../../services/Project';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ProjectChartsProps {
  projects: Project[];
}

const ProjectCharts: React.FC<ProjectChartsProps> = ({ projects }) => {
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

  const statusData = {
    labels: ['Active', 'Archived', 'Pending'],
    datasets: [
      {
        label: 'Project Status',
        data: [
          projects.filter(p => p.status === 'active').length,
          projects.filter(p => p.status === 'archived').length,
          projects.filter(p => p.status === 'pending').length,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const blockedData = {
    labels: ['Blocked', 'Allowed'],
    datasets: [
      {
        label: 'Blocked Status',
        data: [
          projects.filter(p => p.is_blocked).length,
          projects.filter(p => !p.is_blocked).length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
        ],
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
        text: 'Project Status Distribution',
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
        text: 'Project Blocked Status',
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
            data={blockedData} 
            options={barOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectCharts;