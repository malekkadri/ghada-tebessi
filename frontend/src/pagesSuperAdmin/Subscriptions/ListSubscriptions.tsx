import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { subscriptionService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import StatsCardsSubscriptions from '../../cards/StatsCardsSubscriptions';
import FilterMenuSubscriptions from '../../cards/FilterMenuSubscriptions';
import ExportMenu from '../../cards/ExportMenu';
import SubscriptionTable from '../../atoms/Tables/SubscriptionTable';
import ActiveFiltersSubscriptions from '../../cards/ActiveFiltersSubscriptions';
import SubscriptionCharts from '../../atoms/Charts/SubscriptionCharts';
import { Subscriptions } from '../../services/Subscription';

export interface ActiveFilters {
  status: string;
  search: string;
}

const ListSubscriptions: React.FC = () => {
  const [allSubscriptions, setAllSubscriptions] = useState<Subscriptions[]>([]);
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
    expired: 0,
    canceled: 0,
    pending: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allSubscriptions.length > 0) {
      const total = allSubscriptions.length;
      const active = allSubscriptions.filter(sub => sub.status === 'active').length;
      const expired = allSubscriptions.filter(sub => sub.status === 'expired').length;
      const canceled = allSubscriptions.filter(sub => sub.status === 'canceled').length;
      const pending = allSubscriptions.filter(sub => sub.status === 'pending').length;
      
      setStats({ total, active, expired, canceled, pending });
    } else {
      setStats({ total: 0, active: 0, expired: 0, canceled: 0, pending: 0 });
    }
  }, [allSubscriptions]);

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
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getSubscriptions();
        
        if (response.success && Array.isArray(response.data)) {
          setAllSubscriptions(response.data);
        } else {
          setAllSubscriptions([]);
          toast.error('Received invalid subscription data format');
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions', error);
        toast.error('Failed to load subscriptions. Please try again.');
        setAllSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    if (!allSubscriptions || allSubscriptions.length === 0) return [];

    let result = [...allSubscriptions];
    
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter(sub => 
        (sub.user?.name?.toLowerCase().includes(searchTerm) || 
        (sub.user?.email?.toLowerCase().includes(searchTerm) ||
        (sub.plan?.name?.toLowerCase().includes(searchTerm))
      )));
    }
    
    if (activeFilters.status !== 'all') {
      result = result.filter(sub => sub.status === activeFilters.status);
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return result;
  }, [activeFilters, allSubscriptions]);

  const totalPages = Math.ceil((filteredSubscriptions?.length || 0) / itemsPerPage);
  const currentPageSubscriptions = useMemo(() => {
    if (!filteredSubscriptions || filteredSubscriptions.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSubscriptions.slice(startIndex, endIndex);
  }, [filteredSubscriptions, currentPage, itemsPerPage]);

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

  const formatSubscriptionData = (sub: Subscriptions) => ({
    ID: sub.id,
    'User Name': sub.user?.name || 'N/A',
    'User Email': sub.user?.email || 'N/A',
    'Plan Name': sub.plan?.name || 'N/A',
    'Plan Price': sub.plan?.price || 'N/A',
    'Start Date': new Date(sub.start_date).toLocaleDateString(),
    'End Date': new Date(sub.end_date).toLocaleDateString(),
    Status: sub.status.charAt(0).toUpperCase() + sub.status.slice(1),
    'Payment Method': sub.payment_method || 'N/A',
    'Created At': new Date(sub.created_at).toLocaleString()
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredSubscriptions || filteredSubscriptions.length === 0) return;
    
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `subscriptions_export_${date}`;
      
      if (format === 'csv') {
        exportToCsv(filteredSubscriptions.map(formatSubscriptionData), filename);
      } else {
        exportToJson(filteredSubscriptions.map(formatSubscriptionData), filename);
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

  const handleCancelSubscription = async (subscriptionId: number) => {
    try {
      setLoading(true);
      await subscriptionService.cancelSubscriptionByAdmin(subscriptionId);
      
      setAllSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscriptionId ? { ...sub, status: 'canceled' } : sub
        )
      );
      
      toast.success('Subscription canceled successfully');
    } catch (error) {
      console.error('Failed to cancel subscription', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Subscriptions</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            Manage all subscriptions
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by user, plan..."
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
                <FilterMenuSubscriptions 
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
                disabled={exporting || !filteredSubscriptions || filteredSubscriptions.length === 0}
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

      <StatsCardsSubscriptions stats={stats} />
      
      {hasActiveFilters() && (
        <ActiveFiltersSubscriptions 
          activeFilters={activeFilters} 
          resetFilters={resetFilters} 
        />
      )}

      <SubscriptionTable
        subscriptions={currentPageSubscriptions}
        hasActiveFilters={hasActiveFilters()}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={paginate}
        onCancelSubscription={handleCancelSubscription}
      />

      <SubscriptionCharts subscriptions={allSubscriptions} />
    </div>
  );
};

export default ListSubscriptions;