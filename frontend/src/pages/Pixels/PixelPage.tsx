import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaPlus,
  FaFilter,
  FaTimes,
  FaChartLine,
  FaFileExport,
  FaCalendarAlt,
} from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from 'react-bootstrap';
import PixelItem from '../../cards/PixelItem';
import EmptyState from '../../cards/EmptyState';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pixelService, limitService } from '../../services/api';
import { Pixel } from '../../services/Pixel';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ExportMenu from '../../cards/ExportMenu'; 
import Pagination from '../../atoms/Pagination/Pagination'; // Import du composant Pagination

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

const PixelPage: React.FC = () => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPixels, setFilteredPixels] = useState<Pixel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const navigate = useNavigate();
  const [currentPlanLimit, setCurrentPlanLimit] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    dateRange: {
      start: undefined as Date | undefined,
      end: undefined as Date | undefined
    }
  });
  const cardsPerPage = 12;
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const fetchPlanLimit = async () => {
      try {
        const { max } = await limitService.checkPixelLimit();
        setCurrentPlanLimit(max === -1 ? Infinity : max);
      } catch (error) {
        console.error('Error fetching plan limits:', error);
      }
    };
    fetchPlanLimit();
  }, []);

  const fetchPixels = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await pixelService.getUserPixels(currentUser.id);

      let pixels: Pixel[] = [];
      if (Array.isArray(response)) {
        pixels = response;
      } else if (response && Array.isArray(response.data)) {
        pixels = response.data;
      } else if (response && Array.isArray(response.pixels)) {
        pixels = response.pixels;
      } else if (response === null || response === undefined) {
        pixels = [];
      } else {
        console.warn('Unexpected response format:', response);
        pixels = [];
      }

      const sortedPixels = pixels.sort((a: Pixel, b: Pixel) =>
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      );

      const formattedPixels = sortedPixels.map((pixel: Pixel, index: number) => ({
        ...pixel,
        isDisabled: currentPlanLimit !== Infinity && index >= currentPlanLimit
      }));

      setPixels(formattedPixels);
      setFilteredPixels(formattedPixels);
    } catch (err: any) {
      console.error('Error fetching pixels:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load pixels';
      toast.error(errorMessage);
      setPixels([]);
      setFilteredPixels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPixels();
  }, [currentUser, refreshTrigger, currentPlanLimit]);

  const applyFilters = useCallback(() => {
    let filtered = [...pixels];

    filtered = filtered.filter(pixel =>
      pixel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(pixel =>
        pixel.is_active === (activeFilters.status === 'active')
      );
    }

    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(pixel => {
        const pixelDate = new Date(pixel.created_at);
        const start = activeFilters.dateRange.start || new Date(0);
        const end = activeFilters.dateRange.end || new Date();

        return pixelDate >= start && pixelDate <= end;
      });
    }

    setFilteredPixels(filtered);
    setCurrentPage(1);
  }, [pixels, searchTerm, activeFilters]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, pixels, activeFilters]);

  const handleFilterChange = useCallback((filterType: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setActiveFilters({
      status: 'all',
      dateRange: { start: undefined, end: undefined }
    });
    setSearchTerm('');
  }, []);

  const hasActiveFilters = useCallback(() => {
    return activeFilters.status !== 'all' ||
           activeFilters.dateRange.start !== undefined ||
           activeFilters.dateRange.end !== undefined;
  }, [activeFilters]);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredPixels.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredPixels.length / cardsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleCreatePixel = async () => {
    try {
      const { current, max } = await limitService.checkPixelLimit();
      if (max !== -1 && current >= max) {
        if (max === 0) {
          toast.warning('Pixel creation is not available on the Free plan. Upgrade to create pixels.');
        } else {
          toast.warning(`You've reached the maximum of ${max} Pixels. Upgrade your plan to create more.`);
        }
      } else {
        navigate('/admin/pixel/create');
      }
    } catch (error) {
      toast.error('Error checking plan limits. Please try again.');
    }
  };

  const handleDeletePixel = async (pixelId: string) => {
    try {
      const result = await pixelService.delete(pixelId);
      if (result && result.success) {
        toast.success('Pixel deleted successfully');
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error: any) {
      console.error('Error deleting pixel:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete pixel';
      toast.error(errorMessage);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (filteredPixels.length === 0) {
      toast.warning('No pixels to export');
      return;
    }

    setExporting(true);
    try {
      const exportData = filteredPixels.map(pixel => ({
        id: pixel.id,
        name: pixel.name,
        is_active: pixel.is_active ? 'Active' : 'Inactive',
        vcard_name: pixel.vcard?.name || 'Not associated',
        created_at: new Date(pixel.created_at).toLocaleDateString()
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `pixels_export_${timestamp}`;

      if (format === 'csv') {
        exportToCSV(exportData, fileName);
        toast.success('Pixels exported to CSV successfully!');
      } else {
        exportToJSON(exportData, fileName);
        toast.success('Pixels exported to JSON successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export pixels');
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

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

      if (
        filterMenuRef.current &&
        filterButtonRef.current &&
        !filterMenuRef.current.contains(event.target as Node) &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />

      <div className="mb-6 w-full max-w-3xl pl-6">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item
            linkAs={Link}
            linkProps={{ to: "/admin/pixel" }}
            active={true}
            className="text-sm font-medium text-primary"
          >
            Tracking Pixels
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pixels Manager</h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            Track user interactions and analytics
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search pixels..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="relative" ref={exportButtonRef}>
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || filteredPixels.length === 0}
              >
                <FaFileExport className={`text-purple-500 text-sm sm:text-base ${exporting ? 'opacity-50' : ''}`} />
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
                <div
                  ref={filterMenuRef}
                  className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 w-72 p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:[color-scheme:dark]"
                        value={activeFilters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="all" className="dark:bg-gray-800 dark:text-gray-300">All Statuses</option>
                        <option value="active" className="dark:bg-gray-800 dark:text-gray-300">Active</option>
                        <option value="inactive" className="dark:bg-gray-800 dark:text-gray-300">Inactive</option>
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
                            onChange={(date: Date | null) => handleFilterChange('dateRange', {
                              ...activeFilters.dateRange,
                              start: date || undefined
                            })}
                            selectsStart
                            startDate={activeFilters.dateRange.start}
                            endDate={activeFilters.dateRange.end}
                            maxDate={activeFilters.dateRange.end || new Date()}
                            placeholderText="Start date"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:[color-scheme:dark]"
                          />
                          <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                        <div className="relative">
                          <DatePicker
                            selected={activeFilters.dateRange.end}
                            onChange={(date: Date | null) => handleFilterChange('dateRange', {
                              ...activeFilters.dateRange,
                              end: date || undefined
                            })}
                            selectsEnd
                            startDate={activeFilters.dateRange.start}
                            endDate={activeFilters.dateRange.end}
                            minDate={activeFilters.dateRange.start}
                            placeholderText="End date"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:[color-scheme:dark]"
                          />
                          <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={resetFilters}
                        className="w-full bg-red-100 dark:bg-gray-700 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" /> Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCreatePixel}
              className="flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 sm:py-2.5 sm:px-6 rounded-lg transition-colors h-10 sm:h-12 text-sm sm:text-base relative"
            >
              <FaPlus className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:transform-none sm:mr-2 w-10" />
              <span className="hidden xs:inline sm:ml-0">Create Pixel</span>
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {activeFilters.status !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Status: {activeFilters.status.charAt(0).toUpperCase() + activeFilters.status.slice(1)}
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

      {filteredPixels.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {currentCards.map(pixel => (
                <PixelItem
                  key={pixel.id}
                  pixel={pixel}
                  onDelete={() => handleDeletePixel(pixel.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

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
        <EmptyState
          title={searchTerm || hasActiveFilters() 
            ? "No pixels match your filters" 
            : "No pixels yet"}
          description={searchTerm || hasActiveFilters()
            ? "Try adjusting your search or filters"
            : "Get started by creating your first Pixel"}
          actionText="Create Pixel"
          actionLink="/admin/pixel/create"
          icon={<FaChartLine size={40} />}
        />
      )}
    </div>
  );
};

export default PixelPage;