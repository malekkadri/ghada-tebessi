import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { countryListForFilter } from './../services/countries';
import ReactCountryFlag from 'react-country-flag';
import Select from 'react-select';
import { CSSObject } from '@emotion/react';

interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
}

interface ActiveFilters {
  activityType: string;
  location: string;
  dateRange: DateRange;
}

interface FilterCardLogsProps {
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: any) => void;
  onClose: () => void;
  triggerElement?: HTMLElement | null;
}

const FilterCardLogs: React.FC<FilterCardLogsProps> = ({
  activeFilters,
  onFilterChange,
  onClose,
}) => {
  const handleDateChange = (date: Date | null, type: 'start' | 'end') => {
    onFilterChange('dateRange', {
      ...activeFilters.dateRange,
      [type]: date || undefined
    });
  };

  const locationOptions = [
    { value: '', label: 'All Locations', name: 'All Locations' },
    ...countryListForFilter.map(country => ({
      value: country.name,
      label: country.name,
      code: country.code,
      name: country.name
    }))
  ];

  const selectedLocation = locationOptions.find(
    option => option.value === activeFilters.location
  ) || locationOptions[0];

  const customStyles = {
    control: (provided: CSSObject) => ({
      ...provided,
      borderColor: '#d1d5db',
      borderRadius: '0.375rem',
      minHeight: '42px',
      backgroundColor: 'white',
      '&:hover': {
        borderColor: '#d1d5db'
      },
      '&:focus-within': {
        borderColor: '#8b5cf6',
        boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.5)'
      }
    }),
    option: (provided: CSSObject, state: { isSelected: boolean }) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: state.isSelected ? '#e9d5ff' : 'white',
      color: 'black',
      '&:hover': {
        backgroundColor: '#f3e8ff'
      }
    }),
    singleValue: (provided: CSSObject) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center'
    }),
    menu: (provided: CSSObject) => ({
      ...provided,
      zIndex: 20,
      borderRadius: '0.375rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided: CSSObject) => ({
      ...provided,
      color: '#9ca3af',
      '&:hover': {
        color: '#6b7280'
      }
    })
  };

  const formatOptionLabel = ({ value, label, code }: any) => (
    <div className="flex items-center">
      {value && code && code !== 'Localhost' && (
        <ReactCountryFlag 
          countryCode={code}
          svg
          style={{
            width: '1em',
            height: '1em',
            marginRight: '0.5em'
          }}
          title={code}
        />
      )}
      <span>{label}</span>
    </div>
  );

  return (
<div 
  className="w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4"
  style={{ 
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto'
  }}
>
      <div className="flex justify-between items-center mb-2 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Filters</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Activity Type
          </label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={activeFilters.activityType}
            onChange={(e) => onFilterChange('activityType', e.target.value)}
          >
          <option value="all">All Activities</option>
            <option value="login_success">Login Success</option>
            <option value="login_failed">Login Failed</option>
            <option value="logout">Logout</option>
            <option value="register_success">Register Success</option>
            <option value="login_success_with_google">Login With Google Success</option>
            <option value="login_failed_with_google">Login With Google Failed</option>
            <option value="password_changed_success">Password Changed Success</option>
            <option value="password_changed_failed">Password Changed Failed</option>
            <option value="password_reset_request">Password Reset Request</option>
            <option value="password_reset_success">Password Reset Success</option>
            <option value="email_verification_success">Email Verification Success</option>
            <option value="two_factor_enabled">Two Factor Enabled</option>
            <option value="two_factor_disabled">Two Factor Disabled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <Select
            options={locationOptions}
            value={selectedLocation}
            onChange={(selectedOption: any) => 
              onFilterChange('location', selectedOption?.value || '')
            }
            styles={customStyles}
            isSearchable
            formatOptionLabel={formatOptionLabel}
            className="react-select-container border-gray-300 dark:border-gray-600"
            classNamePrefix="react-select"
            components={{
              IndicatorSeparator: () => null
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <DatePicker
                selected={activeFilters.dateRange.start}
                onChange={(date) => handleDateChange(date, 'start')}
                selectsStart
                startDate={activeFilters.dateRange.start}
                endDate={activeFilters.dateRange.end}
                placeholderText="Start date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <div className="relative">
              <DatePicker
                selected={activeFilters.dateRange.end}
                onChange={(date) => handleDateChange(date, 'end')}
                selectsEnd
                startDate={activeFilters.dateRange.start}
                endDate={activeFilters.dateRange.end}
                minDate={activeFilters.dateRange.start}
                placeholderText="End date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterCardLogs;