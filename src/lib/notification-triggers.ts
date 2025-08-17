"use server";

import { createPushNotification, broadcastNotification } from './push-notification-service';
import { BookingData } from './notifications';

/**
 * Trigger push notifications for booking events
 */
export async function triggerBookingNotification(
  event: 'created' | 'updated' | 'cancelled' | 'completed',
  booking: BookingData
) {
  try {
    let notification;
    
    switch (event) {
      case 'created':
        notification = await createPushNotification({
          type: 'booking',
          title: 'New Booking Created',
          message: `${booking.customer_name} scheduled ${booking.service_type} for ${booking.scheduled_date}`,
          priority: 'normal',
          data: {
            bookingId: booking.id,
            customerId: booking.customer_name,
            serviceType: booking.service_type,
            scheduledDate: booking.scheduled_date,
            totalPrice: booking.total_price,
          },
        });
        break;
        
      case 'updated':
        notification = await createPushNotification({
          type: 'booking',
          title: 'Booking Updated',
          message: `Booking for ${booking.customer_name} has been modified`,
          priority: 'normal',
          data: {
            bookingId: booking.id,
            customerId: booking.customer_name,
            serviceType: booking.service_type,
          },
        });
        break;
        
      case 'cancelled':
        notification = await createPushNotification({
          type: 'alert',
          title: 'Booking Cancelled',
          message: `${booking.customer_name}'s ${booking.service_type} appointment has been cancelled`,
          priority: 'high',
          data: {
            bookingId: booking.id,
            customerId: booking.customer_name,
            serviceType: booking.service_type,
            scheduledDate: booking.scheduled_date,
          },
        });
        break;
        
      case 'completed':
        notification = await createPushNotification({
          type: 'booking',
          title: 'Service Completed',
          message: `${booking.service_type} completed for ${booking.customer_name}`,
          priority: 'normal',
          data: {
            bookingId: booking.id,
            customerId: booking.customer_name,
            serviceType: booking.service_type,
            totalPrice: booking.total_price,
          },
        });
        break;
    }
    
    if (notification) {
      await broadcastNotification(notification);
      console.log(`📱 Booking ${event} notification sent:`, notification.title);
    }
    
  } catch (error) {
    console.error(`Error sending booking ${event} notification:`, error);
  }
}

/**
 * Trigger push notifications for payment events
 */
export async function triggerPaymentNotification(
  event: 'received' | 'failed' | 'refunded',
  data: {
    customerId?: string;
    customerName: string;
    amount: number;
    bookingId?: number;
    paymentMethod?: string;
    transactionId?: string;
  }
) {
  try {
    let notification;
    
    switch (event) {
      case 'received':
        notification = await createPushNotification({
          type: 'payment',
          title: 'Payment Received',
          message: `$${data.amount} payment received from ${data.customerName}`,
          priority: 'normal',
          data: {
            customerId: data.customerId,
            customerName: data.customerName,
            amount: data.amount,
            bookingId: data.bookingId,
            paymentMethod: data.paymentMethod,
            transactionId: data.transactionId,
          },
        });
        break;
        
      case 'failed':
        notification = await createPushNotification({
          type: 'alert',
          title: 'Payment Failed',
          message: `Payment of $${data.amount} from ${data.customerName} failed`,
          priority: 'high',
          data: {
            customerId: data.customerId,
            customerName: data.customerName,
            amount: data.amount,
            bookingId: data.bookingId,
            paymentMethod: data.paymentMethod,
          },
        });
        break;
        
      case 'refunded':
        notification = await createPushNotification({
          type: 'payment',
          title: 'Payment Refunded',
          message: `$${data.amount} refunded to ${data.customerName}`,
          priority: 'normal',
          data: {
            customerId: data.customerId,
            customerName: data.customerName,
            amount: data.amount,
            bookingId: data.bookingId,
            transactionId: data.transactionId,
          },
        });
        break;
    }
    
    if (notification) {
      await broadcastNotification(notification);
      console.log(`📱 Payment ${event} notification sent:`, notification.title);
    }
    
  } catch (error) {
    console.error(`Error sending payment ${event} notification:`, error);
  }
}

/**
 * Trigger push notifications for crew events
 */
export async function triggerCrewNotification(
  event: 'checkin' | 'checkout' | 'arrival' | 'issue',
  data: {
    crewMember: string;
    location?: string;
    bookingId?: number;
    customerName?: string;
    issue?: string;
    timestamp?: string;
  }
) {
  try {
    let notification;
    
    switch (event) {
      case 'checkin':
        notification = await createPushNotification({
          type: 'crew',
          title: 'Crew Checked In',
          message: `${data.crewMember} checked in${data.location ? ` at ${data.location}` : ''}`,
          priority: 'low',
          data: {
            crewMember: data.crewMember,
            location: data.location,
            bookingId: data.bookingId,
            customerName: data.customerName,
            timestamp: data.timestamp,
          },
        });
        break;
        
      case 'checkout':
        notification = await createPushNotification({
          type: 'crew',
          title: 'Crew Checked Out',
          message: `${data.crewMember} completed work${data.location ? ` at ${data.location}` : ''}`,
          priority: 'normal',
          data: {
            crewMember: data.crewMember,
            location: data.location,
            bookingId: data.bookingId,
            customerName: data.customerName,
            timestamp: data.timestamp,
          },
        });
        break;
        
      case 'arrival':
        notification = await createPushNotification({
          type: 'crew',
          title: 'Crew Arrived',
          message: `${data.crewMember} arrived at ${data.customerName}'s location`,
          priority: 'normal',
          data: {
            crewMember: data.crewMember,
            location: data.location,
            bookingId: data.bookingId,
            customerName: data.customerName,
            timestamp: data.timestamp,
          },
        });
        break;
        
      case 'issue':
        notification = await createPushNotification({
          type: 'alert',
          title: 'Crew Issue Reported',
          message: `${data.crewMember} reported: ${data.issue}`,
          priority: 'high',
          data: {
            crewMember: data.crewMember,
            location: data.location,
            bookingId: data.bookingId,
            customerName: data.customerName,
            issue: data.issue,
            timestamp: data.timestamp,
          },
        });
        break;
    }
    
    if (notification) {
      await broadcastNotification(notification);
      console.log(`📱 Crew ${event} notification sent:`, notification.title);
    }
    
  } catch (error) {
    console.error(`Error sending crew ${event} notification:`, error);
  }
}

/**
 * Trigger system notifications for operational events
 */
export async function triggerSystemNotification(
  event: 'maintenance' | 'error' | 'update' | 'alert',
  data: {
    title: string;
    message: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    details?: Record<string, any>;
  }
) {
  try {
    const notification = await createPushNotification({
      type: 'system',
      title: data.title,
      message: data.message,
      priority: data.priority || 'normal',
      data: data.details,
    });
    
    if (notification) {
      await broadcastNotification(notification);
      console.log(`📱 System ${event} notification sent:`, notification.title);
    }
    
  } catch (error) {
    console.error(`Error sending system ${event} notification:`, error);
  }
}

/**
 * Trigger schedule-related notifications
 */
export async function triggerScheduleNotification(
  event: 'conflict' | 'reminder' | 'change',
  data: {
    title: string;
    message: string;
    bookingIds?: number[];
    affectedCustomers?: string[];
    scheduledDate?: string;
    details?: Record<string, any>;
  }
) {
  try {
    const notification = await createPushNotification({
      type: 'alert',
      title: data.title,
      message: data.message,
      priority: event === 'conflict' ? 'high' : 'normal',
      data: {
        event,
        bookingIds: data.bookingIds,
        affectedCustomers: data.affectedCustomers,
        scheduledDate: data.scheduledDate,
        ...data.details,
      },
    });
    
    if (notification) {
      await broadcastNotification(notification);
      console.log(`📱 Schedule ${event} notification sent:`, notification.title);
    }
    
  } catch (error) {
    console.error(`Error sending schedule ${event} notification:`, error);
  }
}
