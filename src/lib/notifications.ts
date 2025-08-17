// Notification system with customer preferences integration
// Integrates with Twilio SMS, Nodemailer email, and customer preferences

import { customerPreferences } from './database-neon';

export interface BookingData {
  id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  service_type: string;
  cleaning_type: string;
  scheduled_date: string;
  scheduled_time: string;
  total_price: number;
  photos?: any[];
}

interface NotificationResult {
  success: boolean;
  message: string;
  id?: string;
}

// Email templates
const EMAIL_TEMPLATES = {
  booking_confirmation: {
    subject: '✅ Your Maidly.ai Cleaning is Confirmed!',
    getHtml: (booking: BookingData) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">🏠 Maidly.ai</h1>
          <h2 style="color: #1f2937; margin-bottom: 20px;">Your Cleaning is Confirmed!</h2>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">Service Details</h3>
          <p><strong>Service:</strong> ${booking.service_type.replace('_', ' ')} cleaning (${booking.cleaning_type.replace('_', ' ')})</p>
          <p><strong>Date & Time:</strong> ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}</p>
          <p><strong>Address:</strong> ${booking.address}, ${booking.city}, ${booking.state} ${booking.zip_code}</p>
          <p><strong>Total:</strong> $${booking.total_price}</p>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #065f46; margin-top: 0;">🤖 AI-Powered Service</h3>
          <p style="color: #047857;">Our AI assistant will learn your preferences during this service to make future cleanings even better!</p>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #92400e; margin-top: 0;">What to Expect</h3>
          <ul style="color: #b45309; margin: 0; padding-left: 20px;">
            <li>Our crew will call 15 minutes before arrival</li>
            <li>They'll bring all necessary supplies and equipment</li>
            <li>Service typically takes 2-3 hours depending on home size</li>
            <li>You'll receive a completion summary with photos</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">Questions? Reply to this email or call us at <strong>(214) 555-MAID</strong></p>
          <p style="color: #9ca3af; font-size: 14px;">Thank you for choosing Maidly.ai!</p>
        </div>
      </div>
    `,
  },
  
  service_reminder: {
    subject: '🔔 Your Maidly.ai Cleaning is Tomorrow',
    getHtml: (booking: BookingData) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">🏠 Maidly.ai</h1>
          <h2 style="color: #1f2937; margin-bottom: 20px;">Your Cleaning is Tomorrow!</h2>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-top: 0;">Reminder Details</h3>
          <p><strong>Date & Time:</strong> ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}</p>
          <p><strong>Address:</strong> ${booking.address}, ${booking.city}, ${booking.state}</p>
          <p><strong>Service:</strong> ${booking.service_type.replace('_', ' ')} cleaning</p>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #065f46; margin-top: 0;">Preparation Tips</h3>
          <ul style="color: #047857; margin: 0; padding-left: 20px;">
            <li>Please ensure someone is available to let our crew in</li>
            <li>Secure any valuables or fragile items</li>
            <li>Clear surfaces that need cleaning</li>
            <li>Let us know about any pets or special instructions</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280;">Need to reschedule? Contact us at <strong>(214) 555-MAID</strong></p>
        </div>
      </div>
    `,
  },
};

// SMS templates
const SMS_TEMPLATES = {
  booking_confirmation: (booking: BookingData) => 
    `✅ Maidly.ai: Your ${booking.service_type} cleaning is confirmed for ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}. Address: ${booking.address}. Questions? Call (214) 555-MAID`,
  
  service_reminder: (booking: BookingData) => 
    `🔔 Maidly.ai: Your cleaning is tomorrow ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}. Our crew will call 15 min before arrival. (214) 555-MAID`,
    
  crew_arrival: (booking: BookingData) => 
    `🚗 Maidly.ai: Our crew is on the way to ${booking.address}! They'll arrive in about 15 minutes. Thank you!`,
    
  service_complete: (booking: BookingData) => 
    `✨ Maidly.ai: Your cleaning is complete! Check your email for photos and service summary. Rate your experience: [link]`,
};

// Email sending function (now uses real nodemailer service)
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<NotificationResult> {
  try {
    // Import the real email service
    const { sendEmail: sendNodemailerEmail } = await import('./email-service');
    const result = await sendNodemailerEmail(to, subject, html);
    
    return {
      success: result.success,
      message: result.message,
      id: result.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: 'Failed to send email',
    };
  }
}

// SMS sending function (now uses real Twilio service)
export async function sendSMS(
  to: string,
  message: string
): Promise<NotificationResult> {
  try {
    // Import the real SMS service
    const { sendSMS: sendTwilioSMS } = await import('./sms-service');
    
    const result = await sendTwilioSMS(to, message);
    
    return {
      success: result.success,
      message: result.message,
      id: result.id,
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      message: 'Failed to send SMS',
    };
  }
}

// High-level notification functions
export async function sendBookingConfirmation(booking: BookingData): Promise<void> {
  try {
    // Use the new email automation system
    const { sendAutomatedEmail } = await import('./email-automation');
    const emailResult = await sendAutomatedEmail('booking_created', booking);
    
    console.log('Booking confirmation email automation result:', emailResult);
    
    // Send SMS confirmation if phone number provided
    if (booking.customer_phone) {
      const smsResult = await sendSMS(
        booking.customer_phone,
        SMS_TEMPLATES.booking_confirmation(booking)
      );
      
      console.log('Booking confirmation SMS result:', smsResult);
    }
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
}

export async function sendServiceReminder(booking: BookingData): Promise<void> {
  try {
    // Use the new email automation system
    const { sendAutomatedEmail } = await import('./email-automation');
    const emailResult = await sendAutomatedEmail('service_reminder', booking);
    
    console.log('Service reminder email automation result:', emailResult);
    
    // Send SMS reminder if phone number provided
    if (booking.customer_phone) {
      const smsResult = await sendSMS(
        booking.customer_phone,
        SMS_TEMPLATES.service_reminder(booking)
      );
      
      console.log('Service reminder SMS result:', smsResult);
    }
  } catch (error) {
    console.error('Error sending service reminder:', error);
  }
}

export async function sendCrewArrivalNotification(booking: BookingData): Promise<void> {
  try {
    // Use the new email automation system for crew arrival
    const { sendAutomatedEmail } = await import('./email-automation');
    const emailResult = await sendAutomatedEmail('crew_arrival', booking);
    
    console.log('Crew arrival email automation result:', emailResult);
    
    // Also send SMS if phone number provided
    if (booking.customer_phone) {
      const smsResult = await sendSMS(
        booking.customer_phone,
        SMS_TEMPLATES.crew_arrival(booking)
      );
      
      console.log('Crew arrival SMS result:', smsResult);
    }
  } catch (error) {
    console.error('Error sending crew arrival notification:', error);
  }
}

export async function sendServiceCompleteNotification(booking: BookingData): Promise<void> {
  try {
    // Use the new email automation system for service completion
    const { sendAutomatedEmail } = await import('./email-automation');
    const emailResult = await sendAutomatedEmail('service_complete', booking);
    
    console.log('Service complete email automation result:', emailResult);
    
    // Also send SMS if phone number provided
    if (booking.customer_phone) {
      const smsResult = await sendSMS(
        booking.customer_phone,
        SMS_TEMPLATES.service_complete(booking)
      );
      
      console.log('Service complete SMS result:', smsResult);
    }
  } catch (error) {
    console.error('Error sending service complete notification:', error);
  }
}

// Scheduled notification system (would run via cron jobs in production)
export async function scheduleServiceReminders(): Promise<void> {
  try {
    // This would typically be called by a cron job or scheduled task
    // to send reminders 24 hours before service
    console.log('Service reminder scheduler would run here');
    
    // In production:
    // 1. Query database for bookings scheduled for tomorrow
    // 2. Send reminders for each booking
    // 3. Mark reminders as sent to avoid duplicates
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
}

// Utility function to format phone numbers
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  return phone; // Return as-is if format is unclear
}

// Preference-aware notification functions
export async function sendPreferenceAwareNotification(
  booking: BookingData,
  notificationType: 'booking_confirmations' | 'service_reminders' | 'crew_arrival_notifications' | 'service_completion' | 'payment_receipts' | 'promotional_messages',
  options: {
    emailSubject?: string;
    emailTemplate?: string;
    smsMessage?: string;
    pushNotification?: {
      title: string;
      message: string;
      type?: string;
    };
  }
): Promise<{
  email?: NotificationResult;
  sms?: NotificationResult;
  push?: NotificationResult;
  preferencesChecked: boolean;
}> {
  const results: any = {
    preferencesChecked: false
  };

  try {
    // Check customer preferences
    const shouldReceiveEmail = await customerPreferences.shouldReceiveNotification(
      booking.customer_email,
      notificationType,
      'email'
    );
    
    const shouldReceiveSMS = await customerPreferences.shouldReceiveNotification(
      booking.customer_email,
      notificationType,
      'sms'
    );
    
    const shouldReceivePush = await customerPreferences.shouldReceiveNotification(
      booking.customer_email,
      notificationType,
      'push'
    );

    results.preferencesChecked = true;

    // Send email if enabled
    if (shouldReceiveEmail && options.emailSubject && options.emailTemplate) {
      try {
        results.email = await sendBookingConfirmation(booking);
      } catch (error) {
        console.error('Error sending preference-aware email:', error);
        results.email = {
          success: false,
          message: 'Failed to send email notification'
        };
      }
    } else if (!shouldReceiveEmail) {
      results.email = {
        success: true,
        message: 'Email notification skipped per customer preferences'
      };
    }

    // Send SMS if enabled and phone number available
    if (shouldReceiveSMS && booking.customer_phone && options.smsMessage) {
      try {
        results.sms = await sendBookingConfirmation(booking);
      } catch (error) {
        console.error('Error sending preference-aware SMS:', error);
        results.sms = {
          success: false,
          message: 'Failed to send SMS notification'
        };
      }
    } else if (!shouldReceiveSMS) {
      results.sms = {
        success: true,
        message: 'SMS notification skipped per customer preferences'
      };
    } else if (!booking.customer_phone) {
      results.sms = {
        success: false,
        message: 'SMS notification skipped - no phone number provided'
      };
    }

    // Send push notification if enabled
    if (shouldReceivePush && options.pushNotification) {
      try {
        // Import push notification service
        const { createPushNotification } = await import('./push-notification-service');
        
        const pushResult = await createPushNotification({
          title: options.pushNotification.title,
          message: options.pushNotification.message,
          type: (options.pushNotification.type as 'booking' | 'payment' | 'crew' | 'alert' | 'system') || 'booking',
          userId: 'admin', // For now, send to admin
          read: false,
          priority: 'normal'
        });

        results.push = {
          success: !!pushResult,
          message: pushResult ? 'Push notification sent' : 'Failed to send push notification',
          id: pushResult?.id?.toString()
        };
      } catch (error) {
        console.error('Error sending preference-aware push notification:', error);
        results.push = {
          success: false,
          message: 'Failed to send push notification'
        };
      }
    } else if (!shouldReceivePush) {
      results.push = {
        success: true,
        message: 'Push notification skipped per customer preferences'
      };
    }

    return results;

  } catch (error) {
    console.error('Error in preference-aware notification:', error);
    return {
      preferencesChecked: false,
      email: { success: false, message: 'Failed to check preferences' },
      sms: { success: false, message: 'Failed to check preferences' },
      push: { success: false, message: 'Failed to check preferences' }
    };
  }
}

// Convenience functions for common notification scenarios
export async function sendBookingConfirmationWithPreferences(booking: BookingData) {
  return sendPreferenceAwareNotification(booking, 'booking_confirmations', {
    emailSubject: '✅ Your Maidly.ai Cleaning is Confirmed!',
    emailTemplate: 'booking_confirmation',
    smsMessage: `Hi ${booking.customer_name}! Your ${booking.service_type} cleaning is confirmed for ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}. Address: ${booking.address}. Total: $${booking.total_price}. Reply STOP to opt out.`,
    pushNotification: {
      title: 'New Booking Confirmed',
      message: `${booking.customer_name} scheduled ${booking.service_type} cleaning for ${new Date(booking.scheduled_date).toLocaleDateString()}`,
      type: 'booking'
    }
  });
}

export async function sendServiceReminderWithPreferences(booking: BookingData) {
  return sendPreferenceAwareNotification(booking, 'service_reminders', {
    emailSubject: '🔔 Reminder: Your Maidly.ai Cleaning is Tomorrow',
    emailTemplate: 'service_reminder',
    smsMessage: `Reminder: Your ${booking.service_type} cleaning is scheduled for tomorrow at ${booking.scheduled_time}. Address: ${booking.address}. We'll see you then!`,
    pushNotification: {
      title: 'Service Reminder',
      message: `${booking.customer_name} has a ${booking.service_type} cleaning tomorrow`,
      type: 'reminder'
    }
  });
}

export async function sendCrewArrivalWithPreferences(booking: BookingData) {
  return sendPreferenceAwareNotification(booking, 'crew_arrival_notifications', {
    emailSubject: '🚗 Your Maidly.ai Team Has Arrived',
    emailTemplate: 'crew_arrival',
    smsMessage: `Good news! Your Maidly.ai cleaning team has arrived at ${booking.address}. They'll get started right away!`,
    pushNotification: {
      title: 'Crew Arrived',
      message: `Cleaning team has arrived at ${booking.customer_name}'s location`,
      type: 'crew_update'
    }
  });
}

export async function sendServiceCompletionWithPreferences(booking: BookingData) {
  return sendPreferenceAwareNotification(booking, 'service_completion', {
    emailSubject: '✨ Your Maidly.ai Cleaning is Complete!',
    emailTemplate: 'service_completion',
    smsMessage: `Your ${booking.service_type} cleaning at ${booking.address} is complete! Thank you for choosing Maidly.ai. We hope you love your sparkling clean space!`,
    pushNotification: {
      title: 'Service Completed',
      message: `${booking.service_type} cleaning completed for ${booking.customer_name}`,
      type: 'completion'
    }
  });
}
