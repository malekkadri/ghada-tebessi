import React, { useEffect, useState } from 'react';

interface NotificationCardProps {
  notification: {
    id: string | number;
    subject: string;
    message: string;
    isRead: boolean;
    date: string;
    redirectUrl?: string;
  };
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  showDeleteButton = false
}) => {
  const firstLetter = notification.subject.charAt(0).toUpperCase();
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    try {
      const date = new Date(notification.date);
      setFormattedDate(date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch (error) {
      console.error('Error formatting date:', error);
      setFormattedDate('Unknown date');
    }
  }, [notification.date]);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id.toString());
    }
    if (notification.redirectUrl) {
      window.location.href = notification.redirectUrl;
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id.toString());
    }
  };

  return (
    <li
      className={`flex px-2 py-3 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
        !notification.isRead ? 'bg-blue-50 dark:bg-gray-700 bg-opacity-10' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start w-full">
        <div className="flex-shrink-0 mt-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-purple-500 dark:bg-purple-600 dark:text-blue-200 text-lg font-medium">
            {firstLetter}
          </div>
        </div>

        <div className="ml-3 flex-1">
          <p className={`text-sm font-semibold text-gray-900 dark:text-gray-200 ${
            !notification.isRead ? 'font-bold' : ''
          }`}>
            {notification.subject}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {notification.message}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {formattedDate}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!notification.isRead && (
            <span className="inline-block w-2 h-2 rounded-full bg-blue-50"></span>
          )}
          {showDeleteButton && onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
              title="Delete notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export default NotificationCard;