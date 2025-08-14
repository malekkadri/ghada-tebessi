import React from 'react';
import { 
  FaGlobe, 
  FaAddressCard
} from 'react-icons/fa';
import { CustomDomain } from '../../services/CustomDomain';

interface CustomDomainTableProps {
  domains: CustomDomain[];
  hasActiveFilters: boolean;
  onToggleStatus: (domainId: number, status: 'pending' | 'active' | 'failed' | 'blocked') => void;
  userRole?: string;
}

const renderStatusBadge = (status: string) => {
  const statusMap: Record<string, { className: string; icon: React.ReactNode }> = {
    active: {
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <span className="mr-1">✓</span>
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <span className="mr-1">⏱</span>
    },
    failed: {
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <span className="mr-1">✗</span>
    },
    blocked: {
      className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      icon: <span className="mr-1">⛔</span>
    }
  };

  const statusConfig = statusMap[status] || statusMap.blocked;
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
      {statusConfig.icon} {statusText}
    </span>
  );
};

const MobileCustomDomainItem: React.FC<{ 
  domain: CustomDomain; 
  onToggleStatus: (domainId: number, status: 'pending' | 'active' | 'failed' | 'blocked') => void;
  userRole?: string;
}> = ({ domain, onToggleStatus }) => {
  const userName = domain.vcard?.user?.name || 'N/A';
  const userEmail = domain.vcard?.user?.email || 'N/A';
  const vcardUrl = domain.vcard?.url ? `/vcard/${domain.vcard.url}` : '#';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 customdomains-mobile-item-reduced mobile-card-content-reduced min-w-0 w-full" style={{maxWidth: '100%', overflow: 'hidden'}}>
      <div className="flex items-start w-full customdomains-small-screen-fix mobile-card-header-reduced min-w-0" style={{maxWidth: '100%'}}>
        <div className="flex-shrink-0 mobile-card-logo-reduced mr-2 sm:mr-3 min-w-0">
          <div className="flex-shrink-0 mobile-card-logo-reduced rounded-full bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center">
            <FaGlobe className="text-white text-lg" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 customdomains-small-screen-fix" style={{maxWidth: 'calc(100% - 4rem)'}}>
          <div className="flex items-start justify-between w-full customdomains-small-screen-fix min-w-0">
            <div className="flex-1 min-w-0 mr-2 sm:mr-3 customdomains-mobile-header-section">
              <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 break-words overflow-hidden" style={{wordBreak: 'break-word', lineHeight: '1.3', maxWidth: '100%'}}>
                {domain.domain}
              </p>
              <div className="flex flex-col space-y-0.5 min-w-0">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                  vCard: {domain.vcard?.name || 'N/A'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words overflow-hidden" style={{wordBreak: 'break-word', maxWidth: '100%'}}>
                  {userName} • {userEmail}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-1 sm:space-y-1.5 customdomains-mobile-badges-section min-w-0 flex-shrink-0">
              {renderStatusBadge(domain.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 w-full customdomains-small-screen-fix min-w-0">
        <div className="flex flex-col space-y-3 w-full customdomains-small-screen-fix min-w-0">
          <div className="w-full min-w-0">
            <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 break-words" style={{wordBreak: 'break-word'}}>
              <span className="font-medium">Created:</span> {new Date(domain.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center w-full mobile-card-actions-reduced">
            <div className="flex-1 min-w-0 mr-3">
              <select
                value={domain.status}
                onChange={(e) => onToggleStatus(
                  domain.id, 
                  e.target.value as 'pending' | 'active' | 'failed' | 'blocked'
                )}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="failed">Failed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
              {domain.vcard?.url && (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DomainRow: React.FC<{ 
  domain: CustomDomain; 
  onToggleStatus: (domainId: number, status: 'pending' | 'active' | 'failed' | 'blocked') => void;
  userRole?: string;
}> = ({ domain, onToggleStatus }) => {
  const userName = domain.vcard?.user?.name || 'N/A';
  const userEmail = domain.vcard?.user?.email || 'N/A';
  const vcardUrl = domain.vcard?.url ? `/vcard/${domain.vcard.url}` : '#';
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <FaGlobe className="mr-2 text-blue-500" />
              {domain.domain}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {domain.vcard?.name || 'N/A'}
          </span>
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
        {renderStatusBadge(domain.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(domain.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2 items-center">
          {domain.vcard?.url && (
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
          
          <div className="relative inline-block text-left z-10">
            <select
              value={domain.status}
              onChange={(e) => onToggleStatus(
                domain.id, 
                e.target.value as 'pending' | 'active' | 'failed' | 'blocked'
              )}
              className={`ml-2 p-1.5 border rounded-md bg-white dark:bg-gray-800 text-sm w-full min-w-[100px] `}
              style={{ 
                appearance: 'auto',
                WebkitAppearance: 'menulist',
                MozAppearance: 'menulist'
              }}
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </td>
    </tr>
  );
};

const CustomDomainTable: React.FC<CustomDomainTableProps> = ({
  domains,
  hasActiveFilters,
  onToggleStatus,
  userRole
}) => {
  if (domains.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg shadow w-full">
        <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
          <div className="text-gray-400 text-3xl mb-2">🌐</div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters 
              ? "No domains match your filters" 
              : "No custom domains found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-xs">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Add your first custom domain to get started"}
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
                Domain
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                vCard
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
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
            {domains.map((domain) => (
              <DomainRow
                key={domain.id}
                domain={domain}
                onToggleStatus={onToggleStatus}
                userRole={userRole}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden w-full customdomains-force-no-margin customdomains-mobile-container-reduced customdomains-no-overflow customdomains-small-screen-fix">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden customdomains-mobile-narrow customdomains-small-screen-fix">
          {domains.map((domain) => (
            <MobileCustomDomainItem
              key={domain.id}
              domain={domain}
              onToggleStatus={onToggleStatus}
              userRole={userRole}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomDomainTable;