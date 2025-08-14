import React from 'react';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { Block } from '../../services/vcard';
import { getBlockIcon } from '../../services/blockIcons';
import { motion } from 'framer-motion';

interface BlocksTableProps {
  blocks: Block[];
  onToggleStatus: (blockId: string) => void;
  hasActiveFilters?: boolean;
}

const renderStatusBadge = (isActive: boolean) => {
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

const MobileBlockItem: React.FC<{ 
  block: Block; 
  onToggleStatus: (blockId: string) => void;
}> = ({ block, onToggleStatus }) => {
  const { icon: Icon, gradient, shadow } = getBlockIcon(block.type_block);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 blocks-mobile-item-narrow blocks-ultra-compact blocks-mobile-reduce-right">
      <div className="flex items-start w-full blocks-small-screen-fix blocks-mobile-reduce-right">
        <div className="flex-shrink-0 h-10 w-10 mr-3">
          <div className={`p-2 rounded-full bg-gradient-to-br ${gradient} ${shadow} flex items-center justify-center h-10 w-10`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 blocks-small-screen-fix">
          <div className="flex items-start justify-between w-full blocks-small-screen-fix">
            <div className="flex-1 min-w-0 mr-2 sm:mr-3">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate mb-1">
                {block.type_block}
              </p>
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                  {block.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                  {block.description || 'No description'}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-1 sm:space-y-1.5 flex-shrink-0">
              {renderStatusBadge(block.status || false)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-3 w-full blocks-small-screen-fix">
        <div className="flex justify-end items-center w-full blocks-small-screen-fix">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleStatus(block.id)}
            className={`p-1.5 sm:p-2 rounded-lg flex items-center text-xs sm:text-sm ${
              block.status
                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/50 dark:text-yellow-300'
                : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-300'
            } transition-colors duration-200`}
            title={block.status ? "Deactivate" : "Activate"}
          >
            {block.status 
              ? <><FaToggleOff className="mr-1 text-xs sm:text-sm" /> Disable</>
              : <><FaToggleOn className="mr-1 text-xs sm:text-sm" /> Enable</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

const BlockRow: React.FC<{ 
  block: Block; 
  onToggleStatus: (blockId: string) => void;
}> = ({ block, onToggleStatus }) => {
  const { icon: Icon, gradient, shadow } = getBlockIcon(block.type_block);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex justify-center">
          <div className={`p-3 rounded-full bg-gradient-to-br ${gradient} ${shadow} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {block.type_block}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {block.name}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {block.description || 'N/A'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderStatusBadge(block.status || false)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleStatus(block.id)}
            className={`p-2 rounded-lg flex items-center ${
              block.status
                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/50 dark:text-yellow-300'
                : 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-800/50 dark:text-green-300'
            } transition-colors duration-200`}
            title={block.status ? "Deactivate" : "Activate"}
          >
            {block.status 
              ? <><FaToggleOff className="mr-1" /> Disable</>
              : <><FaToggleOn className="mr-1" /> Enable</>}
          </motion.button>
        </div>
      </td>
    </tr>
  );
};

const BlocksTable: React.FC<BlocksTableProps> = ({
  blocks,
  onToggleStatus,
  hasActiveFilters = false
}) => {
  if (blocks.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg shadow w-full">
        <div className="w-full bg-white dark:bg-gray-800 py-8 text-center rounded-lg">
          <div className="text-gray-400 text-2xl mb-1">📦</div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1">
            {hasActiveFilters 
              ? "No blocks match your filters" 
              : "No blocks found"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-xs">
            {hasActiveFilters
              ? "Try adjusting your search criteria"
              : "Create your first block to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full blocks-mobile-narrow blocks-no-overflow">
      {/* Mobile view */}
      <div className="block md:hidden w-full blocks-mobile-narrow">
        <div className="w-full blocks-small-screen-fix">
          {blocks.map((block) => (
            <MobileBlockItem
              key={block.id}
              block={block}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow w-full max-w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Icon
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {blocks.map((block) => (
              <BlockRow
                key={block.id}
                block={block}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlocksTable;