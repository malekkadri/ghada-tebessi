import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import videImage from './../assets/styleTemplate/img/empty-vcard.png';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "There are no created vcards", 
  description = "Start by creating your first vcard",
  actionText = "Create VCard",
  actionLink = "/admin/vcard/create-vcard",
  icon = <FaPlus />
}) => (
  <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
    <div className="mx-auto flex items-center justify-center h-24 w-24 mb-4">
      <img
        src={videImage}
        alt="No VCard"
        className="w-full h-full object-contain"
      />
    </div>
    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-1">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      {description}
    </p>
    <Link
      to={actionLink}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {actionText}
    </Link>
  </div>
);

export default EmptyState;