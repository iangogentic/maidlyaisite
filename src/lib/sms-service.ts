// Server-side only SMS service
import { Twilio } from 'twilio';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Initialize Twilio client (only on server side)
let twilioClient: Twilio | null = null;

if (typeof window === 'undefined' && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

export interface SMSResult {
  success: boolean;
  message: string;
  id?: string;
  error?: string;
}

export interface SMSDeliveryStatus {
  id: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;
  dateCreated: Date;
  dateUpdated: Date;
}

// Format phone number to E.164 format
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +1 if it's a 10-digit US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // Add + if it doesn't start with it
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

// Validate phone number format
function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Basic validation for E.164 format
  return /^\+[1-9]\d{1,14}$/.test(formatted);
}

// Send SMS using Twilio
export async function sendSMS(
  to: string,
  message: string,
  options: {
    from?: string;
    statusCallback?: string;
    maxPrice?: number;
    validityPeriod?: number;
  } = {}
): Promise<SMSResult> {
  try {
    // Validate phone number
    if (!isValidPhoneNumber(to)) {
      return {
        success: false,
        message: 'Invalid phone number format',
        error: 'INVALID_PHONE_NUMBER'
      };
    }

    const formattedTo = formatPhoneNumber(to);
    
    // If Twilio is not configured, use mock implementation for development
    if (!twilioClient) {
      console.log('📱 SMS (Mock) would be sent:', {
        to: formattedTo,
        message,
        from: options.from || TWILIO_PHONE_NUMBER,
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        success: true,
        message: 'SMS sent successfully (mock)',
        id: `mock_sms_${Date.now()}`,
      };
    }

    // Send SMS using Twilio
    const messageOptions: any = {
      body: message,
      to: formattedTo,
      statusCallback: options.statusCallback,
      maxPrice: options.maxPrice,
      validityPeriod: options.validityPeriod,
    };

    // Use Messaging Service SID if available, otherwise use phone number
    if (TWILIO_MESSAGING_SERVICE_SID) {
      messageOptions.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
    } else {
      messageOptions.from = options.from || TWILIO_PHONE_NUMBER;
    }

    const result = await twilioClient.messages.create(messageOptions);

    console.log('📱 SMS sent successfully:', {
      sid: result.sid,
      to: formattedTo,
      status: result.status,
    });

    return {
      success: true,
      message: 'SMS sent successfully',
      id: result.sid,
    };

  } catch (error: any) {
    console.error('SMS sending error:', error);
    
    // Handle Twilio-specific errors
    if (error.code) {
      return {
        success: false,
        message: `Twilio error: ${error.message}`,
        error: error.code,
      };
    }
    
    return {
      success: false,
      message: 'Failed to send SMS',
      error: 'UNKNOWN_ERROR',
    };
  }
}

// Check SMS delivery status
export async function getSMSStatus(messageSid: string): Promise<SMSDeliveryStatus | null> {
  try {
    if (!twilioClient) {
      // Mock status for development
      return {
        id: messageSid,
        status: 'delivered',
        dateCreated: new Date(),
        dateUpdated: new Date(),
      };
    }

    const message = await twilioClient.messages(messageSid).fetch();
    
    return {
      id: message.sid,
      status: message.status as any,
      errorCode: message.errorCode?.toString() || undefined,
      errorMessage: message.errorMessage || undefined,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated,
    };

  } catch (error) {
    console.error('Error fetching SMS status:', error);
    return null;
  }
}

// Bulk SMS sending with rate limiting
export async function sendBulkSMS(
  messages: Array<{ to: string; message: string }>,
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    from?: string;
  } = {}
): Promise<Array<SMSResult & { to: string }>> {
  const {
    batchSize = 10,
    delayBetweenBatches = 1000,
    from
  } = options;

  const results: Array<SMSResult & { to: string }> = [];
  
  // Process messages in batches to avoid rate limits
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    
    // Send batch concurrently
    const batchPromises = batch.map(async ({ to, message }) => {
      const result = await sendSMS(to, message, { from });
      return { ...result, to };
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches (except for the last batch)
    if (i + batchSize < messages.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

// SMS templates for different notification types
export const SMS_TEMPLATES = {
  booking_confirmation: (booking: any) => 
    `✅ Maidly.ai: Your ${booking.service_type} cleaning is confirmed for ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}. Address: ${booking.address}. Questions? Call (214) 555-MAID`,
  
  service_reminder: (booking: any) => 
    `🔔 Maidly.ai: Your cleaning is tomorrow ${new Date(booking.scheduled_date).toLocaleDateString()} at ${booking.scheduled_time}. Our crew will call 15 min before arrival. (214) 555-MAID`,
    
  crew_arrival: (booking: any) => 
    `🚗 Maidly.ai: Our crew is on the way to ${booking.address}! They'll arrive in about 15 minutes. Thank you!`,
    
  service_complete: (booking: any) => 
    `✨ Maidly.ai: Your cleaning is complete! Check your email for photos and service summary. Rate your experience: maidly.ai/rate/${booking.id}`,
    
  crew_checkin: (booking: any, crewMember: string) => 
    `👋 Maidly.ai: ${crewMember} has arrived at ${booking.address} and started your ${booking.service_type} cleaning. Estimated completion: ${booking.scheduled_time}.`,
    
  service_delayed: (booking: any, newTime: string) => 
    `⏰ Maidly.ai: Your cleaning appointment has been rescheduled to ${newTime}. We apologize for any inconvenience. Questions? Call (214) 555-MAID`,
    
  payment_reminder: (booking: any, amount: string) => 
    `💳 Maidly.ai: Payment of ${amount} for your cleaning service is due. Pay securely at maidly.ai/pay/${booking.id}`,
};

// High-level SMS notification functions
export async function sendBookingConfirmationSMS(booking: any): Promise<SMSResult> {
  if (!booking.customer_phone) {
    return {
      success: false,
      message: 'No phone number provided',
      error: 'NO_PHONE_NUMBER'
    };
  }

  return await sendSMS(
    booking.customer_phone,
    SMS_TEMPLATES.booking_confirmation(booking)
  );
}

export async function sendServiceReminderSMS(booking: any): Promise<SMSResult> {
  if (!booking.customer_phone) {
    return {
      success: false,
      message: 'No phone number provided',
      error: 'NO_PHONE_NUMBER'
    };
  }

  return await sendSMS(
    booking.customer_phone,
    SMS_TEMPLATES.service_reminder(booking)
  );
}

export async function sendCrewArrivalSMS(booking: any): Promise<SMSResult> {
  if (!booking.customer_phone) {
    return {
      success: false,
      message: 'No phone number provided',
      error: 'NO_PHONE_NUMBER'
    };
  }

  return await sendSMS(
    booking.customer_phone,
    SMS_TEMPLATES.crew_arrival(booking)
  );
}

export async function sendServiceCompleteSMS(booking: any): Promise<SMSResult> {
  if (!booking.customer_phone) {
    return {
      success: false,
      message: 'No phone number provided',
      error: 'NO_PHONE_NUMBER'
    };
  }

  return await sendSMS(
    booking.customer_phone,
    SMS_TEMPLATES.service_complete(booking)
  );
}
