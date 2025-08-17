'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Bell, X, AlertTriangle, Info, DollarSign, Users, Settings } from 'lucide-react';
import { usePushNotifications, PushNotification } from '@/hooks/use-push-notifications';

interface NotificationCenterProps {
  userId?: string;
  className?: string;
}

const getNotificationIcon = (type: PushNotification['type']) => {
  switch (type) {
    case 'booking':
      return <Users className="w-4 h-4" />;
    case 'payment':
      return <DollarSign className="w-4 h-4" />;
    case 'crew':
      return <Users className="w-4 h-4" />;
    case 'alert':
      return <AlertTriangle className="w-4 h-4" />;
    case 'system':
      return <Settings className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

const getPriorityColor = (priority: PushNotification['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'normal':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

export function PushNotificationCenter({ userId, className = '' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    requestPermission,
    refetch,
  } = usePushNotifications({
    userId,
    onNotification: (notification) => {
      console.log('📱 New notification received:', notification);
    },
    onError: (error) => {
      console.error('📱 Notification error:', error);
    },
  });

  const filteredNotifications = useMemo(() => {
    return showUnreadOnly 
      ? notifications.filter(n => !n.read)
      : notifications;
  }, [notifications, showUnreadOnly]);

  const handleNotificationClick = useCallback(async (notification: PushNotification) => {
    if (!notification.read && notification.id) {
      await markAsRead(notification.id);
    }
  }, [markAsRead]);

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      console.log('📱 Browser notification permission granted');
    }
  }, [requestPermission]);

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {!isConnected && (
          <span className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full w-3 h-3" 
                title="Disconnected from real-time updates" />
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {!isConnected && (
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    Offline
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`text-sm px-3 py-1 rounded ${
                  showUnreadOnly 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {showUnreadOnly ? 'Show All' : 'Unread Only'}
              </button>
              
              {Notification.permission === 'default' && (
                <button
                  onClick={handleRequestPermission}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Enable Browser Notifications
                </button>
              )}
              
              <button
                onClick={refetch}
                className="text-sm text-gray-600 hover:text-gray-800"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {notification.priority === 'urgent' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Urgent
                          </span>
                        )}
                        {notification.priority === 'high' && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            High
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
