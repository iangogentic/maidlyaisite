"use server";

export interface PushNotification {
  id?: number;
  type: 'booking' | 'payment' | 'crew' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp?: string;
  read?: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: Record<string, any>; // Additional data for the notification
  userId?: string; // For user-specific notifications
  expiresAt?: string; // When the notification should expire
}

export interface NotificationSubscription {
  id?: number;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt?: string;
}

// In-memory storage for SSE connections (in production, use Redis or similar)
const sseConnections = new Map<string, Response>();

/**
 * Get push notifications with filtering options
 */
export async function getPushNotifications(options: {
  userId?: string;
  unreadOnly?: boolean;
  limit?: number;
} = {}): Promise<PushNotification[]> {
  try {
    // For now, return mock data since we don't have database storage yet
    // In production, this would query the database
    const mockNotifications: PushNotification[] = [
      {
        id: 1,
        type: 'booking',
        title: 'New Booking Created',
        message: 'Sarah Johnson scheduled Standard Cleaning for Dec 15, 2024',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        read: false,
        priority: 'normal',
        data: { bookingId: 123, customerId: 'sarah-johnson' },
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Received',
        message: '$250 payment received from Mike Chen',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'normal',
        data: { amount: 250, customerId: 'mike-chen' },
      },
      {
        id: 3,
        type: 'crew',
        title: 'Crew Checked In',
        message: 'Team Alpha started job at 123 Oak Street',
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
        read: true,
        priority: 'low',
        data: { crewMember: 'Team Alpha', location: '123 Oak Street' },
      },
      {
        id: 4,
        type: 'alert',
        title: 'Schedule Conflict',
        message: 'Two jobs scheduled at same time - needs review',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: false,
        priority: 'high',
        data: { conflictType: 'schedule', affectedJobs: [123, 124] },
      }
    ];

    let filtered = mockNotifications;

    if (options.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    if (options.userId) {
      // In production, filter by userId
      // For now, return all notifications
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  } catch (error) {
    console.error('Error fetching push notifications:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    // In production, this would update the database
    console.log(`Marking notification ${notificationId} as read`);
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Broadcast notification to all connected clients
 */
export async function broadcastNotification(notification: PushNotification): Promise<void> {
  try {
    const message = `data: ${JSON.stringify({
      type: 'notification',
      payload: notification,
    })}\n\n`;

    // Send to all connected SSE clients
    for (const [clientId, response] of sseConnections.entries()) {
      try {
        // In a real implementation, you'd need to access the controller
        // For now, just log the broadcast
        console.log(`📡 Broadcasting notification to client ${clientId}:`, notification.title);
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId}:`, error);
        sseConnections.delete(clientId);
      }
    }
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
}

/**
 * Create a new push notification
 */
export async function createPushNotification(notification: PushNotification): Promise<PushNotification | null> {
  try {
    // Store in database (mock implementation - would use real DB)
    const notificationId = Date.now(); // Mock ID generation
    
    const fullNotification: PushNotification = {
      ...notification,
      id: notificationId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Store notification (in production, save to database)
    console.log('📢 Push notification created:', fullNotification);

    // Send to all connected SSE clients
    await broadcastToSSEClients(fullNotification);

    // Send browser push notification if supported
    await sendBrowserPushNotification(fullNotification);

    return fullNotification;

  } catch (error) {
    console.error('Error creating push notification:', error);
    return null;
  }
}

/**
 * Broadcast notification to all SSE clients
 */
async function broadcastToSSEClients(notification: PushNotification): Promise<void> {
  try {
    // For now, just log the broadcast since we need to implement proper SSE controllers
    // In a production implementation, you'd store the ReadableStreamDefaultController
    // from the SSE connection setup and use that to send messages
    console.log(`📡 Broadcasting notification to ${sseConnections.size} connected clients:`, notification.title);
    
    // TODO: Implement proper SSE broadcasting with stored controllers
    // This would require refactoring the SSE connection setup to store controllers
    // instead of Response objects
  } catch (error) {
    console.error('Error broadcasting to SSE clients:', error);
  }
}

/**
 * Send browser push notification using Web Push API
 */
async function sendBrowserPushNotification(notification: PushNotification): Promise<void> {
  try {
    // In production, you would:
    // 1. Get user's push subscriptions from database
    // 2. Use web-push library to send notifications
    // 3. Handle subscription management
    
    console.log('🔔 Browser push notification would be sent:', {
      title: notification.title,
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: `notification-${notification.id}`,
      data: notification.data,
    });

    // Mock implementation - in production use web-push library:
    // await webpush.sendNotification(subscription, JSON.stringify(payload));

  } catch (error) {
    console.error('Error sending browser push notification:', error);
  }
}

/**
 * Create SSE connection for real-time notifications
 */
export async function createSSEConnection(clientId: string): Promise<Response> {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  
  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        payload: { message: 'Connected to notification stream', clientId },
      })}\n\n`;
      
      controller.enqueue(new TextEncoder().encode(initialMessage));

      console.log(`📡 SSE connection established for client: ${clientId}`);

      // Clean up on disconnect
      const cleanup = () => {
        sseConnections.delete(clientId);
        try {
          controller.close();
        } catch (error) {
          // Controller might already be closed
        }
      };

      // Set up heartbeat to detect disconnections
      const heartbeat = setInterval(() => {
        try {
          const heartbeatMessage = `data: ${JSON.stringify({
            type: 'heartbeat',
            payload: { timestamp: new Date().toISOString() },
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeatMessage));
        } catch (error) {
          cleanup();
          clearInterval(heartbeat);
        }
      }, 30000); // Send heartbeat every 30 seconds

      // Clean up after 1 hour of inactivity
      setTimeout(() => {
        cleanup();
        clearInterval(heartbeat);
      }, 60 * 60 * 1000);
    },
  });

  // Create the response
  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });

  // Store connection for tracking
  sseConnections.set(clientId, response);

  return response;
}

/**
 * Notification triggers for common events
 */
const NotificationTriggers = {
  // Booking events
  newBooking: (booking: any) => createPushNotification({
    type: 'booking',
    title: '📅 New Booking Received',
    message: `${booking.customer_name} scheduled a ${booking.service_type} cleaning for ${new Date(booking.scheduled_date).toLocaleDateString()}`,
    priority: 'normal',
    data: { bookingId: booking.id, customerId: booking.customer_name },
  }),

  bookingCancelled: (booking: any) => createPushNotification({
    type: 'booking',
    title: '❌ Booking Cancelled',
    message: `${booking.customer_name}'s cleaning on ${new Date(booking.scheduled_date).toLocaleDateString()} was cancelled`,
    priority: 'high',
    data: { bookingId: booking.id, customerId: booking.customer_name },
  }),

  bookingRescheduled: (booking: any, oldDate: string) => createPushNotification({
    type: 'booking',
    title: '📅 Booking Rescheduled',
    message: `${booking.customer_name} moved their cleaning from ${new Date(oldDate).toLocaleDateString()} to ${new Date(booking.scheduled_date).toLocaleDateString()}`,
    priority: 'normal',
    data: { bookingId: booking.id, customerId: booking.customer_name, oldDate },
  }),

  // Payment events
  paymentReceived: (payment: any) => createPushNotification({
    type: 'payment',
    title: '💰 Payment Received',
    message: `$${payment.amount} payment received from ${payment.customer_name}`,
    priority: 'normal',
    data: { paymentId: payment.id, amount: payment.amount, customerId: payment.customer_name },
  }),

  paymentFailed: (payment: any) => createPushNotification({
    type: 'payment',
    title: '⚠️ Payment Failed',
    message: `Payment of $${payment.amount} from ${payment.customer_name} failed`,
    priority: 'high',
    data: { paymentId: payment.id, amount: payment.amount, customerId: payment.customer_name },
  }),

  // Crew events
  crewCheckedIn: (crew: any, job: any) => createPushNotification({
    type: 'crew',
    title: '👥 Crew Checked In',
    message: `${crew.name} checked in at ${job.address}`,
    priority: 'low',
    data: { crewId: crew.id, jobId: job.id, address: job.address },
  }),

  crewCheckedOut: (crew: any, job: any) => createPushNotification({
    type: 'crew',
    title: '✅ Job Completed',
    message: `${crew.name} completed cleaning at ${job.address}`,
    priority: 'normal',
    data: { crewId: crew.id, jobId: job.id, address: job.address },
  }),

  crewRunningLate: (crew: any, job: any, minutesLate: number) => createPushNotification({
    type: 'crew',
    title: '⏰ Crew Running Late',
    message: `${crew.name} is ${minutesLate} minutes late for ${job.address}`,
    priority: 'high',
    data: { crewId: crew.id, jobId: job.id, address: job.address, minutesLate },
  }),

  // Alert events
  scheduleConflict: (conflicts: any[]) => createPushNotification({
    type: 'alert',
    title: '⚠️ Schedule Conflict Detected',
    message: `${conflicts.length} booking(s) have scheduling conflicts that need attention`,
    priority: 'urgent',
    data: { conflicts },
  }),

  lowInventory: (item: string, quantity: number) => createPushNotification({
    type: 'alert',
    title: '📦 Low Inventory Alert',
    message: `${item} is running low (${quantity} remaining)`,
    priority: 'normal',
    data: { item, quantity },
  }),

  systemMaintenance: (message: string) => createPushNotification({
    type: 'system',
    title: '🔧 System Maintenance',
    message,
    priority: 'normal',
    data: { maintenanceType: 'scheduled' },
  }),

  // Custom notification
  custom: (title: string, message: string, priority: PushNotification['priority'] = 'normal', data?: any) => 
    createPushNotification({
      type: 'system',
      title,
      message,
      priority,
      data,
    }),
};

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}> {
  // Mock implementation - in production, query from database
  return {
    total: 15,
    unread: 7,
    byType: {
      booking: 5,
      payment: 3,
      crew: 4,
      alert: 2,
      system: 1,
    },
    byPriority: {
      low: 3,
      normal: 8,
      high: 3,
      urgent: 1,
    },
  };
}

/**
 * Clean up expired notifications
 */
export async function cleanupExpiredNotifications(): Promise<{ success: boolean; deletedCount: number }> {
  try {
    // Mock implementation - in production, delete from database
    const deletedCount = 0; // Would be actual count from DB
    
    console.log(`🧹 Cleaned up ${deletedCount} expired notifications`);
    
    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    return {
      success: false,
      deletedCount: 0,
    };
  }
}
