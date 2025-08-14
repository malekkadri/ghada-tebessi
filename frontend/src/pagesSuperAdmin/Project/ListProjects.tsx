import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { projectService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { Project } from '../../services/Project';
import StatsCardsProjects from '../../cards/StatsCardsProjects';
import FilterMenuProjects from '../../cards/FilterCardProjects';
import ExportMenu from '../../cards/ExportMenu';
import ProjectTable from '../../atoms/Tables/ProjectTable';
import Pagination from '../../atoms/Pagination/Pagination';
import ProjectCharts from '../../atoms/Charts/ProjectCharts';
import ActiveFiltersProjects from '../../cards/ActiveFiltersProjects';
import { useNavigate } from 'react-router-dom';

export interface ActiveFilters {
  status: string;
  blocked: string;
  search: string;
}

const ListProjects: React.FC = () => {
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
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
    archived: 0,
    pending: 0,
    blocked: 0
  });
  
  const itemsPerPage = 10;
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allProjects.length > 0) {
      const total = allProjects.length;
      const active = allProjects.filter(project => project.status === 'active').length;
      const archived = allProjects.filter(project => project.status === 'archived').length;
      const pending = allProjects.filter(project => project.status === 'pending').length;
      const blocked = allProjects.filter(project => project.is_blocked).length;
      
      setStats({ total, active, archived, pending, blocked });
    } else {
      setStats({ 
        total: 0, 
        active: 0, 
        archived: 0, 
        pending: 0, 
        blocked: 0 
      });
    }
  }, [allProjects]);

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
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getAllProjectsWithUser();
        
        if (response.success && Array.isArray(response.data)) {
          setAllProjects(response.data);
        } else {
          setAllProjects([]);
          console.error('Invalid project data format:', response);
          toast.error('Received invalid project data format');
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
        toast.error('Failed to load projects. Please try again.');
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!allProjects || allProjects.length === 0) return [];

    let result = [...allProjects];
    
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      result = result.filter(project => {
        const projectNameMatch = project.name?.toLowerCase().includes(searchTerm) || false;
        const userNameMatch = project.Users?.name?.toLowerCase().includes(searchTerm) || false;
        const userEmailMatch = project.Users?.email?.toLowerCase().includes(searchTerm) || false;
        
        return projectNameMatch || userNameMatch || userEmailMatch;
      });
    }
    
    if (activeFilters.status !== 'all') {
      result = result.filter(project => project.status === activeFilters.status);
    }
    
    if (activeFilters.blocked !== 'all') {
      result = result.filter(project => 
        activeFilters.blocked === 'blocked' ? project.is_blocked : !project.is_blocked
      );
    }
    
    result.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    return result;
  }, [activeFilters, allProjects]);

  const currentPageProjects = useMemo(() => {
    if (!filteredProjects || filteredProjects.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentPage, itemsPerPage]);

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

  const totalPages = Math.ceil((filteredProjects?.length || 0) / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleProjectBlocked = async (projectId: string, isBlocked: boolean) => {
    let originalProjects: Project[] = [];
    
    try {
      originalProjects = [...allProjects];
      
      setAllProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId ? { ...project, is_blocked: isBlocked } : project
        )
      );

      await projectService.toggleProjectBlocked(projectId);
      
      toast.success(`Project ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      console.error('Failed to toggle project blocked status', error);
      toast.error('Failed to update project blocked status');

      setAllProjects(originalProjects);
    }
  };

  const handleShowVcards = (projectId: string) => {
    navigate(`/super-admin/project/${projectId}/vcards`);
  };

  const formatProjectData = (project: Project) => ({
    ID: project.id,
    Name: project.name,
    Description: project.description || 'N/A',
    Status: project.status,
    Blocked: project.is_blocked ? 'Yes' : 'No',
    'Created At': project.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A',
    'User Name': project.Users?.name || 'N/A',
    'User Email': project.Users?.email || 'N/A'
  });

  const handleExport = (format: 'csv' | 'json') => {
    if (exporting || !filteredProjects || filteredProjects.length === 0) return;
    
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `projects_export_${date}`;
      
      if (format === 'csv') {
        exportToCsv(filteredProjects.map(formatProjectData), filename);
      } else {
        exportToJson(filteredProjects.map(formatProjectData), filename);
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Project Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            View and manage all projects in the system
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search projects, users or emails..."
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
                <FilterMenuProjects 
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
                disabled={exporting || !filteredProjects || filteredProjects.length === 0}
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

      <StatsCardsProjects stats={stats} />
      
      {hasActiveFilters() && (
        <ActiveFiltersProjects 
            activeFilters={activeFilters} 
            resetFilters={resetFilters} 
        />
        )}

      <ProjectTable
        projects={currentPageProjects}
        hasActiveFilters={hasActiveFilters()}
        onToggleBlocked={toggleProjectBlocked}
        onShowVcards={handleShowVcards}
      />

      <div className="mt-6 sm:mt-8">
        <ProjectCharts projects={allProjects} />
      </div>

      {filteredProjects && filteredProjects.length > 0 && totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />
      )}
    </div>
  );
};

export default ListProjects;