import { NextRequest, NextResponse } from 'next/server';
import { 
  getPushNotifications, 
  markNotificationAsRead, 
  createPushNotification,
  broadcastNotification 
} from '@/lib/push-notification-service';
import { z } from 'zod';

// Schema for creating notifications
const createNotificationSchema = z.object({
  type: z.enum(['booking', 'payment', 'crew', 'alert', 'system']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  data: z.record(z.string(), z.any()).optional(),
  userId: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const notifications = await getPushNotifications({
      userId: userId || undefined,
      unreadOnly,
      limit,
    });
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      totalCount: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, read } = body;

    if (read) {
      const success = await markNotificationAsRead(notificationId);
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Notification marked as read'
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification updated'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the notification data
    const notificationData = createNotificationSchema.parse(body);
    
    const notification = await createPushNotification(notificationData);
    
    if (notification) {
      // Broadcast to all connected clients
      await broadcastNotification(notification);
      
      return NextResponse.json({
        success: true,
        message: 'Notification created and broadcasted',
        notification,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
