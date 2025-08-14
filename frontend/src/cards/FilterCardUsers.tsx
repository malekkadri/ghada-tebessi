import { forwardRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ActiveFilters } from '../pagesSuperAdmin/Users/ListUsers'; 

interface FilterMenuProps {
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: string) => void;
  onReset: () => void;
  onClose: () => void;
}

const FilterMenu = forwardRef<HTMLDivElement, FilterMenuProps>(({ 
  activeFilters, 
  onFilterChange, 
  onReset,
  onClose
}, ref) => (
  <div 
    ref={ref}
    className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 rounded-none sm:rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto"
    onClick={(e) => e.stopPropagation()} 
  >
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
          onClick={(e) => e.stopPropagation()} 
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Role
        </label>
        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={activeFilters.role}
          onChange={(e) => onFilterChange('role', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superAdmin">Super Admin</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Verified
        </label>
        <select
          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={activeFilters.verified}
          onChange={(e) => onFilterChange('verified', e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="all">All</option>
          <option value="verified">Verified</option>
          <option value="not-verified">Not Verified</option>
        </select>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReset();
          onClose();
        }}
        className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md text-sm font-medium transition-colors mt-2"
      >
        Reset All Filters
      </button>
    </div>
  </div>
));

FilterMenu.displayName = 'FilterMenu';

export default FilterMenu;