import React from 'react';
import { Quote } from '../../services/Quote';
import { FaTrash } from 'react-icons/fa';

interface QuoteTableProps {
  quotes: Quote[];
  deletingId: number | null;
  onDelete: (id: number) => void;
}

const QuoteTable: React.FC<QuoteTableProps> = ({ quotes, deletingId, onDelete }) => {
  if (quotes.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">No quotes found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{quote.name}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{quote.email}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{quote.service}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{quote.description}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <button
                  className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                  title="Delete"
                  onClick={() => onDelete(quote.id)}
                  disabled={deletingId === quote.id}
                >
                  <FaTrash className="inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuoteTable;
