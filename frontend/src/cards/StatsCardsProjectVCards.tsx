import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserCheck, FaUserSlash, FaEye, FaBan } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Stats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  totalViews: number;
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
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-500',
    darkBg: 'dark:bg-purple-500',
    darkText: 'dark:text-purple-100'
  }
};

const VCardStatCard: React.FC<{ 
  icon: React.ReactNode;
  title: string;
  value: number;
  color: keyof typeof colorMap;
}> = ({ icon, title, value, color }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const colors = colorMap[color];

  useEffect(() => {
    if (value !== prevValue) {
      setDisplayValue(value);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 h-full">
      <div className={`p-3 mr-4 rounded-full ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
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

const StatsCardsProjectVCards: React.FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid gap-6 mb-8 md:grid-cols-3 xl:grid-cols-5">
    <VCardStatCard 
      icon={<FaUsers className="w-5 h-5" />}
      title="Total VCards"
      value={stats.total}
      color="orange"
    />
    <VCardStatCard 
      icon={<FaUserCheck className="w-5 h-5" />}
      title="Active"
      value={stats.active}
      color="green"
    />
    <VCardStatCard 
      icon={<FaUserSlash className="w-5 h-5" />}
      title="Inactive"
      value={stats.inactive}
      color="red"
    />
    <VCardStatCard 
      icon={<FaEye className="w-5 h-5" />}
      title="Total Views"
      value={stats.totalViews}
      color="blue"
    />
    <VCardStatCard 
      icon={<FaBan className="w-5 h-5" />}
      title="Blocked"
      value={stats.blocked}
      color="purple"
    />
  </div>
);

export default StatsCardsProjectVCards;