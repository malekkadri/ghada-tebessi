import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaFileExport,
  FaFilter,
  FaTimes,
} from 'react-icons/fa';
import { FiChevronRight, FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { vcardService, limitService } from '../../services/api';
import VCardItem from '../../cards/VCardItem';
import EmptyState from '../../cards/EmptyState';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from 'react-bootstrap';
import { VCard } from "../../services/vcard";
import FilterCard from '../../cards/FilterCard';
import ExportMenu from '../../cards/ExportMenu'; 
import Pagination from '../../atoms/Pagination/Pagination'; 

interface RawVCard {
  id?: string | number;
  name?: string;
  description?: string;
  logo?: string;
  favicon?: string;
  background_value?: string;
  background_type?: string;
  font_family?: string;
  font_size?: number;
  is_active?: boolean;
  is_share?: boolean;
  is_downloaded?: boolean;
  views?: number;
  url?: string;
  createdAt?: string;
  search_engine_visibility?: boolean;
  remove_branding?: boolean;
}
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const exportToCSV = (data: any[], fileName: string) => {
  try {
    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] === null || row[header] === undefined ? '' : row[header];
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

const exportToJSON = (data: any[], fileName: string) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    downloadFile(blob, `${fileName}.json`);
    return true;
  } catch (error) {
    console.error('JSON conversion error:', error);
    throw new Error('Failed to generate JSON file');
  }
};

const VCardPage: React.FC = () => {
  const [vcards, setVcards] = useState<VCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVCards, setFilteredVCards] = useState<VCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [currentPlanLimit, setCurrentPlanLimit] = useState(1);
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    backgroundType: 'all',
    searchEngine: 'all',
    branding: 'all',
    dateRange: {
      start: undefined,
      end: undefined
    }
  });
  const cardsPerPage = 20;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

   useEffect(() => {
    const fetchPlanLimit = async () => {
      try {
        const { max } = await limitService.checkVcardLimit();
        setCurrentPlanLimit(max === -1 ? Infinity : max);
      } catch (error) {
        console.error('Error fetching plan limits:', error);
      }
    };
    fetchPlanLimit();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        exportButtonRef.current &&
        !exportMenuRef.current.contains(event.target as Node) &&
        !exportButtonRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateClick = async () => {
    try {
      const { current, max } = await limitService.checkVcardLimit();

      if (max !== -1 && current >= max) {
        toast.warning(`You've reached the maximum of ${max} VCards. Upgrade your plan to create more.`);
      } else {
        navigate(`/admin/vcard/create-vcard`);
      }
    } catch (error) {
      console.error('Error checking VCard limits:', error);
      toast.error('Error checking plan limits. Please try again.');
    }
  };

  const fetchVCards = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await vcardService.getAll(currentUser.id);

      const cards = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const sortedCards = cards.sort((a: RawVCard, b: RawVCard) =>
        new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
      );

      const formattedCards = sortedCards.map((vcard: RawVCard, index: number) => ({
        ...vcard,
        id: vcard.id || '',
        name: vcard.name || 'Untitled VCard',
        description: vcard.description || '',
        logo: vcard.logo ? `${import.meta.env.VITE_API_URL}${vcard.logo}` : '',
        favicon: vcard.favicon ? `${import.meta.env.VITE_API_URL}${vcard.favicon}` : '',
        background_value: vcard.background_value,
        background_type: vcard.background_type,
        font_family: vcard.font_family || 'Arial, sans-serif',
        font_size: vcard.font_size || 16,
        is_active: vcard.is_active !== undefined ? vcard.is_active : true,
        is_share: vcard.is_share !== undefined ? vcard.is_share : true,
        is_downloaded: vcard.is_downloaded !== undefined ? vcard.is_downloaded : true,
        views: vcard.views || 0,
        url: vcard.url || '#',
        createdAt: vcard.createdAt || new Date().toISOString(),
        search_engine_visibility: vcard.search_engine_visibility !== undefined ? vcard.search_engine_visibility : true,
        remove_branding: vcard.remove_branding !== undefined ? vcard.remove_branding : false,
        isDisabled: index >= currentPlanLimit
      }));

      setVcards(formattedCards.filter((vcard: VCard) => vcard !== null));
      setFilteredVCards(formattedCards.filter((vcard: VCard) => vcard !== null));
    } catch (err) {
      console.error('Error:', err);
      setVcards([]);
      setFilteredVCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVCards();
  }, [currentUser, refreshTrigger, currentPlanLimit]);

  const applyFilters = () => {
    let filtered = [...vcards];

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(vcard =>
        vcard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vcard.description && vcard.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(vcard =>
        activeFilters.status === 'active' ? vcard.is_active : !vcard.is_active
      );
    }

    if (activeFilters.backgroundType !== 'all') {
      filtered = filtered.filter(vcard =>
        vcard.background_type === activeFilters.backgroundType
      );
    }

    if (activeFilters.searchEngine !== 'all') {
      filtered = filtered.filter(vcard =>
        activeFilters.searchEngine === 'visible'
          ? vcard.search_engine_visibility
          : !vcard.search_engine_visibility
      );
    }

    if (activeFilters.branding !== 'all') {
      filtered = filtered.filter(vcard =>
        activeFilters.branding === 'branded'
          ? !vcard.remove_branding
          : vcard.remove_branding
      );
    }

    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(vcard => {
        if (!vcard.createdAt) return false;

        try {
          const cardDate = new Date(vcard.createdAt);
          if (isNaN(cardDate.getTime())) return false;

          const cardDateUTC = new Date(Date.UTC(
            cardDate.getUTCFullYear(),
            cardDate.getUTCMonth(),
            cardDate.getUTCDate()
          ));

          if (activeFilters.dateRange.start) {
            const startDate = new Date(Date.UTC(
              activeFilters.dateRange.start.getFullYear(),
              activeFilters.dateRange.start.getMonth(),
              activeFilters.dateRange.start.getDate()
            ));
            if (cardDateUTC < startDate) return false;
          }

          if (activeFilters.dateRange.end) {
            const endDate = new Date(Date.UTC(
              activeFilters.dateRange.end.getFullYear(),
              activeFilters.dateRange.end.getMonth(),
              activeFilters.dateRange.end.getDate() + 1
            ));
            if (cardDateUTC >= endDate) return false;
          }

          return true;
        } catch (e) {
          console.error('Invalid date format:', vcard.createdAt, e);
          return false;
        }
      });
    }

    setFilteredVCards(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, vcards, activeFilters]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      backgroundType: 'all',
      searchEngine: 'all',
      branding: 'all',
      dateRange: {
        start: undefined,
        end: undefined
      }
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.status !== 'all' ||
      activeFilters.backgroundType !== 'all' ||
      activeFilters.searchEngine !== 'all' ||
      activeFilters.branding !== 'all' ||
      activeFilters.dateRange.start !== undefined ||
      activeFilters.dateRange.end !== undefined
    );
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredVCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredVCards.length / cardsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleExport = async (format: 'csv' | 'json') => {
    if (exporting) return;

    try {
      if (filteredVCards.length === 0) {
        toast.warning('No VCards to export');
        return;
      }

      setExporting(true);
      setShowExportMenu(false);

      const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);

      const dataToExport = filteredVCards.map(vcard => ({
        Name: vcard.name,
        Description: vcard.description || '',
        Status: vcard.is_active ? 'Active' : 'Inactive',
        URL: vcard.url,
        'Search Engine Visibility': vcard.search_engine_visibility ? 'Visible' : 'Hidden',
        'Branding': vcard.remove_branding ? 'Without Branding' : 'With Branding',
        'Background Type': vcard.background_type || 'N/A',
        'Font Family': vcard.font_family,
        'Font Size': vcard.font_size
      }));

      await new Promise(resolve => setTimeout(resolve, 300));

      let success = false;

      if (format === 'csv') {
        success = exportToCSV(dataToExport, `vcards_export_${new Date().toISOString().slice(0, 10)}`);
      } else {
        success = exportToJSON(dataToExport, `vcards_export_${new Date().toISOString().slice(0, 10)}`);
      }

      if (success) {
        toast.update(toastId, {
          render: `${format.toUpperCase()} export completed successfully!`,
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      } else {
        throw new Error(`Failed to export as ${format.toUpperCase()}`);
      }

    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const breadcrumbLinks = [
    { name: "VCards", path: "/admin/vcard" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
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

      <Breadcrumb className="mb-4 sm:mb-6">
        {breadcrumbLinks.map((link, index) => (
          <Breadcrumb.Item
            key={index}
            linkAs={Link}
            linkProps={{ to: link.path }}
            active={index === breadcrumbLinks.length - 1}
            className={`text-sm font-medium ${index === breadcrumbLinks.length - 1 ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
          >
            {index < breadcrumbLinks.length - 1 ? (
              <div className="flex items-center">
                {link.name}
                <FiChevronRight className="mx-2 text-gray-400" size={14} />
              </div>
            ) : (
              link.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My VCards</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            View and manage your digital business cards
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search VCards..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="relative" ref={exportButtonRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || filteredVCards.length === 0}
              >
                <FaFileExport className={`text-purple-600 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
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

            <div className="relative">
              <button
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border transition-colors duration-200 ${
                  hasActiveFilters()
                    ? 'border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter className={`text-sm sm:text-base ${
                  hasActiveFilters()
                    ? 'text-red-500'
                    : 'text-purple-600'
                }`} />
              </button>

              {showFilterMenu && (
                <FilterCard
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
                  onClose={() => setShowFilterMenu(false)}
                />
              )}
            </div>

            <button
              onClick={handleCreateClick}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              <FaPlus className="mr-2 text-sm sm:text-base" />
              <span className="hidden xs:inline">Create VCard</span>
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {activeFilters.status !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Status: {activeFilters.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          )}
          {activeFilters.backgroundType !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Background: {activeFilters.backgroundType}
            </span>
          )}
          {activeFilters.searchEngine !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Search: {activeFilters.searchEngine === 'visible' ? 'Visible' : 'Hidden'}
            </span>
          )}
          {activeFilters.branding !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Branding: {activeFilters.branding === 'branded' ? 'With Branding' : 'Without Branding'}
            </span>
          )}
          {(activeFilters.dateRange.start || activeFilters.dateRange.end) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              Date:
              {activeFilters.dateRange.start && ` From ${activeFilters.dateRange.start.toLocaleDateString()}`}
              {activeFilters.dateRange.end && ` To ${activeFilters.dateRange.end.toLocaleDateString()}`}
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

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredVCards.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {currentCards.map((vcard, index) => (
                  <motion.div
                    key={vcard.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: index * 0.05,
                        duration: 0.3
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      y: -20,
                      transition: { duration: 0.2 }
                    }}
                    className="flex justify-center"
                  >
                    <VCardItem
                      vcard={vcard}
                      onDeleteSuccess={handleDeleteSuccess}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={paginate}
                />
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState
              title={searchTerm || hasActiveFilters()
                ? "No VCards match your filters"
                : "No VCards yet"}
              description={searchTerm || hasActiveFilters()
                ? "Try adjusting your search or filters"
                : "Get started by creating your first VCard"}
              actionText="Create VCard"
              actionLink="/admin/vcard/create-vcard"
              icon={<FaPlus />}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VCardPage;