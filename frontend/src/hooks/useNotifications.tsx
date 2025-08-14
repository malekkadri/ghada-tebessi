import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/api';
import { User } from '../services/user';
import type { Notification } from '../services/Notification';

interface ApiNotification {
  id: number | string;
  title: string;
  message: string;
  created_at: string;
  isRead: boolean;
  redirectUrl?: string;
  type?: string;
  metadata?: any;
  user_id?: number;
  updated_at?: string;
}

export const useNotifications = (user: User | null) => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [dropdownNotifications, setDropdownNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const retryCount = useRef(0);

  const formatNotification = useCallback((notif: ApiNotification): Notification => ({
    id: Number(notif.id),
    user_id: Number(notif.user_id || user?.id || 0),
    title: notif.title || '',
    message: notif.message || '',
    isRead: notif.isRead,
    redirectUrl: notif.redirectUrl,
    created_at: notif.created_at,
    updated_at: notif.updated_at || new Date().toISOString(),
  }), [user?.id]);

  const fetchDropdownNotifications = useCallback(async (limit = 10, offset = 0) => {
    if (!user?.id) return;

    try {
      const response = await notificationService.getNotifications({
        userId: user.id.toString(),
        limit,
        offset,
        unreadOnly: false,
      });

      if (response?.data) {
        const formatted = response.data.map(formatNotification);
        setDropdownNotifications(formatted);
        setUnreadCount(response.meta?.totalUnread || 0);
      }
    } catch (error) {
      console.error('Error fetching dropdown notifications:', error);
    }
  }, [user, formatNotification]);

  const fetchAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await notificationService.getNotifications({
        userId: user.id.toString(),
        limit: 1000,
        offset: 0,
        unreadOnly: false,
      });

      if (response?.data) {
        const formatted = response.data.map(formatNotification);
        setAllNotifications(formatted);
        setUnreadCount(response.meta?.totalUnread || 0);
      }
    } catch (error) {
      console.error('Error fetching all notifications:', error);
    }
  }, [user, formatNotification]);

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'NEW_NOTIFICATION':
          setAllNotifications(prev => [data.notification, ...prev]);
          setDropdownNotifications(prev => [data.notification, ...prev.slice(0, 9)]);
          if (!data.notification.isRead) {
            setUnreadCount(prev => prev + 1);
          }
          break;

        case 'NOTIFICATION_READ':
          setAllNotifications(prev => 
            prev.map(n => n.id === data.notificationId ? { ...n, isRead: true } : n)
          );
          setDropdownNotifications(prev => 
            prev.map(n => n.id === data.notificationId ? { ...n, isRead: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
          break;

        case 'ALL_NOTIFICATIONS_READ':
          setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setDropdownNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
          break;

        case 'NOTIFICATION_DELETED':
          setAllNotifications(prev => prev.filter(n => n.id !== data.notificationId));
          setDropdownNotifications(prev => prev.filter(n => n.id !== data.notificationId));
          break;

        default:
          console.warn('Unhandled message type:', data.type);
      }

       if (data.type !== 'HEARTBEAT_ACK') {
        fetchDropdownNotifications().catch(console.error);
      }   
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, []);

  const setupWebSocket = useCallback(() => {
    if (!user?.id) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

    ws.addEventListener('open', () => {
      setIsConnected(true);
      retryCount.current = 0;
      ws.send(JSON.stringify({ 
        type: 'IDENTIFY', 
        userId: user.id,
        lastUpdate: lastUpdateTime
      }));
      fetchDropdownNotifications();
      fetchAllNotifications();
    });

    ws.addEventListener('message', (event) => {
      handleWebSocketMessage(event);
      if (event.data.type !== 'HEARTBEAT_ACK') {
        fetchDropdownNotifications();
      }
    });

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 10000);

    ws.addEventListener('close', () => {
      clearInterval(pingInterval);
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    wsRef.current = ws;
  }, [user?.id, fetchDropdownNotifications, fetchAllNotifications, handleWebSocketMessage, lastUpdateTime]);

  const markAsRead = useCallback(async (id: string) => {
    const numId = Number(id);
    try {
      await notificationService.markAsRead(numId);
      setAllNotifications(prev => 
        prev.map(n => n.id === numId ? { ...n, isRead: true } : n)
      );
      setDropdownNotifications(prev => 
        prev.map(n => n.id === numId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllAsRead(user.id.toString());
      setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setDropdownNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [user]);

  const markAsDeleted = useCallback(async (id: string) => {
    const numId = Number(id);
    try {
      await notificationService.deleteNotification(numId);
      setAllNotifications(prev => prev.filter(n => n.id !== numId));
      setDropdownNotifications(prev => prev.filter(n => n.id !== numId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      setupWebSocket();
    }

    return () => {
      wsRef.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [user?.id, setupWebSocket]);

  return {
    dropdownNotifications,
    allNotifications,
    unreadCount,
    isConnected,
    lastUpdateTime,
    fetchDropdownNotifications,
    fetchAllNotifications,
    markAsRead,
    markAllAsRead,
    markAsDeleted
  };
};