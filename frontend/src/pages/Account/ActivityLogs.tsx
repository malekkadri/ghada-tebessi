import { useEffect, useState, useRef } from 'react';
import { activityLogService } from '../../services/api';
import type { ActivityLog } from '../../services/ActivityLog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FaFileExport, 
  FaFilter,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import ReactCountryFlag from "react-country-flag";
import FilterCardLogs from './../../cards/FilterCardLogs';
import { countryCodeMap } from './../../services/countries';
import ExportMenu from '../../cards/ExportMenu'; 
import Pagination from '../../atoms/Pagination/Pagination';

interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
}

interface ActiveFilters {
  activityType: string;
  location: string;
  dateRange: DateRange;
}

const ActivityLogs = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const activitiesPerPage = 20;

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    activityType: 'all',
    location: '',
    dateRange: {
      start: undefined,
      end: undefined
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await activityLogService.getUserActivities({ limit: 1000 });
        const data = response?.data?.data || response?.data || [];
        setActivities(Array.isArray(data) ? data : []);
        setFilteredActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load activity data');
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterButtonRef.current && filterButtonRef.current.contains(event.target as Node)) {
        return;
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyFilters = () => {
    let filtered = [...activities];

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(activity => 
        activity.activityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.device?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilters.activityType !== 'all') {
      filtered = filtered.filter(activity => 
        activity.activityType === activeFilters.activityType
      );
    }

    if (activeFilters.location.trim() !== '') {
      filtered = filtered.filter(activity => 
        activity.location?.toLowerCase().includes(activeFilters.location.toLowerCase())
      );
    }

    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(activity => {
        if (!activity.createdAt) return false;
        
        const activityDate = new Date(activity.createdAt);
        if (isNaN(activityDate.getTime())) return false;

        if (activeFilters.dateRange.start && activityDate < activeFilters.dateRange.start) {
          return false;
        }
    
        if (activeFilters.dateRange.end) {
          const endDate = new Date(activeFilters.dateRange.end);
          endDate.setDate(endDate.getDate() + 1);
          if (activityDate >= endDate) return false;
        }
    
        return true;
      });
    }

    setFilteredActivities(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activities, activeFilters]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      activityType: 'all',
      location: '',
      dateRange: {
        start: undefined,
        end: undefined
      }
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.activityType !== 'all' ||
      activeFilters.location !== '' ||
      activeFilters.dateRange.start !== undefined ||
      activeFilters.dateRange.end !== undefined
    );
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      login_success: 'bg-green-100 text-green-800',
      login_failed: 'bg-red-100 text-red-800',
      logout: 'bg-gray-200 text-gray-800',
      register_success: 'bg-blue-100 text-blue-800',
      login_success_with_google: 'bg-green-100 text-green-800',
      login_failed_with_google: 'bg-red-200 text-red-800',
      password_changed_success: 'bg-purple-100 text-purple-800',
      password_changed_failed: 'bg-red-100 text-red-800',
      password_reset_request: 'bg-yellow-100 text-yellow-800',
      password_reset_success: 'bg-purple-100 text-purple-800',
      email_verification_success: 'bg-blue-100 text-blue-800',
      two_factor_enabled: 'bg-indigo-100 text-indigo-800',
      two_factor_disabled: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-yellow-100 text-yellow-800';
  };

  const parseDeviceInfo = (deviceString: string) => {
    if (!deviceString) return { type: 'Unknown', os: 'Unknown', browser: 'Unknown' };
    
    const match = deviceString.match(/^(.+?) \((.+?), (.+?)\)$/);
    return match 
      ? { type: match[1], os: match[2], browser: match[3] }
      : { type: deviceString, os: 'Unknown', browser: 'Unknown' };
  };

  const getCountryCode = (location: string) => {
    if (!location) return null;
    
    if (location.includes("Localhost")) return null;
    
    const parts = location.split(', ');
    if (parts.length === 0) return null;
    
    const lastPart = parts[parts.length - 1].trim();
    
    if (/^[A-Z]{2}$/.test(lastPart)) {
      return lastPart;
    }
  
    const lowerLastPart = lastPart.toLowerCase();
    if (countryCodeMap[lowerLastPart]) {
      return countryCodeMap[lowerLastPart];
    }
  
    const parenMatch = lastPart.match(/\(([A-Z]{2)\)/);
    if (parenMatch) {
      return parenMatch[1];
    }
  
    if (lastPart.length >= 2) {
      return lastPart.substring(0, 2).toUpperCase();
    }
  
    return null;
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); 
  };

  const exportToCSV = (data: ActivityLog[], fileName: string) => {
    try {
      const headers = ['Type', 'Device', 'OS', 'Browser', 'Location', 'Country', 'IP Address', 'Date'];
      const csvRows = [];
      
      csvRows.push(headers.join(','));
      
      for (const row of data) {
        const deviceInfo = parseDeviceInfo(row.device);
        const countryCode = getCountryCode(row.location || '');
        const values = [
          row.activityType?.replace(/_/g, ' ') || 'Unknown',
          deviceInfo.type,
          deviceInfo.os,
          deviceInfo.browser,
          row.location === "Local, Localhost" ? "Localhost" : row.location || 'Unknown',
          countryCode || 'N/A',
          row.ipAddress || 'N/A',
          row.createdAt ? format(new Date(row.createdAt), 'PPpp', { locale: fr }) : 'N/A'
        ].map(value => {
          const escaped = (`${value}`)
            .replace(/"/g, '""')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
          return `"${escaped}"`;
        });
        
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadFile(blob, `${fileName}.csv`);
      return true;
    } catch (error) {
      console.error('CSV conversion error:', error);
      throw new Error('Failed to generate CSV file');
    }
  };

  const exportToJSON = (data: ActivityLog[], fileName: string) => {
    try {
      const jsonData = data.map(row => {
        const deviceInfo = parseDeviceInfo(row.device);
        const countryCode = getCountryCode(row.location || '');
        return {
          type: row.activityType?.replace(/_/g, ' ') || 'Unknown',
          device: deviceInfo.type,
          os: deviceInfo.os,
          browser: deviceInfo.browser,
          location: row.location === "Local, Localhost" ? "Localhost" : row.location || 'Unknown',
          country: countryCode || 'N/A',
          ipAddress: row.ipAddress || 'N/A',
          date: row.createdAt ? format(new Date(row.createdAt), 'PPpp', { locale: fr }) : 'N/A'
        };
      });

      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      downloadFile(blob, `${fileName}.json`);
      return true;
    } catch (error) {
      console.error('JSON conversion error:', error);
      throw new Error('Failed to generate JSON file');
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting) return;
    
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const currentDate = new Date().toISOString().slice(0, 10);
      const fileName = `activity_logs_${currentDate}`;
      
      if (format === 'csv') {
        exportToCSV(filteredActivities, fileName);
      } else {
        exportToJSON(filteredActivities, fileName);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <div className="text-center py-8">Loading activity logs...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="py-4 px-2 sm:p-0 sm:m-0">
      <div className="w-full mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Activity Logs
              </h3>
              <div className="flex justify-center items-center gap-2">
                <span className="text-primary text-sm sm:text-base">
                  Detailed account activity history
                </span>
              </div>
            </div>
          
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">       
              <div className="relative w-full sm:w-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative" ref={exportButtonRef}>
                  <button 
                    className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ${
                      exporting || filteredActivities.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Export options"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exporting || filteredActivities.length === 0}
                  >
                    <FaFileExport className="text-purple-500 text-sm" />
                  </button>
                  
                  {showExportMenu && (
                    <div ref={exportMenuRef}>
                      <ExportMenu 
                        onExport={handleExport} 
                        exporting={exporting} 
                      />
                    </div>
                  )}
                </div>
      
                <div className="relative" ref={filterButtonRef}>
                  <button 
                    className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 border ${
                      hasActiveFilters() 
                        ? 'border-red-500' 
                        : 'border-purple-500'
                    } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                  >
                    <FaFilter className={`text-sm ${
                      hasActiveFilters() 
                        ? 'text-red-500' 
                        : 'text-purple-500'
                    }`} />
                  </button>
                  {showFilterMenu && (
                    <div 
                      ref={filterMenuRef}
                      className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 z-50 bg-black bg-opacity-50 sm:bg-transparent flex items-center justify-center sm:block"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md sm:w-80 mx-4 sm:mx-0">
                        <FilterCardLogs 
                          activeFilters={activeFilters}
                          onFilterChange={handleFilterChange}
                          onClose={() => setShowFilterMenu(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
      
            {hasActiveFilters() && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
                {activeFilters.activityType !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Type: {activeFilters.activityType.replace(/_/g, ' ')}
                  </span>
                )}
                {activeFilters.location && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Location: {activeFilters.location}
                  </span>
                )}
                {(activeFilters.dateRange.start || activeFilters.dateRange.end) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                    Date: 
                    {activeFilters.dateRange.start && ` ${format(activeFilters.dateRange.start, 'MM/dd/yyyy')}`}
                    {activeFilters.dateRange.end && ` - ${format(activeFilters.dateRange.end, 'MM/dd/yyyy')}`}
                  </span>
                )}
                <button 
                  onClick={resetFilters}
                  className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                >
                  <FaTimes className="mr-1" /> Clear all
                </button>
              </div>
            )}
      
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="overflow-x-auto table-logs">
                <table className="w-full min-w-full sm:min-w-[950px] divide-y divide-gray-200 dark:divide-gray-700 md:overflow-x-auto sm:overflow-x-auto">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Type
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Device
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Location
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        IP Address
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentActivities.length > 0 ? (
                      currentActivities.map((activity) => {
                        const deviceInfo = parseDeviceInfo(activity.device);
                        const location = activity.location === "Local, Localhost" 
                          ? "Localhost" 
                          : activity.location || 'Unknown';
                        const countryCode = getCountryCode(activity.location || '');

                        return (
                          <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityColor(activity.activityType)}`}>
                                {activity.activityType?.replace(/_/g, ' ') || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100">{deviceInfo.type}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {deviceInfo.os} • {deviceInfo.browser}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {countryCode && (
                                  <ReactCountryFlag 
                                    countryCode={countryCode}
                                    svg
                                    style={{
                                      width: '1em',
                                      height: '1em',
                                    }}
                                    title={countryCode}
                                  />
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-300">
                                  {location}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {activity.ipAddress || 'N/A'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {activity.createdAt ? format(new Date(activity.createdAt), 'PPpp', { locale: fr }) : 'N/A'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No activity logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
      
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={paginate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;