import { FaCopy, FaLock, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ApiKey } from '../services/ApiKey';
import { useState } from 'react';
import DeleteConfirmationModal from '../modals/DeleteConfirmationApiKeyModal';

interface ApiKeyListCardProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

const ApiKeyListCard: React.FC<ApiKeyListCardProps> = ({ apiKeys, isLoading, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Key prefix copied to clipboard');
  };

  const handleDeleteClick = (id: number) => {
    setSelectedKeyId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedKeyId) {
      onDelete(selectedKeyId);
      setShowDeleteModal(false);
      setSelectedKeyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 dark:shadow-gray-900/50 backdrop-blur-lg border border-gray-200 dark:border-gray-800">
        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            📋
          </div>
          Active API Keys
        </h4>
       
        {apiKeys.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No API keys found. Generate your first key above.
          </p>
        ) : (
          <div className="overflow-x-auto mobile:overflow-x-scroll mobile:max-w-[calc(70vw-3rem)]">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
              <thead>
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Key Prefix</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Created</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {apiKeys.map((key) => (
                  <tr 
                    key={key.id} 
                    className={key.isDisabled ? 'opacity-50 bg-gray-50 dark:bg-gray-900/50' : ''}
                  >
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {key.name}
                      {key.isDisabled && (
                        <span className="ml-2 text-red-500" title="Disabled by plan limit">
                          <FaLock className="inline-block" />
                        </span>
                      )}
                    </td>
                    
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {key.prefix}...
                        <button
                          type="button"
                          onClick={() => handleCopy(key.prefix)}
                          className={`p-1 rounded-md ${
                            key.isDisabled || !key.isActive
                              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }`}
                          disabled={key.isDisabled || !key.isActive}
                        >
                          <FaCopy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          key.isDisabled
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            : key.isActive
                              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                              : 'bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {key.isDisabled ? 'Disabled' : (key.isActive ? 'Active' : 'Revoked')}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(key.id)}
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <FaTrashAlt className="h-4 w-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete API Key"
        message="Are you sure you want to delete this API key? This action cannot be undone."
      />
    </>
  );
};

export default ApiKeyListCard;