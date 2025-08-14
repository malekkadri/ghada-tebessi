import React from 'react';
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaPauseCircle,
  FaSync
} from 'react-icons/fa';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: <FaSync className="mr-1.5 animate-spin" />,
      label: 'Pending Verification'
    },
    active: {
      bg: 'bg-green-500/10',
      text: 'text-green-700 dark:text-green-300',
      icon: <FaCheckCircle className="mr-1.5" />,
      label: 'Active'
    },
    failed: {
      bg: 'bg-red-500/10',
      text: 'text-red-700 dark:text-red-300',
      icon: <FaExclamationTriangle className="mr-1.5" />,
      label: 'Verification Failed'
    },
    disabled: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-700 dark:text-gray-300',
      icon: <FaPauseCircle className="mr-1.5" />,
      label: 'Disabled'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;