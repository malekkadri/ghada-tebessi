import React from 'react';
import { FaUser, FaUserSlash, FaUserCheck, FaCrown, FaUserTie, FaUserAlt } from 'react-icons/fa';
import { User } from '../../services/user';
import { API_BASE_URL } from '../../config/constants';

interface UserTableProps {
  filteredUsers: User[];
  hasActiveFilters: boolean;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onChangePlan: (userId: string, planName: string) => void;
}

const getPlanInfo = (user: User) => {
  const currentPlan = user.activeSubscription?.plan?.name?.toLowerCase() || 'free';
  
  const planConfig: Record<string, {
    current: string;
    alternatives: Array<{
      name: string;
      label: string;
      shortLabel: string;
      color: string;
    }>;
  }> = {
    free: {
      current: 'free',
      alternatives: [
        { name: 'basic', label: 'Basic Plan', shortLabel: 'Basic', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800' },
        { name: 'pro', label: 'Pro Plan', shortLabel: 'Pro', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800' }
      ]
    },
    basic: {
      current: 'basic',
      alternatives: [
        { name: 'free', label: 'Free Plan', shortLabel: 'Free', color: 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800' },
        { name: 'pro', label: 'Pro Plan', shortLabel: 'Pro', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800' }
      ]
    },
    pro: {
      current: 'pro',
      alternatives: [
        { name: 'free', label: 'Free Plan', shortLabel: 'Free', color: 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800' },
        { name: 'basic', label: 'Basic Plan', shortLabel: 'Basic', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800' }
      ]
    }
  };

  return planConfig[currentPlan] || planConfig.free;
};

const renderRoleBadge = (role?: string) => {
  switch (role) {
    case 'superAdmin':
      return (
        <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <FaCrown className="mr-1" /> Super Admin
        </span>
      );
    case 'admin':
      return (
        <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <FaUserTie className="mr-1" /> Admin
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <FaUserAlt className="mr-1" /> User
        </span>
      );
  }
};

const renderStatusBadge = (isActive?: boolean) => {
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

const renderPlanBadge = (subscription?: User['activeSubscription']) => {
  if (!subscription || !subscription.plan) {
    return (
      <span className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-0.5 lg:px-1 lg:py-0.5 xl:px-2 xl:py-0.5 rounded-full text-xs sm:text-xs lg:text-[10px] xl:text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        No plan
      </span>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm">
        {subscription.plan.name}
      </span>
      <span className="text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs text-gray-500 dark:text-gray-400">
        ${subscription.plan.price}/mo
      </span>
    </div>
  );
};

const UserRow: React.FC<{ 
  user: User; 
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onChangePlan: (userId: string, planName: string) => void;
}> = ({ user, onToggleStatus, onChangePlan }) => {
  const { alternatives } = getPlanInfo(user);
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-6 lg:w-6 xl:h-10 xl:w-10">
            {user.avatar ? (
              <img 
                className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-6 lg:w-6 xl:h-10 xl:w-10 rounded-full object-cover border border-gray-200" 
                src={`${API_BASE_URL}${user.avatar}`} 
                alt={user.name || 'User'} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-6 lg:w-6 xl:h-10 xl:w-10 flex items-center justify-center text-gray-400">
                <FaUser className="text-[10px] sm:text-xs lg:text-[10px] xl:text-xs" />
              </div>
            )}
          </div>
          <div className="ml-2 sm:ml-4">
            <div className="text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[60px] sm:max-w-[80px] md:max-w-[120px] lg:max-w-[60px] xl:max-w-[120px]">
              {user.name || 'Unnamed User'}
            </div>
            <div className="text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs text-gray-500 dark:text-gray-400 truncate max-w-[60px] sm:max-w-[80px] md:max-w-[120px] lg:max-w-[60px] xl:max-w-[120px]">
              {user.email || 'No email'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap hidden sm:table-cell">
        {renderRoleBadge(user.role)}
      </td>
      <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap">
        {renderStatusBadge(user.isActive)}
      </td>
      <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap hidden md:table-cell">
        {renderPlanBadge(user.activeSubscription)}
      </td>
      <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-1.5 xl:py-4 whitespace-nowrap text-right text-xs sm:text-sm md:text-sm lg:text-xs xl:text-sm font-medium">
        <div className="flex justify-end space-x-0.5 sm:space-x-1 lg:space-x-0.5 xl:space-x-1">
          {user.role !== 'superAdmin' && (
            <button
              onClick={() => onToggleStatus(user.id, !user.isActive)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0.5 sm:p-1 lg:p-0.5 xl:p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title={user.isActive ? "Deactivate user" : "Activate user"}
            >
              {user.isActive ? (
                <FaUserSlash className="text-yellow-500 text-xs sm:text-sm lg:text-xs xl:text-sm" />
              ) : (
                <FaUserCheck className="text-green-500 text-xs sm:text-sm lg:text-xs xl:text-sm" />
              )}
            </button>
          )}
          
          {/* Plan change buttons */}
          {alternatives.map((plan) => {
            return (
              <button
                key={plan.name}
                onClick={() => onChangePlan(user.id, plan.name)}
                className={`${plan.color} px-2 py-1 rounded text-[10px] sm:text-xs lg:text-[10px] xl:text-xs font-medium border border-transparent transition-colors duration-200`}
                title={`Change to ${plan.label}`}
              >
                {plan.shortLabel}
              </button>
            );
          })}
        </div>
      </td>
    </tr>
  );
};

const MobileUserItem: React.FC<{ 
  user: User; 
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onChangePlan: (userId: string, planName: string) => void;
}> = ({ user, onToggleStatus, onChangePlan }) => {
  const { alternatives } = getPlanInfo(user);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 users-mobile-item-narrow users-ultra-compact users-mobile-reduce-right">
      <div className="flex items-start w-full users-small-screen-fix users-mobile-reduce-right">
        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
          {user.avatar ? (
            <img 
              src={`${API_BASE_URL}${user.avatar}`} 
              alt={user.name || 'User'}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          ) : (
            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
              <FaUser className="text-xs sm:text-sm" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 users-small-screen-fix">
          <div className="flex items-start justify-between w-full users-small-screen-fix">
            <div className="flex-1 min-w-0 mr-2 sm:mr-3">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate mb-1">
                {user.name || 'Unnamed User'}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                {user.email || 'No email'}
              </p>
              <div className="flex flex-wrap gap-1">
                {renderRoleBadge(user.role)}
              </div>
            </div>
            <div className="flex flex-col space-y-1 sm:space-y-1.5 flex-shrink-0">
              {renderStatusBadge(user.isActive)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-3 w-full users-small-screen-fix">
        <div className="flex justify-between items-start w-full users-small-screen-fix">
          <div className="flex flex-col space-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-1 min-w-0">
            <div className="flex flex-col space-y-0.5">
              <span className="truncate">
                <span className="font-medium">Plan:</span> {user.activeSubscription?.plan?.name || 'No plan'}
              </span>
              {user.activeSubscription?.plan?.price && (
                <span className="truncate text-[10px] sm:text-xs">
                  <span className="font-medium">Price:</span> ${user.activeSubscription.plan.price}/mo
                </span>
              )}
            </div>
            <span className="truncate">
              <span className="font-medium">Created:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
            {user.role !== 'superAdmin' && (
              <button
                onClick={() => onToggleStatus(user.id, !user.isActive)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 sm:p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title={user.isActive ? "Deactivate user" : "Activate user"}
              >
                {user.isActive ? (
                  <FaUserSlash className="text-yellow-500 text-xs sm:text-sm" />
                ) : (
                  <FaUserCheck className="text-green-500 text-xs sm:text-sm" />
                )}
              </button>
            )}
            
            {/* Plan change buttons for mobile */}
            {alternatives.map((plan) => {
              return (
                <button
                  key={plan.name}
                  onClick={() => onChangePlan(user.id, plan.name)}
                  className={`${plan.color} px-2 py-1 rounded text-xs font-medium border border-transparent transition-colors duration-200`}
                  title={`Change to ${plan.label}`}
                >
                  {plan.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  hasActiveFilters,
  onToggleStatus,
  onChangePlan
}) => {
  if (filteredUsers.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg shadow w-full">
        <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
          <div className="text-gray-400 text-2xl mb-1">👤</div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters 
              ? "No users match your filters" 
              : "No users found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-[10px] sm:text-xs px-2">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Create your first user to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 p-0 users-mobile-container users-no-overflow users-small-screen-fix">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 users-table-medium">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Role
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Plan
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-left text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Created
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 lg:px-2 xl:px-6 py-2 sm:py-2.5 md:py-3 lg:py-1.5 xl:py-3 text-right text-[10px] sm:text-xs md:text-xs lg:text-[10px] xl:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onToggleStatus={onToggleStatus}
                onChangePlan={onChangePlan}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden w-full m-0 p-0 users-force-no-margin users-no-overflow users-small-screen-fix">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden users-mobile-narrow users-small-screen-fix users-mobile-reduce-right">
          {filteredUsers.map((user) => (
            <MobileUserItem
              key={user.id}
              user={user}
              onToggleStatus={onToggleStatus}
              onChangePlan={onChangePlan}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserTable;