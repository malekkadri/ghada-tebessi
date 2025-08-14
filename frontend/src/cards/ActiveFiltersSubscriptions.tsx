import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ActiveFilters {
  status: string;
  search: string;
}

interface ActiveFiltersSubscriptionsProps {
  activeFilters: ActiveFilters;
  resetFilters: () => void;
}

const ActiveFiltersSubscriptions: React.FC<ActiveFiltersSubscriptionsProps> = ({ 
  activeFilters, 
  resetFilters 
}) => {
  const statusLabels: Record<string, string> = {
    active: 'Active',
    expired: 'Expired',
    canceled: 'Canceled',
    pending: 'Pending'
  };

  return (
    <div className="mb-4 flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
      
      {activeFilters.status !== 'all' && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Status: {statusLabels[activeFilters.status] || activeFilters.status}
        </span>
      )}
      
      {activeFilters.search && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          Search: "{activeFilters.search}"
        </span>
      )}
      
      <button
        onClick={resetFilters}
        className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full"
      >
        <FaTimes className="mr-1" /> Clear all
      </button>
    </div>
  );
};

export default ActiveFiltersSubscriptions;