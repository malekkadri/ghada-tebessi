import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCard from '../../cards/NotificationCard';
import { authService } from '../../services/api';
import { User } from '../../services/user';
import type { Notification } from '../../services/Notification';
import ConfirmDeleteNotificationModal from '../../modals/ConfirmDeleteNotificationModal';

const NotificationsPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<{
    id: string;
    subject: string;
  } | null>(null);

  const {
    allNotifications: notifications,
    markAsRead,
    markAllAsRead,
    markAsDeleted,
    fetchAllNotifications,
  } = useNotifications(currentUser);

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await authService.getCurrentUser();
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
  if (currentUser) {
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 60000);
    return () => clearInterval(interval);
  }
}, [currentUser, fetchAllNotifications]);

  const handleDeleteClick = (id: string, subject: string) => {
    setNotificationToDelete({ id, subject });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (notificationToDelete) {
      try {
        await markAsDeleted(notificationToDelete.id);
        setDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setNotificationToDelete(null);
  };

  if (loading) {
    return (
      <div className="container px-6 mx-auto">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-50"></div>
        </div>
      </div>
    );
  }

  const readCount = notifications.filter((n: Notification) => n.isRead).length;
  const actualUnreadCount = notifications.filter((n: Notification) => !n.isRead).length;
 return (
    <div className="container px-4 sm:px-6 mx-auto">
      <h2 className="my-6 text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200">
        Notifications
      </h2>

      <div className="w-full mb-8 overflow-hidden rounded-lg shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-4 py-3 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-blue-50 text-white'
                  : 'text-gray-700 bg-gray-200 dark:text-gray-300 dark:bg-gray-700'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                filter === 'unread'
                  ? 'bg-blue-50 text-white'
                  : 'text-gray-700 bg-gray-200 dark:text-gray-300 dark:bg-gray-700'
              }`}
            >
              Non lues ({actualUnreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${
                filter === 'read'
                  ? 'bg-blue-50 text-white'
                  : 'text-gray-700 bg-gray-200 dark:text-gray-300 dark:bg-gray-700'
              }`}
            >
              Lues ({readCount})
            </button>
          </div>

          {actualUnreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 text-xs sm:text-sm font-medium text-blue-50 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900 dark:text-gray-200">Aucune notification</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {filter === 'all'
                  ? "Vous n'avez pas encore reçu de notifications."
                  : filter === 'unread'
                    ? "Vous n'avez pas de notifications non lues."
                    : "Vous n'avez pas de notifications lues."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md dark:bg-gray-800">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification: Notification) => (
                  <div 
                    key={`${notification.id}-${notification.isRead ? 'read' : 'unread'}`} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  >
                    <NotificationCard
                      notification={{
                        id: notification.id,
                        subject: notification.title || '',
                        message: notification.message,
                        isRead: notification.isRead,
                        date: notification.created_at,
                        redirectUrl: notification.redirectUrl
                      }}
                      onMarkAsRead={markAsRead}
                      onDelete={(id) => handleDeleteClick(id, notification.title || '')}
                      showDeleteButton={true}
                    />
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteNotificationModal
        isOpen={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        notificationSubject={notificationToDelete?.subject}
      />
    </div>
  );
};

export default NotificationsPage;