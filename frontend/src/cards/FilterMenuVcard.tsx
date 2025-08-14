import { forwardRef } from 'react';

export interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface FilterMenuProps {
  activeFilters: Record<string, string>;
  onFilterChange: (filterType: string, value: string) => void;
  onReset: () => void;
  onClose: () => void;
  filterOptions: FilterOption[];
}

const FilterMenu = forwardRef<HTMLDivElement, FilterMenuProps>((props, ref) => {
  const { activeFilters, onFilterChange, onReset, onClose, filterOptions } = props;

  return (
    <div 
      ref={ref} 
      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {filterOptions.map(option => (
          <div key={option.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {option.label}
            </label>
            <select
              value={activeFilters[option.key] || 'all'}
              onChange={(e) => onFilterChange(option.key, e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {option.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
});

export default FilterMenu;