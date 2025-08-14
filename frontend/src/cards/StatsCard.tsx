import React, { useEffect, useState } from 'react';
import { FaUsers, FaUserCheck, FaCheckCircle, FaUserTie, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Stats {
  total: number;
  active: number;
  verified: number;
  admins: number;
  superAdmins: number;
}

const StatCard: React.FC<{ 
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}> = ({ icon, title, value, color }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setDisplayValue(value);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 h-full mobile-stat-item">
      <div className={`p-3 mr-4 text-${color}-500 bg-${color}-100 rounded-full dark:text-${color}-100 dark:bg-${color}-500`}>
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

const StatsCards: React.FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5">
    <StatCard 
      icon={<FaUsers className="w-5 h-5" />}
      title="Total Users"
      value={stats.total}
      color="orange"
    />
    
    <StatCard 
      icon={<FaUserCheck className="w-5 h-5" />}
      title="Active Users"
      value={stats.active}
      color="green"
    />
    
    <StatCard 
      icon={<FaCheckCircle className="w-5 h-5" />}
      title="Verified Users"
      value={stats.verified}
      color="blue"
    />
    
    <StatCard 
      icon={<FaUserTie className="w-5 h-5" />}
      title="Admin Users"
      value={stats.admins}
      color="purple"
    />
    
    <StatCard 
      icon={<FaCrown className="w-5 h-5" />}
      title="Super Admins"
      value={stats.superAdmins}
      color="amber"
    />
  </div>
);

export default StatsCards;