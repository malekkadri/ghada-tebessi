import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCog, FaCog, FaHistory, FaCreditCard, FaKey } from 'react-icons/fa';

export interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab }) => {
  
  return (
    <nav className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm relative">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.path}
          className={`flex-1 py-4 px-6 text-center text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-primary '
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            {tab.icon}
            {tab.label}
          </div>
          {activeTab === tab.id && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary rounded-b" />
          )}
        </Link>
      ))}
    </nav>
  );
};

export const getTabs = (basePath: string): Tab[] => [
  { 
    id: 'account', 
    label: 'Account', 
    icon: <FaUserCog className="mr-2" />,
    path: `${basePath}/account` 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: <FaCog className="mr-2" />,
    path: `${basePath}/account/settings` 
  },
  { 
    id: 'logs', 
    label: 'Activity Logs', 
    icon: <FaHistory className="mr-2" />,
    path: `${basePath}/account/activityLogs` 
  },
  { 
    id: 'plan', 
    label: 'Subscription', 
    icon: <FaCreditCard className="mr-2" />,
    path: `${basePath}/account/plan` 
  },
  { 
    id: 'api', 
    label: 'API Keys', 
    icon: <FaKey className="mr-2" />,
    path: `${basePath}/account/api` 
  }
];

export default TabNavigation;