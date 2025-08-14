import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaAngleDown } from 'react-icons/fa';
import { Tab } from './TabNavigation';

interface MobileTabMenuProps {
  tabs: Tab[];
  activeTab: string;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
}

const MobileTabMenu: React.FC<MobileTabMenuProps> = ({
  tabs,
  activeTab,
  showMobileMenu,
  setShowMobileMenu
}) => {
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm relative"
      >
        <div className="flex items-center">
          {tabs.find(t => t.id === activeTab)?.icon}
          <span className="ml-2 font-medium text-gray-800 dark:text-white">
            {tabs.find(t => t.id === activeTab)?.label}
          </span>
        </div>
        <FaAngleDown className={`transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
        {!showMobileMenu && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b" />
        )}
      </button>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            ref={mobileMenuRef}
          >
            <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm">
              <nav className="py-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center px-6 py-3 text-sm font-medium relative ${
                      activeTab === tab.id
                        ? 'text-primary bg-purple-50 dark:bg-gray-700'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                    )}
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileTabMenu;