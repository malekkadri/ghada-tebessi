import React from 'react';
import { FaFileCsv, FaFileCode, FaSpinner } from 'react-icons/fa';

interface ExportMenuProps {
  onExport: (format: 'csv' | 'json') => void;
  exporting: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, exporting }) => (
  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
    <div className="py-1">
      <button
        className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 ${
          exporting 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        onClick={() => onExport('csv')}
        disabled={exporting}
      >
        {exporting ? (
          <FaSpinner className="animate-spin text-blue-500" />
        ) : (
          <FaFileCsv className="text-green-500" />
        )}
        <span>Export as CSV</span>
      </button>
      <button
        className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 ${
          exporting 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        onClick={() => onExport('json')}
        disabled={exporting}
      >
        {exporting ? (
          <FaSpinner className="animate-spin text-blue-500" />
        ) : (
          <FaFileCode className="text-blue-500" />
        )}
        <span>Export as JSON</span>
      </button>
    </div>
  </div>
);

export default ExportMenu;