import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaFileExport, FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { projectService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { VCard } from '../../services/vcard';
import StatsCardsProjectVCards from '../../cards/StatsCardsProjectVCards';
import ExportMenu from '../../cards/ExportMenu';
import Pagination from '../../atoms/Pagination/Pagination';
import ActiveFiltersVcards from '../../cards/ActiveFiltersVcards';
import FilterMenu from '../../cards/FilterMenuVcard';
import ProjectVCardsTable from '../../atoms/Tables/ProjectVCardsTable';
import { vcardService } from '../../services/api';

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

const ProjectVCardsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [vcards, setVcards] = useState<VCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectName, setProjectName] = useState<string>('');
  
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectRes, vcardsRes] = await Promise.all([
          projectService.getProjectById(projectId!),
          projectService.getVCardsByProject(projectId!)
        ]);

        setProjectName(projectRes.name || `Project ${projectId}`);

        const vcardsData = Array.isArray(vcardsRes.data) ? vcardsRes.data : [];
        const formattedCards = vcardsData.map((v: any) => ({
          ...v,
          id: v.id,
          logo: v.logo,
          favicon: v.favicon,
        }));
        setVcards(formattedCards);
      } catch (error) {
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    projectId && fetchData();
  }, [projectId]);

  useEffect(() => {
    if (vcards.length > 0) {
      const total = vcards.length;
      const active = vcards.filter(vcard => vcard.is_active).length;
      const inactive = vcards.filter(vcard => !vcard.is_active).length;
      const blocked = vcards.filter(vcard => vcard.status).length;
      const totalViews = vcards.reduce((sum, vcard) => sum + (vcard.views || 0), 0);
      
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
  }, [vcards]);

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

  const filteredVCards = useMemo(() => {
    if (!vcards || vcards.length === 0) return [];

    let result = [...vcards];
    
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter(vcard => {
        // Convertir toutes les valeurs en chaînes avant de comparer
        const name = vcard.name?.toString().toLowerCase() || '';
        const url = vcard.url?.toString().toLowerCase() || '';
        const id = vcard.id?.toString().toLowerCase() || '';

        return name.includes(searchTerm) || 
               url.includes(searchTerm) ||
               id.includes(searchTerm);
      });
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
  }, [activeFilters, vcards]);

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

  const formatVCardData = (vcard: VCard) => ({
    ID: vcard.id?.toString() || '', 
    Name: vcard.name || '',
    URL: vcard.url || '',
    Status: vcard.is_active ? 'Active' : 'Inactive',
    Blocked: vcard.status ? 'Yes' : 'No',
    'Created At': vcard.createdAt ? new Date(vcard.createdAt).toLocaleString() : 'N/A',
    Views: vcard.views || 0
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredVCards || filteredVCards.length === 0) return;

    try {
      setExporting(true);
      setShowExportMenu(false);

      const date = new Date().toISOString().slice(0, 10);
      const filename = `project_${projectId}_vcards_export_${date}`;

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
      setVcards(prevVCards =>
        prevVCards.map(vcard =>
          vcard.id === vcardId ? { ...vcard, status: isBlocked } : vcard
        )
      );

      await vcardService.toggleStatus(vcardId);
      
      toast.success(`VCard ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      console.error('Failed to toggle VCard blocked status', error);
      toast.error('Failed to update VCard blocked status');

      setVcards(prevVCards =>
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
    <div className="p-2 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto mobile-no-left-padding">
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

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-primary hover:text-primary-dark"
      >
        <FaArrowLeft className="mr-2" /> Back to Projects
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {projectName ? `Project: ${projectName}` : 'Project VCards'}
          </h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            View and manage VCards for this project
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search VCards..."
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

      <StatsCardsProjectVCards stats={stats} />
      
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

      <ProjectVCardsTable
        vcards={currentPageVCards}
        hasActiveFilters={hasActiveFilters()}
        onToggleBlocked={toggleVCardBlocked}
      />

      {filteredVCards && filteredVCards.length > 0 && totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      )}

      {!loading && filteredVCards.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {hasActiveFilters()
            ? "No VCards match your filters"
            : "No VCards available for this project"}
        </div>
      )}
    </div>
  );
};

export default ProjectVCardsPage;