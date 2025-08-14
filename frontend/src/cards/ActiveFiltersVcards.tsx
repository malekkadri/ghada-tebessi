import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ActiveFiltersProps {
  activeFilters: {
    status: string;
    search: string;
  };
  resetFilters: () => void;
  filterLabels: Record<string, string>;
}

const ActiveFiltersVcards: React.FC<ActiveFiltersProps> = ({ 
  activeFilters, 
  resetFilters,
  filterLabels 
}) => {
  const getFilterLabel = (key: string, value: string) => {
    const label = filterLabels[key] || key;
    
    switch (key) {
      case 'status':
        return value === 'active' 
          ? `${label}: Active` 
          : `${label}: Inactive`;
      case 'search':
        return `${label}: "${value}"`;
      default:
        return `${label}: ${value}`;
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
        
        {Object.entries(activeFilters)
          .filter(([_, value]) => value !== 'all' && value !== '')
          .map(([key, value]) => (
            <div 
              key={key} 
              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
            >
              <span>{getFilterLabel(key, value)}</span>
              <button 
                onClick={resetFilters}
                className="ml-2 text-purple-500 hover:text-purple-700"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        
        <button 
          onClick={resetFilters}
          className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
};

export default ActiveFiltersVcards;