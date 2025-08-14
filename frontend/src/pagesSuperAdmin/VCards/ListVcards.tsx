// ListVCards.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaFileExport, FaUsers, FaUserCheck, FaUserSlash, FaEye, FaBan } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { vcardService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { VCardWithUser } from '../../services/api';
import { formatDate } from '../../services/dateUtils';
import ExportMenu from '../../cards/ExportMenu';
import Pagination from '../../atoms/Pagination/Pagination';
import ActiveFiltersVcards from '../../cards/ActiveFiltersVcards';
import FilterMenu from '../../cards/FilterMenuVcard';
import VCardsTable from '../../atoms/Tables/VCardsTable';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 
import VCardsCharts from '../../atoms/Charts/VCardsCharts'; 

interface ActiveFilters {
  status: string;
  search: string;
  blocked: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  totalViews: number;
}

const colorMap = {
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-500',
    darkBg: 'dark:bg-orange-500',
    darkText: 'dark:text-orange-100'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-500',
    darkBg: 'dark:bg-green-500',
    darkText: 'dark:text-green-100'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-500',
    darkBg: 'dark:bg-red-500',
    darkText: 'dark:text-red-100'
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-500',
    darkBg: 'dark:bg-blue-500',
    darkText: 'dark:text-blue-100'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-500',
    darkBg: 'dark:bg-purple-500',
    darkText: 'dark:text-purple-100'
  }
};

const VCardStatCard: React.FC<{ 
  icon: React.ReactNode;
  title: string;
  value: number;
  color: keyof typeof colorMap;
}> = ({ icon, title, value, color }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const colors = colorMap[color];

  useEffect(() => {
    if (value !== prevValue) {
      setDisplayValue(value);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 h-full stats-card-mobile-item">
      <div className={`p-3 mr-4 rounded-full ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
        {icon}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={displayValue}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-gray-700 dark:text-gray-200"
          >
            {displayValue}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatsCardsVcards: React.FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 stats-cards-mobile-reduce">
    <VCardStatCard 
      icon={<FaUsers className="w-5 h-5" />}
      title="Total VCards"
      value={stats.total}
      color="orange"
    />
    <VCardStatCard 
      icon={<FaUserCheck className="w-5 h-5" />}
      title="Active"
      value={stats.active}
      color="green"
    />
    <VCardStatCard 
      icon={<FaUserSlash className="w-5 h-5" />}
      title="Inactive"
      value={stats.inactive}
      color="red"
    />
    <VCardStatCard 
      icon={<FaEye className="w-5 h-5" />}
      title="Total Views"
      value={stats.totalViews}
      color="blue"
    />
    <VCardStatCard 
      icon={<FaBan className="w-5 h-5" />}
      title="Blocked"
      value={stats.blocked}
      color="purple"
    />
  </div>
);

const ListVCards: React.FC = () => {
  const { user } = useAuth(); 
  const [allVCards, setAllVCards] = useState<VCardWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate(); 
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    search: '',
    blocked: 'all'
  });
  
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    totalViews: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allVCards.length > 0) {
      const total = allVCards.length;
      const active = allVCards.filter(vcard => vcard.is_active).length;
      const inactive = allVCards.filter(vcard => !vcard.is_active).length;
      const blocked = allVCards.filter(vcard => vcard.status).length;
      const totalViews = allVCards.reduce((sum, vcard) => sum + (vcard.views || 0), 0);
      
      setStats({ total, active, inactive, blocked, totalViews });
    } else {
      setStats({ 
        total: 0, 
        active: 0, 
        inactive: 0, 
        blocked: 0, 
        totalViews: 0 
      });
    }
  }, [allVCards]);

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
    const fetchVCards = async () => {
      try {
        setLoading(true);
        const response = await vcardService.getAllWithUsers();
        if (response.data) {
          setAllVCards(response.data);
        } else {
          setAllVCards([]);
          toast.error('No VCard data received from server');
        }
      } catch (error) {
        console.error('Failed to fetch VCards', error);
        toast.error('Failed to load VCards. Please try again.');
        setAllVCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVCards();
  }, []);

  const handleViewBlocks = (vcardId: string) => {
    if (user?.role === 'superAdmin') {
      navigate(`/super-admin/vcard/${vcardId}/blocks`);
    } else {
      navigate(`/admin/vcard/edit-vcard/${vcardId}/blocks`);
    }
  };

  const filteredVCards = useMemo(() => {
    if (!allVCards || allVCards.length === 0) return [];

    let result = [...allVCards];
    
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter(vcard => 
        (vcard.name?.toLowerCase().includes(searchTerm)) ||
        (vcard.Users?.name?.toLowerCase().includes(searchTerm)) ||
        (vcard.Users?.email?.toLowerCase().includes(searchTerm))
      );
    }
    
    if (activeFilters.status !== 'all') {
      result = result.filter(vcard => 
        activeFilters.status === 'active' ? vcard.is_active : !vcard.is_active
      );
    }
    
    if (activeFilters.blocked !== 'all') {
      result = result.filter(vcard => 
        activeFilters.blocked === 'blocked' ? vcard.status : !vcard.status
      );
    }
    
    return result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [activeFilters, allVCards]);

  const currentPageVCards = useMemo(() => {
    if (!filteredVCards || filteredVCards.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVCards.slice(startIndex, endIndex);
  }, [filteredVCards, currentPage, itemsPerPage]);

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
      search: '',
      blocked: 'all'
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.status !== 'all' ||
      activeFilters.search !== '' ||
      activeFilters.blocked !== 'all'
    );
  };

  const totalPages = Math.ceil((filteredVCards?.length || 0) / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatVCardData = (vcard: VCardWithUser) => ({
    ID: vcard.id,
    Name: vcard.name,
    URL: vcard.url,
    Status: vcard.is_active ? 'Active' : 'Inactive',
    Blocked: vcard.status ? 'Yes' : 'No',
    'Created At': vcard.createdAt ? formatDate(vcard.createdAt) : 'N/A',
    'Last Updated': vcard.updatedAt ? formatDate(vcard.updatedAt) : 'N/A',
    'User Name': vcard.Users?.name || 'N/A',
    'User Email': vcard.Users?.email || 'N/A',
    Views: vcard.views || 0
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredVCards || filteredVCards.length === 0) return;

    try {
      setExporting(true);
      setShowExportMenu(false);

      const date = new Date().toISOString().slice(0, 10);
      const filename = `vcards_export_${date}`;

      if (format === 'csv') {
        exportToCsv(filteredVCards.map(formatVCardData), filename);
      } else {
        exportToJson(filteredVCards.map(formatVCardData), filename);
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

  const toggleVCardBlocked = async (vcardId: string, isBlocked: boolean) => {
    try {
      setAllVCards(prevVCards =>
        prevVCards.map(vcard =>
          vcard.id === vcardId ? { ...vcard, status: isBlocked } : vcard
        )
      );

      const response = await vcardService.toggleStatus(vcardId);
      
      if (response.newStatus !== isBlocked) {
        setAllVCards(prevVCards =>
          prevVCards.map(vcard =>
            vcard.id === vcardId ? { ...vcard, status: response.newStatus } : vcard
          )
        );
      }
      
      toast.success(response.message);
    } catch (error) {
      console.error('Failed to toggle VCard blocked status', error);
      toast.error('Failed to update VCard blocked status');

      setAllVCards(prevVCards =>
        prevVCards.map(vcard =>
          vcard.id === vcardId ? { ...vcard, status: !isBlocked } : vcard
        )
      );
    }
  };

  const activeFiltersRecord: Record<string, string> = {
    status: activeFilters.status,
    search: activeFilters.search,
    blocked: activeFilters.blocked
  };

  const handleGenericFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status' || filterType === 'search' || filterType === 'blocked') {
      handleFilterChange(filterType as keyof ActiveFilters, value);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="lg:p-2 xl:p-2 sm:p-6 sm:py-2 lg:px-8 xl:px-14 lg:py-4 xl:py-4 w-full max-w-[90rem] mx-auto">
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
          <h1 className="text-xl sm:text-2xl pt-4 font-bold text-gray-800 dark:text-white">VCard Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            View and manage all VCards in the system
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search VCards, users or emails..."
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
                <FilterMenu 
                  ref={filterMenuRef}
                  activeFilters={activeFiltersRecord}
                  onFilterChange={handleGenericFilterChange}
                  onReset={resetFilters}
                  onClose={() => setShowFilterMenu(false)}
                  filterOptions={[
                    { 
                      key: 'status', 
                      label: 'Status', 
                      options: [
                        { value: 'all', label: 'All Statuses' },
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' }
                      ] 
                    },
                    { 
                      key: 'blocked', 
                      label: 'Blocked', 
                      options: [
                        { value: 'all', label: 'All Blocked Statuses' },
                        { value: 'blocked', label: 'Blocked' },
                        { value: 'allowed', label: 'Allowed' }
                      ] 
                    }
                  ]}
                />
              )}
            </div>

            <div className="relative" ref={exportMenuRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || !filteredVCards || filteredVCards.length === 0}
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

      <StatsCardsVcards stats={stats} />
      
      {hasActiveFilters() && (
        <ActiveFiltersVcards
          activeFilters={activeFilters}
          resetFilters={resetFilters} 
          filterLabels={{
            status: "Status",
            search: "Search",
            blocked: "Blocked"
          }}
        />
      )}

      <VCardsTable
        vcards={currentPageVCards}
        hasActiveFilters={hasActiveFilters()}
        onToggleBlocked={toggleVCardBlocked}
        onViewBlocks={handleViewBlocks} 
      />

      {filteredVCards && filteredVCards.length > 0 && totalPages > 1 && (
        <div className="mt-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        </div>
      )}

      <div className="mt-6 sm:mt-8 listvcard-charts-mobile-reduce">
        <VCardsCharts vcards={allVCards} />
      </div>
    </div>
  );
};

export default ListVCards;