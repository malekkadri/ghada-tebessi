import React from 'react';
import EmptyState from '../../cards/EmptyState';
import { ApiKey } from '../../services/ApiKey';
import { FaToggleOn, FaToggleOff, FaKey } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  hasActiveFilters: boolean;
  onToggleApiKey: (apiKeyId: number) => Promise<void>;
}

const renderStatusBadge = (status: string) => {
  let className = "";
  let text = status;

  if (status === 'Active') {
    className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  } else if (status === 'Disabled') {
    className = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  } else {
    className = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
};

const ApiKeyRow: React.FC<{ 
  apiKey: ApiKey; 
  onToggleApiKey: (apiKeyId: number) => Promise<void>;
}> = ({ apiKey, onToggleApiKey }) => {
  const userName = apiKey.Users?.name || 'N/A';
  const userEmail = apiKey.Users?.email || 'N/A';
  const status = apiKey.isActive ? 'Active' : 'Disabled';
  
  const handleClick = async () => {
    const toastId = toast.loading('Updating API key status...');
    try {
      await onToggleApiKey(apiKey.id);
      
      toast.update(toastId, {
        render: `API key ${apiKey.isActive ? 'disabled' : 'enabled'} successfully`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: 'Failed to update API key status',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
              {apiKey.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {apiKey.prefix}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{userName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{userEmail}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderStatusBadge(status)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(apiKey.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
        <button
          onClick={handleClick}
          className={`p-2 rounded-full transition-colors ${
            apiKey.isActive
              ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20'
              : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20'
          }`}
          title={apiKey.isActive ? "Disable key" : "Enable key"}
        >
          {apiKey.isActive ? (
            <FaToggleOn className="w-5 h-5" />
          ) : (
            <FaToggleOff className="w-5 h-5" />
          )}
        </button>
      </td>
    </tr>
  );
};

const MobileApiKeyItem: React.FC<{ 
  apiKey: ApiKey; 
  onToggleApiKey: (apiKeyId: number) => Promise<void>;
}> = ({ apiKey, onToggleApiKey }) => {
  const userName = apiKey.Users?.name || 'N/A';
  const userEmail = apiKey.Users?.email || 'N/A';
  const status = apiKey.isActive ? 'Active' : 'Disabled';
  
  const handleClick = async () => {
    const toastId = toast.loading('Updating API key status...');
    try {
      await onToggleApiKey(apiKey.id);
      
      toast.update(toastId, {
        render: `API key ${apiKey.isActive ? 'disabled' : 'enabled'} successfully`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: 'Failed to update API key status',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 apikeys-mobile-item-reduced mobile-card-content-reduced min-w-0 w-full" style={{maxWidth: '100%', overflow: 'hidden'}}>
      <div className="flex items-start w-full apikeys-small-screen-fix mobile-card-header-reduced min-w-0" style={{maxWidth: '100%'}}>
        <div className="flex-shrink-0 mobile-card-logo-reduced mr-2 sm:mr-3 min-w-0">
          <div className="flex-shrink-0 mobile-card-logo-reduced rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FaKey className="text-white text-sm sm:text-base" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 apikeys-small-screen-fix" style={{maxWidth: 'calc(100% - 4rem)'}}>
          <div className="flex items-start justify-between w-full apikeys-small-screen-fix min-w-0">
            <div className="flex-1 min-w-0 mr-2 sm:mr-3 apikeys-mobile-header-section">
              <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 break-words overflow-hidden" style={{wordBreak: 'break-word', lineHeight: '1.3', maxWidth: '100%'}}>
                {apiKey.name}
              </p>
              <div className="flex flex-col space-y-0.5 min-w-0">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                  {apiKey.prefix}...
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                  User: {userName}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                  {userEmail}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-1 sm:space-y-1.5 apikeys-mobile-badges-section min-w-0 flex-shrink-0">
              {renderStatusBadge(status)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 w-full apikeys-small-screen-fix min-w-0">
        <div className="flex flex-col space-y-3 w-full apikeys-small-screen-fix min-w-0">
          <div className="w-full min-w-0">
            <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 break-words" style={{wordBreak: 'break-word'}}>
              <span className="font-medium">Created:</span> {new Date(apiKey.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-end w-full mobile-card-actions-reduced">
            <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={handleClick}
                className={`mobile-action-btn-reduced rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 ${
                  apiKey.isActive
                    ? 'text-red-500 hover:text-red-900 dark:text-red-400'
                    : 'text-green-500 hover:text-green-900 dark:text-green-400'
                }`}
                title={apiKey.isActive ? "Disable key" : "Enable key"}
              >
                {apiKey.isActive ? (
                  <FaToggleOn className="text-sm sm:text-base" />
                ) : (
                  <FaToggleOff className="text-sm sm:text-base" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApiKeyTable: React.FC<ApiKeyTableProps> = ({
  apiKeys,
  hasActiveFilters,
  onToggleApiKey
}) => {
  if (apiKeys.length === 0) {
    return (
      <div className="w-full m-0 p-0 apikeys-mobile-container apikeys-no-overflow apikeys-small-screen-fix">
        <div className="overflow-x-auto rounded-lg shadow w-full">
          <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
            <EmptyState
              title={hasActiveFilters ? "No API keys match your filters" : "No API keys found"}
              description={hasActiveFilters
                ? "Try adjusting your search or filters"
                : "There are no API keys to display"}
              actionText=""
              icon={<span className="text-4xl mx-auto text-gray-400 mb-4">🔑</span>}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 p-0 apikeys-mobile-container apikeys-no-overflow apikeys-small-screen-fix">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
                Key Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
                User
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[150px]">
                Created At
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys.map((apiKey) => (
              <ApiKeyRow
                key={apiKey.id}
                apiKey={apiKey}
                onToggleApiKey={onToggleApiKey}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden w-full apikeys-force-no-margin apikeys-mobile-container-reduced apikeys-no-overflow apikeys-small-screen-fix">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden apikeys-mobile-narrow apikeys-small-screen-fix">
          {apiKeys.map((apiKey) => (
            <MobileApiKeyItem
              key={apiKey.id}
              apiKey={apiKey}
              onToggleApiKey={onToggleApiKey}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyTable;