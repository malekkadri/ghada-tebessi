import React from 'react';

interface ActiveFiltersQuoteProps {
  activeFilters: {
    service: string;
    createdAtStart: string;
    createdAtEnd: string;
  };
  resetFilters: () => void;
}

const ActiveFiltersQuote: React.FC<ActiveFiltersQuoteProps> = ({ activeFilters, resetFilters }) => {
  const hasFilters =
    activeFilters.service !== 'all' ||
    activeFilters.createdAtStart !== '' ||
    activeFilters.createdAtEnd !== '';
  if (!hasFilters) return null;

  return (
    <div className="mb-4 flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
      {activeFilters.service !== 'all' && (
        <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Service: {activeFilters.service}
        </span>
      )}
      {activeFilters.createdAtStart && activeFilters.createdAtEnd && (
        <span className="badge bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
          Created At: {activeFilters.createdAtStart} → {activeFilters.createdAtEnd}
        </span>
      )}
      {activeFilters.createdAtStart && !activeFilters.createdAtEnd && (
        <span className="badge bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
          Created At: from {activeFilters.createdAtStart}
        </span>
      )}
      {!activeFilters.createdAtStart && activeFilters.createdAtEnd && (
        <span className="badge bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
          Created At: until {activeFilters.createdAtEnd}
        </span>
      )}
      <button
        onClick={resetFilters}
        className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFiltersQuote;
