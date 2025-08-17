"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bell, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

interface Notification {
  id: number;
  type: 'booking' | 'payment' | 'crew' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
}

interface NotificationPanelProps {
  onNotificationUpdate?: () => void;
}

export function NotificationPanel({ onNotificationUpdate }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        onNotificationUpdate?.();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'crew':
        return <Users className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Notifications</DialogTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-blue-200 shadow-sm'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        notification.read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {notification.priority === 'high' && (
                          <Badge className="text-xs bg-red-100 text-red-800">
                            Urgent
                          </Badge>
                        )}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm ${
                      notification.read ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No notifications</p>
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="pt-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={fetchNotifications}
            >
              Refresh
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
