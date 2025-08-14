import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pixelService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import StatsCardsPixels from '../../cards/StatsCardsPixels';
import FilterMenuPixels from '../../cards/FilterMenuPixels';
import ExportMenu from '../../cards/ExportMenu';
import PixelTable from '../../atoms/Tables/PixelTable';
import Pagination from '../../atoms/Pagination/Pagination';
import PixelCharts from '../../atoms/Charts/PixelCharts';
import ActiveFiltersPixels from '../../cards/ActiveFiltersPixels';
import { Pixel } from '../../services/Pixel';

export interface ActiveFilters {
  status: string;
  blocked: string;
  search: string;
}

const ListPixels: React.FC = () => {
  const [allPixels, setAllPixels] = useState<Pixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    blocked: 'all',
    search: ''
  });
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allPixels.length > 0) {
      const total = allPixels.length;
      const active = allPixels.filter(pixel => pixel.is_active).length;
      const inactive = allPixels.filter(pixel => !pixel.is_active).length;
      const blocked = allPixels.filter(pixel => pixel.is_blocked).length;
      
      setStats({ total, active, inactive, blocked });
    } else {
      setStats({ total: 0, active: 0, inactive: 0, blocked: 0 });
    }
  }, [allPixels]);

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
    const fetchPixels = async () => {
      try {
        setLoading(true);
        const response = await pixelService.getPixels();
        
        if (response.success && Array.isArray(response.data)) {
          setAllPixels(response.data);
        } else {
          setAllPixels([]);
          toast.error('Received invalid pixel data format');
        }
      } catch (error) {
        console.error('Failed to fetch pixels', error);
        toast.error('Failed to load pixels. Please try again.');
        setAllPixels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPixels();
  }, []);

  const filteredPixels = useMemo(() => {
    if (!allPixels || allPixels.length === 0) return [];

    let result = [...allPixels];
    
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter(pixel => {
        const pixelNameMatch = pixel.name?.toLowerCase().includes(searchTerm) || false;
        const userNameMatch = pixel.vcard?.user?.name?.toLowerCase().includes(searchTerm) || false;
        const userEmailMatch = pixel.vcard?.user?.email?.toLowerCase().includes(searchTerm) || false;
        
        return pixelNameMatch || userNameMatch || userEmailMatch;
      });
    }
    
    if (activeFilters.status !== 'all') {
      result = result.filter(pixel => 
        activeFilters.status === 'active' ? pixel.is_active : !pixel.is_active
      );
    }
    
    if (activeFilters.blocked !== 'all') {
      result = result.filter(pixel => 
        activeFilters.blocked === 'blocked' ? pixel.is_blocked : !pixel.is_blocked
      );
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return result;
  }, [activeFilters, allPixels]);

  const currentPagePixels = useMemo(() => {
    if (!filteredPixels || filteredPixels.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPixels.slice(startIndex, endIndex);
  }, [filteredPixels, currentPage, itemsPerPage]);

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
      blocked: 'all',
      search: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      activeFilters.status !== 'all' ||
      activeFilters.blocked !== 'all' ||
      activeFilters.search !== ''
    );
  };

  const totalPages = Math.ceil((filteredPixels?.length || 0) / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const togglePixelBlocked = async (pixelId: string, newBlockedStatus: boolean) => {
    let originalPixels: Pixel[] = [];
    
    try {
      originalPixels = [...allPixels];
      
      setAllPixels(prevPixels =>
        prevPixels.map(pixel =>
          pixel.id === pixelId ? { ...pixel, is_blocked: newBlockedStatus } : pixel
        )
      );

      await pixelService.togglePixelBlocked(pixelId);
      
      toast.success(`Pixel ${newBlockedStatus ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      console.error('Failed to toggle pixel blocked status', error);
      toast.error('Failed to update pixel blocked status');
      
      setAllPixels(originalPixels);
    }
  };

  const formatPixelData = (pixel: Pixel) => ({
    ID: pixel.id,
    Name: pixel.name || 'N/A',
    Status: pixel.is_active ? 'Active' : 'Inactive',
    Blocked: pixel.is_blocked ? 'Yes' : 'No',
    'Created At': new Date(pixel.created_at).toLocaleString(),
    'User Name': pixel.vcard?.user?.name || 'N/A',
    'User Email': pixel.vcard?.user?.email || 'N/A'
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredPixels || filteredPixels.length === 0) return;
    
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `pixels_export_${date}`;
      
      if (format === 'csv') {
        exportToCsv(filteredPixels.map(formatPixelData), filename);
      } else {
        exportToJson(filteredPixels.map(formatPixelData), filename);
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Pixel Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            Track and manage all tracking pixels
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name, user or email..."
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
                <FilterMenuPixels 
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
                disabled={exporting || !filteredPixels || filteredPixels.length === 0}
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

      <StatsCardsPixels stats={stats} />
      
      {hasActiveFilters() && (
        <ActiveFiltersPixels 
            activeFilters={activeFilters} 
            resetFilters={resetFilters} 
        />
        )}

      <PixelTable
        pixels={currentPagePixels}
        hasActiveFilters={hasActiveFilters()}
        onToggleBlocked={togglePixelBlocked}
      />

      <div className="mt-6 sm:mt-8">
        <PixelCharts pixels={allPixels} />
      </div>

      {filteredPixels && filteredPixels.length > 0 && totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      )}
    </div>
  );
};

export default ListPixels;