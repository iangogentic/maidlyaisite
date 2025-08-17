'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PushNotification {
  id?: number;
  type: 'booking' | 'payment' | 'crew' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp?: string;
  read?: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>;
  userId?: string;
  expiresAt?: string;
}

export interface NotificationState {
  notifications: PushNotification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UsePushNotificationsOptions {
  autoConnect?: boolean;
  userId?: string;
  onNotification?: (notification: PushNotification) => void;
  onError?: (error: string) => void;
}

export function usePushNotifications(options: UsePushNotificationsOptions = {}) {
  const {
    autoConnect = true,
    userId,
    onNotification,
    onError
  } = options;

  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: true,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      
      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          notifications: data.notifications,
          unreadCount: data.unreadCount,
          isLoading: false,
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      if (onError) onError(errorMessage);
    }
  }, [userId]); // Remove onError from dependencies

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/notifications/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('📡 SSE connection established');
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'connected') {
            console.log('📡 SSE connected:', data.payload.message);
            return;
          }
          
          if (data.type === 'heartbeat') {
            // Just log heartbeat, don't add to notifications
            console.log('💓 SSE heartbeat received');
            return;
          }
          
          if (data.type === 'notification') {
            const notification: PushNotification = data.payload;
            
            setState(prev => ({
              ...prev,
              notifications: [notification, ...prev.notifications],
              unreadCount: prev.unreadCount + (notification.read ? 0 : 1),
            }));

            // Trigger browser notification if supported and permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: `notification-${notification.id}`,
              });
            }

            if (onNotification) onNotification(notification);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setState(prev => ({ ...prev, isConnected: false }));
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          const errorMessage = 'Failed to establish real-time connection after multiple attempts';
          setState(prev => ({ ...prev, error: errorMessage }));
          if (onError) onError(errorMessage);
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      setState(prev => ({ ...prev, error: errorMessage, isConnected: false }));
      if (onError) onError(errorMessage);
    }
  }, []); // Remove all dependencies to prevent infinite loops

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true }),
      });

      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      } else {
        throw new Error(data.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (onError) onError(errorMessage);
    }
  }, []);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Create a new notification
  const createNotification = useCallback(async (notification: Omit<PushNotification, 'id' | 'timestamp'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create notification');
      }
      
      return data.notification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (onError) onError(errorMessage);
      throw error;
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchNotifications();
    
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Only depend on autoConnect to avoid infinite loops

  return {
    ...state,
    connect,
    disconnect,
    markAsRead,
    requestPermission,
    createNotification,
    refetch: fetchNotifications,
  };
}
