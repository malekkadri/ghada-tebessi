import React from 'react';
import { FaBan, FaCheck, FaAddressCard, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Pixel } from '../../services/Pixel';

interface PixelTableProps {
  pixels: Pixel[];
  hasActiveFilters: boolean;
  onToggleBlocked: (pixelId: string, isBlocked: boolean) => void;
}

const renderStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      <FaToggleOn className="mr-1" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
      <FaToggleOff className="mr-1" /> Inactive
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

const MobilePixelItem: React.FC<{ 
  pixel: Pixel; 
  onToggleBlocked: (pixelId: string, isBlocked: boolean) => void;
}> = ({ pixel, onToggleBlocked }) => {
  const userName = pixel.vcard?.user?.name || 'N/A';
  const userEmail = pixel.vcard?.user?.email || 'N/A';
  const vcardUrl = pixel.vcard?.url ? `/vcard/${pixel.vcard.url}` : '#';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pixels-mobile-item-reduced mobile-card-content-reduced min-w-0 w-full" style={{maxWidth: '100%', overflow: 'hidden'}}>
      <div className="flex items-start w-full pixels-small-screen-fix mobile-card-header-reduced min-w-0" style={{maxWidth: '100%'}}>
        <div className="flex-shrink-0 mobile-card-logo-reduced mr-2 sm:mr-3 min-w-0">
          <div className="flex-shrink-0 mobile-card-logo-reduced rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <FaAddressCard className="text-white text-lg" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 pixels-small-screen-fix" style={{maxWidth: 'calc(100% - 4rem)'}}>
          <div className="flex items-start justify-between w-full pixels-small-screen-fix min-w-0">
            <div className="flex-1 min-w-0 mr-2 sm:mr-3 pixels-mobile-header-section">
              <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 break-words overflow-hidden" style={{wordBreak: 'break-word', lineHeight: '1.3', maxWidth: '100%'}}>
                {pixel.name || 'Unnamed Pixel'}
              </p>
              <div className="flex flex-col space-y-0.5 min-w-0">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                  {userName}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                  {userEmail}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-1 sm:space-y-1.5 pixels-mobile-badges-section min-w-0 flex-shrink-0">
              {renderStatusBadge(pixel.is_active)}
              {renderBlockedBadge(pixel.is_blocked)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 w-full pixels-small-screen-fix min-w-0">
        <div className="flex flex-col space-y-3 w-full pixels-small-screen-fix min-w-0">
          <div className="w-full min-w-0">
            <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 break-words" style={{wordBreak: 'break-word'}}>
              <span className="font-medium">Created:</span> {new Date(pixel.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-end w-full mobile-card-actions-reduced">
            <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
              {pixel.vcard?.url && (
                <a
                  href={vcardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mobile-action-btn-reduced rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                  title="Open vCard"
                >
                  <FaAddressCard className="text-sm sm:text-base" />
                </a>
              )}
              <button
                onClick={() => onToggleBlocked(pixel.id, !pixel.is_blocked)}
                className={`mobile-action-btn-reduced rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 ${
                  pixel.is_blocked 
                    ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
                    : 'text-red-600 hover:text-red-900 dark:text-red-400'
                }`}
                title={pixel.is_blocked ? "Unblock" : "Block"}
              >
                {pixel.is_blocked ? <FaCheck className="text-sm sm:text-base" /> : <FaBan className="text-sm sm:text-base" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PixelRow: React.FC<{ 
  pixel: Pixel; 
  onToggleBlocked: (pixelId: string, isBlocked: boolean) => void;
}> = ({ pixel, onToggleBlocked }) => {
  const userName = pixel.vcard?.user?.name || 'N/A';
  const userEmail = pixel.vcard?.user?.email || 'N/A';
  const vcardUrl = pixel.vcard?.url ? `/vcard/${pixel.vcard.url}` : '#';
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {pixel.name || 'Unnamed Pixel'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {userName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {userEmail}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {renderStatusBadge(pixel.is_active)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {renderBlockedBadge(pixel.is_blocked)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(pixel.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          {pixel.vcard?.url && (
            <a
              href={vcardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-purple-600 hover:text-purple-900 dark:text-purple-400"
              title="Open vCard"
            >
              <FaAddressCard />
            </a>
          )}
          
          <button
            onClick={() => onToggleBlocked(pixel.id, !pixel.is_blocked)}
            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
              pixel.is_blocked 
                ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
                : 'text-red-600 hover:text-red-900 dark:text-red-400'
            }`}
            title={pixel.is_blocked ? "Unblock" : "Block"}
          >
            {pixel.is_blocked ? <FaCheck /> : <FaBan />}
          </button>
        </div>
      </td>
    </tr>
  );
};

const PixelTable: React.FC<PixelTableProps> = ({
  pixels,
  hasActiveFilters,
  onToggleBlocked
}) => {
  if (pixels.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg shadow w-full">
        <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
          <div className="text-gray-400 text-3xl mb-2">📊</div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters 
              ? "No pixels match your filters" 
              : "No pixels found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-xs">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Create your first pixel to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full max-w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pixel
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Blocked
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {pixels.map((pixel) => (
              <PixelRow
                key={pixel.id}
                pixel={pixel}
                onToggleBlocked={onToggleBlocked}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden w-full pixels-force-no-margin pixels-mobile-container-reduced pixels-no-overflow pixels-small-screen-fix">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden pixels-mobile-narrow pixels-small-screen-fix">
          {pixels.map((pixel) => (
            <MobilePixelItem
              key={pixel.id}
              pixel={pixel}
              onToggleBlocked={onToggleBlocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PixelTable;