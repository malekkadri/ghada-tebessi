import React from 'react';
import { FaEye, FaImage, FaBan, FaCheck, FaAddressCard } from 'react-icons/fa';
import { VCard } from '../../services/vcard';
import { formatDate } from '../../services/dateUtils';
import { API_BASE_URL } from '../../config/constants';

interface ProjectVCardsTableProps {
  vcards: VCard[];
  hasActiveFilters: boolean;
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
}

const renderActiveBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Inactive
    </span>
  );
};

const renderBlockedBadge = (isBlocked: boolean) => {
  return isBlocked ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Blocked
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Allowed
    </span>
  );
};

const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

const MobileVCardItem: React.FC<{ 
  vcard: VCard; 
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
}> = ({ vcard, onToggleBlocked }) => {
  return (
    <div className="projectvcards-mobile-container-enlarged">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 projectvcards-mobile-item-enlarged mobile-card-content-enlarged">
        <div className="flex justify-between items-start mobile-card-header-enlarged">
          <div className="flex items-center space-x-3 flex-1 min-w-0 projectvcards-mobile-header-section">
            <div className="flex-shrink-0">
              {vcard.logo ? (
                <img 
                  src={getImageUrl(vcard.logo)} 
                  alt={`${vcard.name} logo`}
                  className="mobile-card-logo-enlarged rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="mobile-card-logo-enlarged rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaAddressCard className="text-white text-xl" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {vcard.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 projectvcards-mobile-card-description">
                VCard • Views: {vcard.views || 0}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1 projectvcards-mobile-badges-section">
            {renderActiveBadge(vcard.is_active)}
            {renderBlockedBadge(vcard.status)}
          </div>
        </div>

        <div className="projectvcards-mobile-description-full">
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
            <span className="font-medium">Created:</span> {vcard.createdAt ? formatDate(vcard.createdAt) : 'N/A'}
          </div>
        </div>

        <div className="projectvcards-mobile-actions-bottom mobile-card-actions-enlarged">
          <div className="flex justify-end space-x-2">
            <a 
              href={`/vcard/${vcard.url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center mobile-action-btn-enlarged border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              title="View vCard"
            >
              <FaEye className="mr-1" />
              View
            </a>
            <button
              onClick={() => onToggleBlocked(vcard.id, !vcard.status)}
              className={`inline-flex items-center mobile-action-btn-enlarged border rounded-md font-medium ${
                vcard.status 
                  ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-800/30' 
                  : 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-800/30'
              }`}
              title={vcard.status ? "Unblock" : "Block"}
            >
              {vcard.status ? <FaCheck className="mr-1" /> : <FaBan className="mr-1" />}
              {vcard.status ? 'Unblock' : 'Block'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VCardRow: React.FC<{ 
  vcard: VCard; 
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
}> = ({ vcard, onToggleBlocked }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex justify-center">
        {vcard.logo ? (
          <div className="flex-shrink-0 h-10 w-10">
            <img 
              src={getImageUrl(vcard.logo)} 
              alt={`${vcard.name} logo`}
              className="h-10 w-10 rounded-full object-cover border border-gray-200 block"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaImage className="text-sm" />
          </div>
        )}
      </div>
    </td>
    
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex justify-center">
        {vcard.favicon ? (
          <div className="flex-shrink-0 h-8 w-8">
            <img 
              src={getImageUrl(vcard.favicon)} 
              alt={`${vcard.name} favicon`}
              className="h-8 w-8 rounded-full object-cover border border-gray-200 block"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaImage className="text-xs" />
          </div>
        )}
      </div>
    </td>
    
    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
      <div className="truncate max-w-[150px]">
        {vcard.name}
      </div>
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {renderActiveBadge(vcard.is_active)}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {renderBlockedBadge(vcard.status)}
    </td>
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {vcard.createdAt ? formatDate(vcard.createdAt) : 'N/A'}
    </td>
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {vcard.views || 0}
    </td>
    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex justify-end space-x-2">
        <a 
          href={`/vcard/${vcard.url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title="View vCard"
        >
          <FaEye className="inline" />
        </a>
        <button
          onClick={() => onToggleBlocked(vcard.id, !vcard.status)}
          className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
            vcard.status 
              ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
              : 'text-red-600 hover:text-red-900 dark:text-red-400'
          }`}
          title={vcard.status ? "Unblock" : "Block"}
        >
          {vcard.status ? <FaCheck /> : <FaBan />}
        </button>
      </div>
    </td>
  </tr>
);

const ProjectVCardsTable: React.FC<ProjectVCardsTableProps> = ({
  vcards,
  hasActiveFilters,
  onToggleBlocked
}) => {
  if (vcards.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg shadow w-full">
        <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
          <div className="text-gray-400 text-3xl mb-2">📇</div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters 
              ? "No VCards match your filters" 
              : "No VCards found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-xs">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Create your first VCard to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="block md:hidden">
        <div className="projectvcards-mobile-container">
          {vcards.map((vcard) => (
            <MobileVCardItem
              key={vcard.id}
              vcard={vcard}
              onToggleBlocked={onToggleBlocked}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full max-w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Logo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Favicon
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Blocked
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {vcards.map((vcard) => (
              <VCardRow
                key={vcard.id}
                vcard={vcard}
                onToggleBlocked={onToggleBlocked}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectVCardsTable;