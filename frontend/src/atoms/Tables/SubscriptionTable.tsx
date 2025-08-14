import React from 'react';
import { FaUser, FaBan } from 'react-icons/fa';
import EmptyState from '../../cards/EmptyState';
import { Subscriptions } from '../../services/Subscription';
import Pagination from '../Pagination/Pagination';

interface SubscriptionTableProps {
  subscriptions: Subscriptions[];
  hasActiveFilters: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCancelSubscription: (subscriptionId: number) => void;
}

const renderStatusBadge = (status: string) => {
  const statusMap: Record<string, { className: string; icon: React.ReactNode }> = {
    active: {
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <span className="mr-1">✓</span>
    },
    expired: {
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <span className="mr-1">⌛</span>
    },
    canceled: {
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <span className="mr-1">✗</span>
    },
    pending: {
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: <span className="mr-1">⏱</span>
    }
  };

  const statusConfig = statusMap[status] || statusMap.pending;
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
      {statusConfig.icon} {statusText}
    </span>
  );
};

const SubscriptionRow: React.FC<{ 
  subscription: Subscriptions; 
  onCancelSubscription: (subscriptionId: number) => void;
}> = ({ subscription, onCancelSubscription }) => {
  const userName = subscription.user?.name || 'N/A';
  const userEmail = subscription.user?.email || 'N/A';
  const planName = subscription.plan?.name || 'N/A';
  const planPrice = subscription.plan?.price ? `$${subscription.plan.price}` : 'N/A';
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
              {userName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
              {userEmail}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white truncate max-w-[120px]">{planName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{planPrice}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderStatusBadge(subscription.status)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(subscription.start_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(subscription.end_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
        {subscription.status === 'active' && (
          <button
            onClick={() => onCancelSubscription(subscription.id)}
            className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
};

const MobileSubscriptionItem: React.FC<{ 
  subscription: Subscriptions; 
  onCancelSubscription: (subscriptionId: number) => void;
}> = ({ subscription, onCancelSubscription }) => {
  const userName = subscription.user?.name || 'N/A';
  const userEmail = subscription.user?.email || 'N/A';
  const planName = subscription.plan?.name || 'N/A';
  const planPrice = subscription.plan?.price ? `$${subscription.plan.price}` : 'N/A';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 subscriptions-mobile-item-reduced mobile-card-content-reduced">
      <div className="flex items-start w-full subscriptions-small-screen-fix mobile-card-header-reduced">
        <div className="flex-shrink-0 mobile-card-logo-reduced mr-2 sm:mr-3">
          <div className="mobile-card-logo-reduced rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <FaUser className="text-white text-sm sm:text-base" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 subscriptions-small-screen-fix">
          <div className="flex items-start justify-between w-full subscriptions-small-screen-fix">
            <div className="flex-1 min-w-0 subscriptions-mobile-header-section">
              <div className="flex items-start justify-between w-full mb-2">
                <p className="user-name text-base sm:text-lg font-medium text-gray-900 dark:text-white break-words">
                  {userName}
                </p>
                <div className="flex flex-col space-y-0.5 sm:space-y-0.5 subscriptions-mobile-badges-section flex-shrink-0 ml-2">
                  {renderStatusBadge(subscription.status)}
                </div>
              </div>
              <div className="flex flex-col space-y-0.5 w-full">
                <p className="user-email text-sm sm:text-base text-gray-600 dark:text-gray-300 w-full">
                  {userEmail}
                </p>
                <p className="plan-info text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full">
                  Plan: {planName} • {planPrice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full subscriptions-small-screen-fix">
        <div className="flex flex-col space-y-1 w-full subscriptions-small-screen-fix">
          <div className="subscriptions-mobile-description-full w-full">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Start Date:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">End Date:</span>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {subscription.status === 'active' && (
            <div className="flex justify-end w-full mobile-card-actions-reduced">
              <div className="flex space-x-2 sm:space-x-3 flex-shrink-0">
                <button
                  onClick={() => onCancelSubscription(subscription.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mobile-action-btn-reduced rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                  title="Cancel Subscription"
                >
                  <FaBan className="text-sm sm:text-base" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  hasActiveFilters,
  currentPage,
  totalPages,
  onPageChange,
  onCancelSubscription
}) => {
  if (subscriptions.length === 0) {
    return (
      <div className="w-full m-0 p-0 subscriptions-mobile-container subscriptions-no-overflow subscriptions-small-screen-fix">
        <div className="overflow-x-auto rounded-lg shadow w-full">
          <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
            <EmptyState
              title={hasActiveFilters ? "No subscriptions match your filters" : "No subscriptions found"}
              description={hasActiveFilters
                ? "Try adjusting your search or filters"
                : "There are no subscriptions to display"}
              actionText=""
              icon={<span className="text-4xl mx-auto text-gray-400 mb-4">📊</span>}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 p-0 subscriptions-mobile-container subscriptions-no-overflow subscriptions-small-screen-fix">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
                User
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[150px]">
                Plan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                Start Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                End Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
                onCancelSubscription={onCancelSubscription}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden w-full subscriptions-force-no-margin subscriptions-mobile-container-reduced subscriptions-no-overflow subscriptions-small-screen-fix">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden subscriptions-mobile-narrow subscriptions-small-screen-fix">
          {subscriptions.map((subscription) => (
            <MobileSubscriptionItem
              key={subscription.id}
              subscription={subscription}
              onCancelSubscription={onCancelSubscription}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {subscriptions.length > 0 && totalPages > 1 && (
        <div className="mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionTable;