import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FaSearch, FaFilter, FaFileExport } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QuoteService } from '../../services/api';
import { Quote } from '../../services/Quote';
import QuoteTable from '../../atoms/Tables/QuoteTable';
import DeleteConfirmationModal from '../../modals/DeleteConfirmationModal';
import ExportMenu from '../../cards/ExportMenu';
import Pagination from '../../atoms/Pagination/Pagination';
import FilterMenuQuote from '../../cards/FilterCardQuote';
import ActiveFiltersQuote from '../../cards/ActiveFiltersQuote';

const itemsPerPage = 10;

const ListQuotes: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    service: 'all',
    createdAtStart: '',
    createdAtEnd: ''
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const data = await QuoteService.getAll();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Fermer le menu d'export si on clique à l'extérieur
      if (showExportMenu && exportMenuRef.current && 
          !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }

      // Fermer le menu de filtre si on clique à l'extérieur
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

  const handleDelete = async (id: number) => {
    setShowDeleteModal(true);
    setSelectedQuote(quotes.find(q => q.id === id) || null);
  };

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];
    
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(q =>
        (q.name?.toLowerCase().includes(term) ||
        q.email?.toLowerCase().includes(term) ||
        q.service?.toString().toLowerCase().includes(term))
  )};
    
    if (activeFilters.service !== 'all') {
      result = result.filter(q => q.service === activeFilters.service);
    }

    if (activeFilters.createdAtStart || activeFilters.createdAtEnd) {
      result = result.filter(q => {
        if (!q.createdAt) return false;
        const quoteDate = new Date(q.createdAt).setHours(0,0,0,0);
        let afterStart = true;
        let beforeEnd = true;
        if (activeFilters.createdAtStart) {
          afterStart = quoteDate >= new Date(activeFilters.createdAtStart).setHours(0,0,0,0);
        }
        if (activeFilters.createdAtEnd) {
          beforeEnd = quoteDate <= new Date(activeFilters.createdAtEnd).setHours(0,0,0,0);
        }
        return afterStart && beforeEnd;
      });
    }

    return result;
  }, [quotes, search, activeFilters]);

  const hasActiveFilters = useMemo(() => {
    return (
      activeFilters.service !== 'all' ||
      activeFilters.createdAtStart !== '' ||
      activeFilters.createdAtEnd !== ''
    );
  }, [activeFilters]);

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const currentPageQuotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(start, start + itemsPerPage);
  }, [filteredQuotes, currentPage]);

  const handleExport = async (format: 'csv' | 'json') => {
    if (exporting || filteredQuotes.length === 0) return;
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const data = filteredQuotes.map(q => ({
        Name: q.name,
        Email: q.email,
        Service: q.service,
        Description: q.description,
        'Created At': q.createdAt || 'N/A'
      }));
      
      const date = new Date().toISOString().slice(0, 10);
      const filename = `quotes_export_${date}`;
      
      if (format === 'csv') {
        const csvRows = [
          Object.keys(data[0]).join(','),
          ...data.map(row => 
            Object.values(row).map(val => 
              typeof val === 'string' && val.includes(',') 
                ? `"${String(val).replace(/"/g, '""')}"` 
                : val
            ).join(',')
          )
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setActiveFilters({
      service: 'all',
      createdAtStart: '',
      createdAtEnd: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="p-4 pr-4 pb-4 pt-4 pl-2 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto mobile-no-left-padding">
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Quote Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">View and manage all quote requests in the system</p>
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search name, email, service..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
              value={search}
              onChange={e => { 
                setSearch(e.target.value); 
                setCurrentPage(1); 
              }}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
            {/* Bouton Filtre */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border ${
                  hasActiveFilters ? 'border-red-500' : 'border-purple-500'
                } hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                aria-label="Filter"
              >
                <FaFilter className={
                  hasActiveFilters ? 'text-red-500' : 'text-purple-500'
                } />
              </button>
              {showFilterMenu && (
                <div 
                  className="absolute right-0 w-[260px] z-20 mt-2"
                  ref={filterMenuRef}
                >
                  <FilterMenuQuote
                    activeFilters={activeFilters}
                    onFilterChange={(type, value) => {
                      setActiveFilters(prev => ({ ...prev, [type]: value }));
                      setCurrentPage(1);
                    }}
                    onReset={resetFilters}
                    onClose={() => setShowFilterMenu(false)}
                  />
                </div>
              )}
            </div>

            {/* Bouton Export */}
            <div className="relative" ref={exportMenuRef}>
              <button
                className={`p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 border border-purple-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  exporting || filteredQuotes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting || filteredQuotes.length === 0}
              >
                <FaFileExport className="text-purple-500 text-sm sm:text-base" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 w-[180px] z-20 mt-2">
                  <ExportMenu 
                    onExport={handleExport} 
                    exporting={exporting}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <ActiveFiltersQuote 
          activeFilters={{
            service: activeFilters.service,
            createdAtStart: activeFilters.createdAtStart,
            createdAtEnd: activeFilters.createdAtEnd
          }}
          resetFilters={resetFilters} 
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          {/* Spinner visuel si besoin */}
          <span>Loading...</span>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {search || hasActiveFilters 
            ? "No quotes match your search criteria" 
            : "No quotes found"}
        </div>
      ) : (
        <>
          <QuoteTable 
            quotes={currentPageQuotes} 
            deletingId={deletingId} 
            onDelete={handleDelete} 
          />
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingId(null);
              setSelectedQuote(null);
            }}
            onConfirm={async () => {
              if (!selectedQuote) return;
              setDeletingId(selectedQuote.id);
              try {
                await QuoteService.delete(selectedQuote.id);
                setQuotes(quotes => quotes.filter(q => q.id !== selectedQuote.id));
                toast.success('Quote deleted successfully');
              } catch (error) {
                toast.error('Failed to delete quote');
              } finally {
                setShowDeleteModal(false);
                setDeletingId(null);
                setSelectedQuote(null);
              }
            }}
            isLoading={deletingId === selectedQuote?.id}
            itemName={selectedQuote ? selectedQuote.name : ''}
          />
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListQuotes;