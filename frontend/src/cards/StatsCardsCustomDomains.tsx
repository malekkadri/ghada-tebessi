import React from 'react';
import { FaGlobe, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle, FaToggleOff } from 'react-icons/fa';

interface Stats {
  total: number;
  active: number;
  pending: number;
  failed: number;
  blocked: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const colorMap = {
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-500',
    darkBg: 'dark:bg-orange-500',
    darkText: 'dark:text-orange-100'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-500',
    darkBg: 'dark:bg-green-500',
    darkText: 'dark:text-green-100'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-500',
    darkBg: 'dark:bg-yellow-500',
    darkText: 'dark:text-yellow-100'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-500',
    darkBg: 'dark:bg-red-500',
    darkText: 'dark:text-red-100'
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-500',
    darkBg: 'dark:bg-blue-500',
    darkText: 'dark:text-blue-100'
  }
};

const StatCard: React.FC<{ 
  icon: React.ReactNode;
  title: string;
  value: number;
  color: keyof typeof colorMap;
}> = ({ icon, title, value, color }) => {
  const colors = colorMap[color];

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 h-full">
      <div className={`p-3 mr-4 rounded-full ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
        {icon}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          {value}
        </p>
      </div>
    </div>
  );
};

const StatsCardsCustomDomains: React.FC<StatsCardsProps> = ({ stats }) => (
  <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-5">
    <StatCard 
      icon={<FaGlobe className="w-5 h-5" />}
      title="Total Domains"
      value={stats.total}
      color="orange"
    />
    <StatCard 
      icon={<FaCheckCircle className="w-5 h-5" />}
      title="Active"
      value={stats.active}
      color="green"
    />
    <StatCard 
      icon={<FaHourglassHalf className="w-5 h-5" />}
      title="Pending"
      value={stats.pending}
      color="yellow"
    />
    <StatCard 
      icon={<FaExclamationTriangle className="w-5 h-5" />}
      title="Failed"
      value={stats.failed}
      color="red"
    />
    <StatCard 
      icon={<FaToggleOff className="w-5 h-5" />}
      title="Blocked"
      value={stats.blocked}
      color="blue"
    />
  </div>
);

export default StatsCardsCustomDomains;