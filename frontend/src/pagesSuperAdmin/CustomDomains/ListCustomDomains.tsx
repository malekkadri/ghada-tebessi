import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { customDomainService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import StatsCardsCustomDomains from '../../cards/StatsCardsCustomDomains';
import FilterMenuCustomDomains from '../../cards/FilterMenuCustomDomains';
import ExportMenu from '../../cards/ExportMenu';
import CustomDomainTable from '../../atoms/Tables/CustomDomainTable';
import Pagination from '../../atoms/Pagination/Pagination';
import ActiveFiltersCustomDomains from '../../cards/ActiveFiltersCustomDomains';
import CustomDomainCharts from '../../atoms/Charts/CustomDomainCharts';
import { CustomDomain } from '../../services/CustomDomain';
import { useAuth } from '../../context/AuthContext';

export interface ActiveFilters {
  status: string;
  search: string;
}

const ListCustomDomains: React.FC = () => {
  const [allDomains, setAllDomains] = useState<CustomDomain[]>([]);
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
    pending: 0,
    failed: 0,
    blocked: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (allDomains.length > 0) {
      const total = allDomains.length;
      const active = allDomains.filter(domain => domain.status === 'active').length;
      const pending = allDomains.filter(domain => domain.status === 'pending').length;
      const failed = allDomains.filter(domain => domain.status === 'failed').length;
      const blocked = allDomains.filter(domain => domain.status === 'blocked').length;
      
      setStats({ total, active, pending, failed, blocked });
    } else {
      setStats({ total: 0, active: 0, pending: 0, failed: 0, blocked: 0 });
    }
  }, [allDomains]);

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
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const response = await customDomainService.getDomains();
        
        if (response.success && Array.isArray(response.data)) {
          setAllDomains(response.data);
        } else {
          setAllDomains([]);
          toast.error('Received invalid domain data format');
        }
      } catch (error) {
        console.error('Failed to fetch custom domains', error);
        toast.error('Failed to load domains. Please try again.');
        setAllDomains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const filteredDomains = useMemo(() => {
    if (!allDomains || allDomains.length === 0) return [];

    let result = [...allDomains];
    
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter(domain => 
        domain.domain.toLowerCase().includes(searchTerm) || 
        (domain.vcard?.name?.toLowerCase().includes(searchTerm) || 
        (domain.vcard?.user?.name?.toLowerCase().includes(searchTerm) || 
        (domain.vcard?.user?.email?.toLowerCase().includes(searchTerm))
      )));
    }
    
    if (activeFilters.status !== 'all') {
      result = result.filter(domain => domain.status === activeFilters.status);
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return result;
  }, [activeFilters, allDomains]);

  const currentPageDomains = useMemo(() => {
    if (!filteredDomains || filteredDomains.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDomains.slice(startIndex, endIndex);
  }, [filteredDomains, currentPage, itemsPerPage]);

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

  const totalPages = Math.ceil((filteredDomains?.length || 0) / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleDomainStatus = async (domainId: number, newStatus: 'pending' | 'active' | 'failed' | 'blocked') => {
    let originalDomains: CustomDomain[] = [];
    
    try {
      originalDomains = [...allDomains];
      
      setAllDomains(prevDomains =>
        prevDomains.map(domain =>
          domain.id === domainId ? { ...domain, status: newStatus } : domain
        )
      );

      await customDomainService.toggleStatus(domainId, newStatus);
      
      toast.success(`Domain status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update domain status', error);
      toast.error('Failed to update domain status');
      
      setAllDomains(originalDomains);
    }
  };

  const formatDomainData = (domain: CustomDomain) => ({
    ID: domain.id,
    Domain: domain.domain,
    Status: domain.status.charAt(0).toUpperCase() + domain.status.slice(1),
    'Created At': new Date(domain.created_at).toLocaleString(),
    'VCard Name': domain.vcard?.name || 'N/A',
    'User Name': domain.vcard?.user?.name || 'N/A',
    'User Email': domain.vcard?.user?.email || 'N/A'
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredDomains || filteredDomains.length === 0) return;
    
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `custom_domains_export_${date}`;
      
      if (format === 'csv') {
        exportToCsv(filteredDomains.map(formatDomainData), filename);
      } else {
        exportToJson(filteredDomains.map(formatDomainData), filename);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportToCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV export completed successfully');
  };

  const exportToJson = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('JSON export completed successfully');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 pr-4 pb-4 pt-4 pl-2 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto mobile-no-left-padding">
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Custom Domains</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            Manage all custom domains
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by domain, vCard or user..."
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
                <FilterMenuCustomDomains 
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
                disabled={exporting || !filteredDomains || filteredDomains.length === 0}
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

      <StatsCardsCustomDomains stats={stats} />
      
      {hasActiveFilters() && (
        <ActiveFiltersCustomDomains 
          activeFilters={activeFilters} 
          resetFilters={resetFilters} 
        />
      )}

      <CustomDomainTable
        domains={currentPageDomains}
        hasActiveFilters={hasActiveFilters()}
        onToggleStatus={toggleDomainStatus}
        userRole={user?.role}
      />

      <div className="mt-6 sm:mt-8">
        <CustomDomainCharts domains={allDomains} />
      </div>

      {filteredDomains && filteredDomains.length > 0 && totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      )}
    </div>
  );
};

export default ListCustomDomains;