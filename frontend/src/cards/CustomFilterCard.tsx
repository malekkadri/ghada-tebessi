import { forwardRef } from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FilterCardProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  createdAtStart: string;
  setCreatedAtStart: (value: string) => void;
  createdAtEnd: string;
  setCreatedAtEnd: (value: string) => void;
  resetFilters: () => void;
  onClose: () => void;
  statusOptions: Array<{ value: string; label: string }>;
  orderBy: string;
  setOrderBy: (value: string) => void;
}

const CustomFilterCard = forwardRef<HTMLDivElement, FilterCardProps>(
  function CustomFilterCard(
    {
      statusFilter,
      setStatusFilter,
      createdAtStart,
      setCreatedAtStart,
      createdAtEnd,
      setCreatedAtEnd,
      resetFilters,
      onClose,
      statusOptions,
      orderBy,
      setOrderBy
    },
    ref
  ) {
    const startDate = createdAtStart ? new Date(createdAtStart) : null;
    const endDate = createdAtEnd ? new Date(createdAtEnd) : null;

    const handleStartDateChange = (date: Date | null) => {
      setCreatedAtStart(date ? date.toISOString().split('T')[0] : '');
    };

    const handleEndDateChange = (date: Date | null) => {
      setCreatedAtEnd(date ? date.toISOString().split('T')[0] : '');
    };

    return (
      <div ref={ref} className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 rounded-none sm:rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">Filters</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
            aria-label="Close filters"
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
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                  className="dark:bg-gray-800 dark:text-gray-300"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

                    <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order By
            </label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="asc" className="dark:bg-gray-800 dark:text-gray-300">
                Ascending
              </option>
              <option value="desc" className="dark:bg-gray-800 dark:text-gray-300">
                Descending
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Creation Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate || new Date()}
                  placeholderText="Start date"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  popperPlacement="bottom-start"
                  calendarClassName="responsive-calendar"
                />
                <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  placeholderText="End date"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  popperPlacement="bottom-end"
                  calendarClassName="responsive-calendar"
                />
                <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <button
            onClick={resetFilters}
            className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md text-sm font-medium transition-colors mt-2"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    );
  }
);

export default CustomFilterCard;