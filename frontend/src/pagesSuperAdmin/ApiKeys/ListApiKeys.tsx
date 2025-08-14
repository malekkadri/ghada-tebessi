import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ApiKeyService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import StatsCardsApiKeys from '../../cards/StatsCardsApiKeys';
import FilterMenuApiKeys from '../../cards/FilterMenuApiKeys';
import ExportMenu from '../../cards/ExportMenu';
import ApiKeyTable from '../../atoms/Tables/ApiKeysTable';
import ActiveFiltersApiKeys from '../../cards/ActiveFiltersApiKeys';
import ApiKeyCharts from '../../atoms/Charts/ApiKeyCharts';
import { ApiKey } from '../../services/ApiKey';
import Pagination from '../../atoms/Pagination/Pagination';

export interface ActiveFilters {
  status: string;
  search: string;
}

const ListApiKeys: React.FC = () => {
  const [allApiKeys, setAllApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    disabled: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allApiKeys.length > 0) {
      const total = allApiKeys.length;
      const active = allApiKeys.filter(key => key.isActive).length;
      const disabled = total - active;
      
      setStats({ total, active, disabled });
    } else {
      setStats({ total: 0, active: 0, disabled: 0 });
    }
  }, [allApiKeys]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && exportMenuRef.current && 
          !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }

      if (showFilterMenu && 
          filterMenuRef.current && 
          !filterMenuRef.current.contains(event.target as Node) &&
          filterButtonRef.current && 
          !filterButtonRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu, showExportMenu]);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setLoading(true);
        const response = await ApiKeyService.listAllApiKeys();
        if (response.success && Array.isArray(response.data)) {
          setAllApiKeys(response.data);
        } else {
          setAllApiKeys([]);
          toast.error('Received invalid API key data format');
        }
      } catch (error) {
        console.error('Failed to fetch API keys', error);
        toast.error('Failed to load API keys. Please try again.');
        setAllApiKeys([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  const filteredApiKeys = useMemo(() => {
    if (!allApiKeys || allApiKeys.length === 0) return [];

    let result = [...allApiKeys];
    
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter(key => 
        (key.Users?.name?.toLowerCase().includes(searchTerm)) || 
        (key.Users?.email?.toLowerCase().includes(searchTerm)) || 
        (key.name?.toLowerCase().includes(searchTerm))
      );
    }
    
    if (activeFilters.status !== 'all') {
      if (activeFilters.status === 'active') {
        result = result.filter(key => key.isActive);
      } else if (activeFilters.status === 'disabled') {
        result = result.filter(key => !key.isActive);
      }
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return result;
  }, [activeFilters, allApiKeys]);

  const totalPages = Math.ceil((filteredApiKeys?.length || 0) / itemsPerPage);
  const currentPageApiKeys = useMemo(() => {
    if (!filteredApiKeys || filteredApiKeys.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApiKeys.slice(startIndex, endIndex);
  }, [filteredApiKeys, currentPage, itemsPerPage]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      search: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.status !== 'all' ||
      activeFilters.search !== ''
    );
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatApiKeyData = (key: ApiKey) => {
    return {
      ID: key.id,
      Name: key.name || 'N/A',
      'User Name': key.Users?.name || 'N/A',
      'User Email': key.Users?.email || 'N/A',
      Prefix: key.prefix || 'N/A',
      Scopes: (Array.isArray(key.scopes) ? key.scopes.join(', ') : 'N/A'),
      'Created At': key.created_at ? new Date(key.created_at).toLocaleString() : 'N/A',
      Status: key.isActive ? 'Active' : 'Disabled'
    };
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting) return;
    
    if (!filteredApiKeys || filteredApiKeys.length === 0) {
      toast.warning('No data to export');
      return;
    }

    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `apikeys_export_${date}`;
      
      const formattedData = filteredApiKeys.map(formatApiKeyData);
      
      if (format === 'csv') {
        exportToCsv(formattedData, filename);
      } else {
        exportToJson(formattedData, filename);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const exportToCsv = (data: any[], filename: string) => {
    try {
      if (!data || data.length === 0) {
        toast.warning('No data to export');
        return;
      }
      
      const header = Object.keys(data[0]).join(',');
      
      const rows = data.map(row => 
        Object.values(row).map(value => {
          const stringValue = typeof value === 'string' ? value : String(value);
          const escapedValue = stringValue.replace(/"/g, '""');
          
          if (/[,"\n]/.test(escapedValue)) {
            return `"${escapedValue}"`;
          }
          return escapedValue;
        }).join(',')
      );
      
      const csvContent = [header, ...rows].join('\r\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('CSV export completed successfully');
    } catch (error: any) {
      console.error('CSV export error:', error);
      toast.error(`CSV export failed: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const exportToJson = (data: any[], filename: string) => {
    try {
      if (!data || data.length === 0) {
        toast.warning('No data to export');
        return;
      }
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('JSON export completed successfully');
    } catch (error: any) {
      console.error('JSON export error:', error);
      toast.error(`JSON export failed: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const handleToggleApiKey = async (apiKeyId: number) => {
    try {
      const apiKeyToUpdate = allApiKeys.find(key => key.id === apiKeyId);
      if (!apiKeyToUpdate) {
        toast.error('API key not found');
        return;
      }
      const wasActive = apiKeyToUpdate.isActive;

      await ApiKeyService.toggleApiKeyStatus(apiKeyId);
      
      setAllApiKeys(prev => 
        prev.map(key => 
          key.id === apiKeyId ? { ...key, isActive: !wasActive } : key
        )
      );
    } catch (error) {
      console.error('Failed to toggle API key status', error);
      throw error;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto mobile-no-left-padding">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">API Keys</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            Manage all API keys
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by user, name..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              value={activeFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="relative">
              <button
                ref={filterButtonRef}
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border ${
                  hasActiveFilters()
                    ? 'border-red-500'
                    : 'border-purple-500'
                } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter className={
                  hasActiveFilters()
                    ? 'text-red-500'
                    : 'text-purple-500'
                } />
              </button>

              {showFilterMenu && (
                <FilterMenuApiKeys 
                  ref={filterMenuRef}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onReset={resetFilters}
                  onClose={() => setShowFilterMenu(false)}
                />
              )}
            </div>

            <div className="relative" ref={exportMenuRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || !filteredApiKeys || filteredApiKeys.length === 0}
              >
                <FaFileExport className={`text-purple-500 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
              </button>

              {showExportMenu && (
                <ExportMenu 
                  onExport={handleExport}
                  exporting={exporting}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <StatsCardsApiKeys stats={stats} />
      
      {hasActiveFilters() && (
        <ActiveFiltersApiKeys 
          activeFilters={activeFilters} 
          resetFilters={resetFilters} 
        />
      )}

      <ApiKeyTable
        apiKeys={currentPageApiKeys}
        hasActiveFilters={hasActiveFilters()}
        onToggleApiKey={handleToggleApiKey}
      />

      <div className="mt-6 sm:mt-8">
        <ApiKeyCharts apiKeys={allApiKeys} />
      </div>

      {filteredApiKeys && filteredApiKeys.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        </div>
      )}
    </div>
  );
};

export default ListApiKeys;