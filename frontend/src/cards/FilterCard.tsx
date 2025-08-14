import React from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
}

interface ActiveFilters {
  status: string;
  backgroundType: string;
  searchEngine: string;
  branding: string;
  dateRange: DateRange;
}

interface FilterCardProps {
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: any) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

const FilterCard: React.FC<FilterCardProps> = ({
  activeFilters,
  onFilterChange,
  onResetFilters,
  onClose
}) => {
  const handleDateChange = (date: Date | null, type: 'start' | 'end') => {
    onFilterChange('dateRange', {
      ...activeFilters.dateRange,
      [type]: date || undefined
    });
  };

  return (
    <div className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 rounded-none sm:rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Filters</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      
      <div className="space-y-4 pb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={activeFilters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Background Type
          </label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={activeFilters.backgroundType}
            onChange={(e) => onFilterChange('backgroundType', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="color">Color</option>
            <option value="custom-image">Custom Image</option>
            <option value="gradient">Gradient</option>
            <option value="gradient-preset">Gradient Preset</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Engine Visibility
          </label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={activeFilters.searchEngine}
            onChange={(e) => onFilterChange('searchEngine', e.target.value)}
          >
            <option value="all">All</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Branding
          </label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={activeFilters.branding}
            onChange={(e) => onFilterChange('branding', e.target.value)}
          >
            <option value="all">All</option>
            <option value="branded">With Branding</option>
            <option value="unbranded">Without Branding</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Creation Date Range
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <DatePicker
                selected={activeFilters.dateRange.start}
                onChange={(date: Date | null) => handleDateChange(date, 'start')}
                selectsStart
                startDate={activeFilters.dateRange.start}
                endDate={activeFilters.dateRange.end}
                maxDate={activeFilters.dateRange.end || new Date()}
                placeholderText="Start date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                popperPlacement="bottom-start"
                calendarClassName="responsive-calendar"
              />
              <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <div className="relative">
              <DatePicker
                selected={activeFilters.dateRange.end}
                onChange={(date: Date | null) => handleDateChange(date, 'end')}
                selectsEnd
                startDate={activeFilters.dateRange.start}
                endDate={activeFilters.dateRange.end}
                minDate={activeFilters.dateRange.start}
                placeholderText="End date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                popperPlacement="bottom-end"
                calendarClassName="responsive-calendar"
              />
              <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <button
          onClick={onResetFilters}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md text-sm font-medium transition-colors mt-2"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterCard;