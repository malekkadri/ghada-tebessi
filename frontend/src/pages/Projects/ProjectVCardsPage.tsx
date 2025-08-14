import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlus,
  FaFileExport,
  FaFilter,
  FaAngleLeft,
  FaAngleRight,
  FaTimes,
  FaFileCsv,
  FaFileCode
} from 'react-icons/fa';
import { FiChevronRight, FiSearch } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { projectService } from '../../services/api';
import VCardItem from '../../cards/VCardItem';
import EmptyState from '../../cards/EmptyState';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from 'react-bootstrap';
import { VCard } from "../../services/vcard";
import FilterCard from '../../cards/FilterCard';
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
        const escaped = (`${row[header]}`)
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

const ProjectVCardsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [vcards, setVcards] = useState<VCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVCards, setFilteredVCards] = useState<VCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportButtonRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    status: 'all',
    backgroundType: 'all',
    searchEngine: 'all',
    branding: 'all',
    dateRange: { start: undefined, end: undefined }
  });
  const cardsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectRes, vcardsRes] = await Promise.all([
          projectService.getProjectById(projectId!),
          projectService.getVCardsByProject(projectId!)
        ]);

        setProject(projectRes);

        const vcardsData = Array.isArray(vcardsRes.data) ? vcardsRes.data : [];
        const formattedCards = vcardsData.map((v: any) => ({
          ...v,
          id: v.id,
          logo: v.logo,
          favicon: v.favicon,
          isDisabled: false
        }));
        console.log(formattedCards);
        setVcards(formattedCards);
        setFilteredVCards(formattedCards);
      } catch (error) {
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    projectId && fetchData();
  }, [projectId, refreshTrigger]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && exportButtonRef.current &&
          !exportMenuRef.current.contains(event.target as Node) &&
          !exportButtonRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyFilters = () => {
    let filtered = vcards.filter(v =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (activeFilters.status !== 'all') {
      filtered = filtered.filter(v =>
        activeFilters.status === 'active' ? v.is_active : !v.is_active
      );
    }

    if (activeFilters.backgroundType !== 'all') {
      filtered = filtered.filter(v =>
        v.background_type === activeFilters.backgroundType
      );
    }

    if (activeFilters.searchEngine !== 'all') {
      filtered = filtered.filter(v =>
        activeFilters.searchEngine === 'visible' ?
        v.search_engine_visibility : !v.search_engine_visibility
      );
    }

    if (activeFilters.branding !== 'all') {
      filtered = filtered.filter(v =>
        activeFilters.branding === 'branded' ?
        !v.remove_branding : v.remove_branding
      );
    }

    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(v => {
        const cardDate = v.createdAt ? new Date(v.createdAt) : new Date();
        const start = activeFilters.dateRange.start;
        const end = activeFilters.dateRange.end;

        return (!start || cardDate >= start) &&
               (!end || cardDate <= end);
      });
    }

    setFilteredVCards(filtered);
    setCurrentPage(1);
  };

  useEffect(() => applyFilters(), [searchTerm, activeFilters, vcards]);

  const handleFilterChange = (filterType: keyof ActiveFilters, value: any) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const resetFilters = () => {
    setActiveFilters({
      status: 'all',
      backgroundType: 'all',
      searchEngine: 'all',
      branding: 'all',
      dateRange: { start: undefined, end: undefined }
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => (
    activeFilters.status !== 'all' ||
    activeFilters.backgroundType !== 'all' ||
    activeFilters.searchEngine !== 'all' ||
    activeFilters.branding !== 'all' ||
    !!activeFilters.dateRange.start ||
    !!activeFilters.dateRange.end
  );

  const handleExport = async (format: 'csv' | 'json') => {
    if (exporting || filteredVCards.length === 0) return;

    try {
      setExporting(true);
      const data = filteredVCards.map(v => ({
        Name: v.name,
        Description: v.description,
        Status: v.is_active ? 'Active' : 'Inactive',
        URL: v.url,
        'Created At': v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'
      }));

      format === 'csv' ? exportToCSV(data, `project_vcards`) :
                       exportToJSON(data, `project_vcards`);

      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredVCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredVCards.length / cardsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleDeleteSuccess = () => setRefreshTrigger(prev => prev + 1);

  const breadcrumbLinks = [
    { name: "Projects", path: "/admin/project" },
    { name: "VCards", path: "" }
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading || !project) return <LoadingSpinner />;

  return (
    <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
      <ToastContainer position="top-right" autoClose={5000} />

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {project.name} VCards
          </h1>
          <p className="text-primary mt-1 sm:mt-2 text-sm sm:text-base">
            {filteredVCards.length} of {vcards.length} vCards shown
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full sm:w-48 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search VCards..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            <div className="relative" ref={exportButtonRef}>
              <button
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  exporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
              >
                <FaFileExport className="text-purple-500" />
              </button>

              {showExportMenu && (
                <div
                  ref={exportMenuRef}
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div className="py-1">
                    <button
                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => handleExport('csv')}
                    >
                      <FaFileCsv className="text-green-500" />
                      Export CSV
                    </button>
                    <button
                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      onClick={() => handleExport('json')}
                    >
                      <FaFileCode className="text-blue-500" />
                      Export JSON
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border ${
                  hasActiveFilters() ? 'border-red-500' : 'border-purple-500'
                } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter className={hasActiveFilters() ? 'text-red-500' : 'text-purple-500'} />
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
          </div>
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
          {activeFilters.status !== 'all' && (
            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Status: {activeFilters.status}
            </span>
          )}
          {activeFilters.backgroundType !== 'all' && (
            <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Background: {activeFilters.backgroundType}
            </span>
          )}
          {activeFilters.searchEngine !== 'all' && (
            <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Search: {activeFilters.searchEngine}
            </span>
          )}
          {activeFilters.branding !== 'all' && (
            <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Branding: {activeFilters.branding}
            </span>
          )}
          {(activeFilters.dateRange.start || activeFilters.dateRange.end) && (
            <span className="badge bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
              Date: {activeFilters.dateRange.start?.toLocaleDateString()} -{' '}
              {activeFilters.dateRange.end?.toLocaleDateString()}
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
          >
            <FaTimes className="mr-1" /> Clear all
          </button>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show">
        {filteredVCards.length > 0 ? (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence>
                {currentCards.map((vcard) => (
                  <motion.div
                    key={vcard.id}
                    variants={item}
                    layout
                    transition={{ duration: 0.3 }}
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
              <div className="flex justify-end mt-8">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  >
                    <FaAngleLeft />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => paginate(num)}
                      className={`pagination-page ${currentPage === num ? 'active' : ''}`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                  >
                    <FaAngleRight />
                  </button>
                </nav>
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
              title={hasActiveFilters() || searchTerm ? "No matching VCards" : "No VCards in project"}
              description={
                hasActiveFilters() || searchTerm
                ? "Try adjusting your search or filters"
                : "Start by creating a new VCard for this project"
              }
              actionText="Create VCard"
              actionLink={`/admin/vcard/create-vcard?projectId=${projectId}`}
              icon={<FaPlus />}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectVCardsPage;