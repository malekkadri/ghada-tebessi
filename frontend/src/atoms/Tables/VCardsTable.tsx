// VCardsTable.tsx
import React from 'react';
import { FaEye, FaImage, FaThLarge, FaBan, FaCheck } from 'react-icons/fa';
import { VCardWithUser } from '../../services/api';
import { formatDate } from '../../services/dateUtils';
import { API_BASE_URL } from '../../config/constants';

interface VCardsTableProps {
  vcards: VCardWithUser[];
  hasActiveFilters: boolean;
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
  onViewBlocks: (vcardId: string) => void;
}

const renderActiveBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Inactive
    </span>
  );
};

const renderBlockedBadge = (isBlocked: boolean) => {
  return isBlocked ? (
    <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Blocked
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Allowed
    </span>
  );
};

const VCardRow: React.FC<{ 
  vcard: VCardWithUser; 
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
  onViewBlocks: (vcardId: string) => void;
}> = ({ vcard, onToggleBlocked, onViewBlocks }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap">
      <div className="flex justify-center">
        {vcard.logo ? (
          <div className="flex-shrink-0 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8">
            <img 
              src={`${API_BASE_URL}${vcard.logo}`} 
              alt={`${vcard.name} logo`}
              className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8 rounded-full object-cover border border-gray-200"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaImage className="text-[10px] sm:text-xs lg:text-[10px] xl:text-xs" />
          </div>
        )}
      </div>
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap hidden sm:table-cell">
      <div className="flex justify-center">
        {vcard.favicon ? (
          <div className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6">
            <img 
              src={`${API_BASE_URL}${vcard.favicon}`} 
              alt={`${vcard.name} favicon`}
              className="h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6 rounded-full object-cover border border-gray-200"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaImage className="text-[10px] sm:text-xs lg:text-[10px] xl:text-xs" />
          </div>
        )}
      </div>
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm font-medium text-gray-900 dark:text-white">
      <div className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[80px] xl:max-w-[150px]">
        {vcard.name}
      </div>
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm text-gray-500 dark:text-gray-400">
      <div className="flex flex-col space-y-0.5">
        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[90px] xl:max-w-[150px] text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm">
          {vcard.Users?.name || 'N/A'}
        </span>
        <span className="text-gray-500 dark:text-gray-400 truncate max-w-[80px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-[90px] xl:max-w-[150px] text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs">
          {vcard.Users?.email || 'N/A'}
        </span>
      </div>
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap hidden sm:table-cell">
      {renderActiveBadge(vcard.is_active)}
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap">
      {renderBlockedBadge(vcard.status)}
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
      {vcard.createdAt ? formatDate(vcard.createdAt) : 'N/A'}
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
      {vcard.views || 0}
    </td>
    
    <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-right text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm font-medium">
      <div className="flex justify-end space-x-0.5 sm:space-x-1 lg:space-x-0.5 xl:space-x-1">
        <a 
          href={`/vcard/${vcard.url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-0.5 sm:p-1 lg:p-0.5 xl:p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title="View vCard"
        >
          <FaEye className="text-xs sm:text-sm lg:text-xs xl:text-sm" />
        </a>
        <button
          onClick={() => onToggleBlocked(vcard.id, !vcard.status)}
          className={`p-0.5 sm:p-1 lg:p-0.5 xl:p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
            vcard.status 
              ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
              : 'text-red-600 hover:text-red-900 dark:text-red-400'
          }`}
          title={vcard.status ? "Unblock" : "Block"}
        >
          {vcard.status ? <FaCheck className="text-xs sm:text-sm lg:text-xs xl:text-sm" /> : <FaBan className="text-xs sm:text-sm lg:text-xs xl:text-sm" />}
        </button>
        <button
          onClick={() => onViewBlocks(vcard.id)}
          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-0.5 sm:p-1 lg:p-0.5 xl:p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title="View blocks"
        >
          <FaThLarge className="text-xs sm:text-sm lg:text-xs xl:text-sm" />
        </button>
      </div>
    </td>
  </tr>
);

const MobileVCardItem: React.FC<{ 
  vcard: VCardWithUser; 
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
  onViewBlocks: (vcardId: string) => void;
}> = ({ vcard, onToggleBlocked, onViewBlocks }) => (
  <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 vcards-mobile-item-narrow vcards-ultra-compact vcards-mobile-reduce-right">
    <div className="flex items-start w-full vcards-small-screen-fix vcards-mobile-reduce-right">
      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
        {vcard.logo ? (
          <img 
            src={`${API_BASE_URL}${vcard.logo}`} 
            alt={`${vcard.name} logo`}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaImage className="text-xs sm:text-sm" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 vcards-small-screen-fix">
        <div className="flex items-start justify-between w-full vcards-small-screen-fix">
          <div className="flex-1 min-w-0 mr-2 sm:mr-3">
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate mb-1">
              {vcard.name}
            </p>
            <div className="flex flex-col space-y-0.5">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                {vcard.Users?.name || 'N/A'}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                {vcard.Users?.email || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-1 sm:space-y-1.5 flex-shrink-0">
            {renderActiveBadge(vcard.is_active)}
            {renderBlockedBadge(vcard.status)}
          </div>
        </div>
      </div>
    </div>

    <div className="mt-2 sm:mt-3 w-full vcards-small-screen-fix">
      <div className="flex justify-between items-start w-full vcards-small-screen-fix">
        <div className="flex flex-col space-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-1 min-w-0">
          <span className="truncate">
            <span className="font-medium">Views:</span> {vcard.views || 0}
          </span>
          <span className="truncate">
            <span className="font-medium">Created:</span> {vcard.createdAt ? formatDate(vcard.createdAt) : 'N/A'}
          </span>
        </div>
        
        <div className="flex space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
          <a 
            href={`/vcard/${vcard.url}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 sm:p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="View vCard"
          >
            <FaEye className="text-xs sm:text-sm" />
          </a>
          <button
            onClick={() => onToggleBlocked(vcard.id, !vcard.status)}
            className={`p-1 sm:p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
              vcard.status 
                ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
                : 'text-red-600 hover:text-red-900 dark:text-red-400'
            }`}
            title={vcard.status ? "Unblock" : "Block"}
          >
            {vcard.status ? <FaCheck className="text-xs sm:text-sm" /> : <FaBan className="text-xs sm:text-sm" />}
          </button>
          <button
            onClick={() => onViewBlocks(vcard.id)}
            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 sm:p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="View blocks"
          >
            <FaThLarge className="text-xs sm:text-sm" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const VCardsTable: React.FC<VCardsTableProps> = ({
  vcards,
  hasActiveFilters,
  onToggleBlocked,
  onViewBlocks
}) => {
  if (vcards.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg shadow w-full">
        <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
          <div className="text-gray-400 text-2xl mb-1">📇</div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters 
              ? "No VCards match your filters" 
              : "No VCards found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-[10px] sm:text-xs px-2">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Create your first VCard to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 p-0 vcards-mobile-container vcards-no-overflow vcards-small-screen-fix">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 vcards-table-medium">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Logo
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Favicon
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Status
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Blocked
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Created
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Views
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-right text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                onViewBlocks={onViewBlocks}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden w-full m-0 p-0 vcards-force-no-margin vcards-no-overflow vcards-small-screen-fix">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden vcards-mobile-narrow vcards-small-screen-fix vcards-mobile-reduce-right">
          {vcards.map((vcard) => (
            <MobileVCardItem
              key={vcard.id}
              vcard={vcard}
              onToggleBlocked={onToggleBlocked}
              onViewBlocks={onViewBlocks}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VCardsTable;