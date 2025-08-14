import React, { useState, useEffect, useCallback, useRef } from 'react';
import useColorMode from '../hooks/useColorMode';
import pdp1 from '../assets/styleTemplate/img/pdp1.png';
import { authService } from '../services/api';
import { User } from '../services/user';
import NotificationCard from '../cards/NotificationCard';
import { useNotifications } from '../hooks/useNotifications';
import { API_BASE_URL } from '../config/constants';
import { Notification } from '../services/Notification';
import { Link, useNavigate } from 'react-router-dom';

interface NavBarProps {
  toggleSideMenu: () => void;
  isSideMenuOpen: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ toggleSideMenu, isSideMenuOpen }) => {
  const [colorMode, setColorMode] = useColorMode();
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const [animateNotification, setAnimateNotification] = useState(false);
  const prevUnreadCountRef = useRef(0);

  const {
    dropdownNotifications: notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAsDeleted,
    fetchDropdownNotifications,
    isConnected,
    lastUpdateTime,
  } = useNotifications(currentUser);

   useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDropdownNotifications(10, 0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchDropdownNotifications]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      const user = response.data;
      setCurrentUser(user);
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur :', error);
    }
  }, []);

  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      setAnimateNotification(true);

      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          console.log('La lecture audio a été bloquée par le navigateur');
        });
      } catch (e) {
        console.log('La lecture audio a été bloquée par le navigateur');
      }

      setTimeout(() => setAnimateNotification(false), 2000);
    }

    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    fetchUserData();

    const handleUserUpdated = () => fetchUserData();
    window.addEventListener('userUpdated', handleUserUpdated);

    return () => window.removeEventListener('userUpdated', handleUserUpdated);
  }, [fetchUserData]);

  useEffect(() => {
  if (currentUser?.id) {
    fetchDropdownNotifications(10, 0);
    const interval = setInterval(() => fetchDropdownNotifications(10, 0), 60000);
    return () => clearInterval(interval);
  }
}, [currentUser, fetchDropdownNotifications]);

  const toggleDark = () => {
    if (typeof setColorMode === 'function') {
      setColorMode(colorMode === 'light' ? 'dark' : 'light');
    }
  };

  const toggleNotificationsMenu = () => {
    setIsNotificationsMenuOpen(!isNotificationsMenuOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);

    if (!isNotificationsMenuOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isNotificationsMenuOpen) setIsNotificationsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Échec de la déconnexion :', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest('.notifications-menu-button') &&
        !target.closest('.notifications-menu')
      ) {
        setIsNotificationsMenuOpen(false);
      }
      if (!target.closest('.profile-menu-button') && !target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="z-50 py-4 bg-white shadow-md dark:bg-gray-800">
        <div className="container flex items-center justify-between h-full px-6 mx-auto text-blue-50">
          <button
            className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
            onClick={toggleSideMenu}
            aria-label="Menu"
            data-sidebar-toggle
          >
            {isSideMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="flex items-center flex-1">
            {currentUser?.name && (
              <div className="hidden md:flex items-center mr-20 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 mr-2 text-purple-500 dark:text-purple-300"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                  />
                </svg>
                <h1 className="text-xl font-medium text-gray-700 dark:text-gray-200">
                  Hi {currentUser.name}
                </h1>
              </div>
            )}
          </div>

          <ul className="flex items-center flex-shrink-0 space-x-6">
            <li className="flex">
              <button
                className="rounded-md focus:outline-none focus:shadow-outline-purple"
                onClick={toggleDark}
                aria-label="Basculer le mode couleur"
              >
                {colorMode === 'dark' ? (
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </li>

            <li className="relative">
              <button
                className={`relative align-middle rounded-md focus:outline-none focus:shadow-outline-purple notifications-menu-button ${
                  animateNotification ? 'animate-bounce' : ''
                }`}
                onClick={toggleNotificationsMenu}
                aria-label="Notifications"
                aria-haspopup="true"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className={`absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full ${
                      animateNotification ? 'animate-pulse' : ''
                    }`}
                    key={`badge-${lastUpdateTime}`}
                  >
                    {unreadCount}
                  </span>
                )}
                {!isConnected && (
                  <span
                    className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"
                    title="Statut de connexion : hors ligne"
                  ></span>
                )}
              </button>

              {isNotificationsMenuOpen && (
                <ul
                  className="fixed sm:absolute right-0 left-0 sm:left-auto w-full sm:w-80 p-2 mt-2 space-y-1 text-gray-600 bg-white border border-gray-100 rounded-md shadow-md dark:text-gray-300 dark:border-gray-700 dark:bg-gray-700 notifications-menu z-[9999]"
                  key={`dropdown-${lastUpdateTime}`}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
                    <h3 className="text-sm font-semibold text-primary">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllAsRead();
                        }}
                        className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        Mark All as Read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification: Notification) => (
                        <NotificationCard
                          key={`${notification.id}-${notification.isRead ? 'read' : 'unread'}`}
                          notification={{
                            id: notification.id,
                            subject: notification.title || '',
                            message: notification.message,
                            isRead: notification.isRead,
                            date: notification.created_at,
                            redirectUrl: notification.redirectUrl
                          }}
                          onMarkAsRead={(id) => markAsRead(id)}
                          onDelete={(id) => markAsDeleted(id)}
                          showDeleteButton={false}
                        />
                      ))
                    ) : (
                      <li className="px-3 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                        No Notification
                      </li>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <li className="px-3 pt-2 pb-1 border-t dark:border-gray-600">
                      <Link
                        to="/admin/dashboard/notifications"
                        className="block text-xs text-center text-blue-50 hover:text-blue-400"
                        onClick={() => setIsNotificationsMenuOpen(false)}
                      >
                        View All Notifications
                      </Link> 
                    </li>
                  )}
                </ul>
              )}
            </li>

            <li className="relative">
              <button
                className="align-middle rounded-full focus:shadow-outline-purple focus:outline-none profile-menu-button"
                onClick={toggleProfileMenu}
                aria-label="Compte"
                aria-haspopup="true"
              >
                <img
                  className="object-cover w-8 h-8 rounded-full"
                  src={avatarPreview ? `${API_BASE_URL}${avatarPreview}` : pdp1}
                  alt="Avatar utilisateur"
                  aria-hidden="true"
                />
              </button>

              {isProfileMenuOpen && (
                <ul className="absolute right-0 w-56 p-2 mt-2 space-y-2 text-gray-600 bg-white border border-gray-100 rounded-md shadow-md dark:border-gray-700 dark:text-gray-300 dark:bg-gray-700 profile-menu">
                  <li className="flex">
                    <Link
                      to={currentUser?.role === 'superAdmin' ? '/super-admin/account' : '/admin/account'}
                      className="inline-flex items-center w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        aria-hidden="true"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li className="flex">
                    <Link
                      to={currentUser?.role === 'superAdmin' ? '/super-admin/account/settings' : '/admin/account/settings'}
                      className="inline-flex items-center w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        aria-hidden="true"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li className="flex">
                    <button
                      className="inline-flex items-center w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      onClick={handleLogout}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        aria-hidden="true"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;