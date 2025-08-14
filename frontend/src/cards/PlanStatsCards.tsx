import React, { useEffect, useState } from 'react';
import { 
  FaClipboardList, 
  FaToggleOn, 
  FaGift, 
  FaStar 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanStats {
  total: number;
  active: number;
  free: number;
  default: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setDisplayValue(value);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  const colorClasses: Record<string, { text: string; bg: string }> = {
    orange: {
      text: 'text-orange-500 dark:text-orange-100',
      bg: 'bg-orange-100 dark:bg-orange-500'
    },
    green: {
      text: 'text-green-500 dark:text-green-100',
      bg: 'bg-green-100 dark:bg-green-500'
    },
    blue: {
      text: 'text-blue-500 dark:text-blue-100',
      bg: 'bg-blue-100 dark:bg-blue-500'
    },
    purple: {
      text: 'text-purple-500 dark:text-purple-100',
      bg: 'bg-purple-100 dark:bg-purple-500'
    },
    amber: {
      text: 'text-amber-500 dark:text-amber-100',
      bg: 'bg-amber-100 dark:bg-amber-500'
    }
  };

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 h-full mobile-stat-item">
      <div 
        className={`p-3 mr-4 rounded-full ${colorClasses[color].text} ${colorClasses[color].bg}`}
      >
        {icon}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={displayValue}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-gray-700 dark:text-gray-200"
          >
            {displayValue}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

const PlanStatsCards: React.FC<{ stats: PlanStats }> = ({ stats }) => (
  <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard 
      icon={<FaClipboardList className="w-5 h-5" />}
      title="Total Plans"
      value={stats.total}
      color="orange"
    />
    
    <StatCard 
      icon={<FaToggleOn className="w-5 h-5" />}
      title="Active Plans"
      value={stats.active}
      color="green"
    />
    
    <StatCard 
      icon={<FaGift className="w-5 h-5" />}
      title="Free Plans"
      value={stats.free}
      color="blue"
    />
    
    <StatCard 
      icon={<FaStar className="w-5 h-5" />}
      title="Default Plans"
      value={stats.default}
      color="purple"
    />
  </div>
);

export default PlanStatsCards;