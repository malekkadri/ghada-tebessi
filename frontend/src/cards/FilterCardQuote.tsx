import { forwardRef } from 'react';
import { FaTimes } from 'react-icons/fa';

interface ActiveFiltersQuote {
  service: string;
  createdAtStart: string;
  createdAtEnd: string;
}

interface FilterMenuQuoteProps {
  activeFilters: ActiveFiltersQuote;
  onFilterChange: (filterType: keyof ActiveFiltersQuote, value: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const FilterMenuQuote = forwardRef<HTMLDivElement, FilterMenuQuoteProps>(
  ({ activeFilters, onFilterChange, onReset, onClose }, ref) => {
    return (
      <div 
        ref={ref}
        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700"
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Filter Quotes</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FaTimes />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service
              </label>
              <select
                value={activeFilters.service}
                onChange={e => onFilterChange('service', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Services</option>
                <option value="Digital business cards">Digital Business Cards</option>
                <option value="analytics & Tracking">Analytics & Tracking</option>
                <option value="custom design">Custom Design</option>
                <option value="entreprise solutions">Enterprise Solutions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created At (Between)
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={activeFilters.createdAtStart}
                  onChange={e => onFilterChange('createdAtStart', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={activeFilters.createdAtEnd}
                  onChange={e => onFilterChange('createdAtEnd', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={onReset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default FilterMenuQuote;
