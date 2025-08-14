import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaCalendarTimes, FaMoneyBillWave } from 'react-icons/fa';

interface Stats {
  total: number;
  active: number;
  expired: number;
  canceled: number;
  pending: number;
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
    <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 h-full mobile-stat-item">
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

const StatsCardsSubscriptions: React.FC<StatsCardsProps> = ({ stats }) => (
  <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
    <StatCard 
      icon={<FaMoneyBillWave className="w-5 h-5" />}
      title="Total Subscriptions"
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
      icon={<FaCalendarTimes className="w-5 h-5" />}
      title="Expired"
      value={stats.expired}
      color="yellow"
    />
    <StatCard 
      icon={<FaTimesCircle className="w-5 h-5" />}
      title="Canceled"
      value={stats.canceled}
      color="red"
    />
    <StatCard 
      icon={<FaHourglassHalf className="w-5 h-5" />}
      title="Pending"
      value={stats.pending}
      color="blue"
    />
  </div>
);

export default StatsCardsSubscriptions;