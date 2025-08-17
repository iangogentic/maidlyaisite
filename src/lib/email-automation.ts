"use server";

import { sendEmail } from './email-service';
import { BookingData } from './notifications';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'booking_created' | 'service_reminder' | 'crew_arrival' | 'service_complete' | 'payment_received' | 'custom';
  delay?: number; // Minutes to delay sending
  conditions?: {
    serviceType?: string[];
    customerSegment?: string[];
    bookingValue?: { min?: number; max?: number };
  };
  template: string;
  enabled: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables: string[]; // List of available variables like {customer_name}, {service_date}
}

// Default automation rules for the service lifecycle
const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    trigger: 'booking_created',
    delay: 0, // Send immediately
    template: 'booking_confirmation',
    enabled: true,
  },
  {
    id: 'service_reminder_24h',
    name: '24-Hour Service Reminder',
    trigger: 'service_reminder',
    delay: 0, // Triggered by scheduler
    template: 'service_reminder_24h',
    enabled: true,
  },
  {
    id: 'service_reminder_2h',
    name: '2-Hour Service Reminder',
    trigger: 'service_reminder',
    delay: 0, // Triggered by scheduler
    template: 'service_reminder_2h',
    enabled: true,
  },
  {
    id: 'crew_arrival_notification',
    name: 'Crew Arrival Notification',
    trigger: 'crew_arrival',
    delay: 0,
    template: 'crew_arrival',
    enabled: true,
  },
  {
    id: 'service_completion',
    name: 'Service Completion with Photos',
    trigger: 'service_complete',
    delay: 0,
    template: 'service_complete',
    enabled: true,
  },
  {
    id: 'payment_confirmation',
    name: 'Payment Confirmation',
    trigger: 'payment_received',
    delay: 0,
    template: 'payment_confirmation',
    enabled: true,
  },
  {
    id: 'follow_up_feedback',
    name: 'Follow-up Feedback Request',
    trigger: 'service_complete',
    delay: 1440, // 24 hours after service completion
    template: 'feedback_request',
    enabled: true,
  },
];

// Enhanced email templates with more professional design
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  booking_confirmation: {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    subject: '✅ Your Maidly.ai Cleaning is Confirmed - {service_date}',
    variables: ['customer_name', 'service_type', 'service_date', 'service_time', 'address', 'total_price', 'booking_id'],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🏠 Maidly.ai</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">Professional AI-Powered Cleaning Service</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Your Cleaning is Confirmed! ✨</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hi {customer_name}, we're excited to provide you with an exceptional cleaning experience!
          </p>
          
          <!-- Service Details Card -->
          <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Service Details</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500;">Service:</span>
                <span style="color: #1f2937; font-weight: 600;">{service_type}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500;">Date & Time:</span>
                <span style="color: #1f2937; font-weight: 600;">{service_date} at {service_time}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-weight: 500;">Address:</span>
                <span style="color: #1f2937; font-weight: 600;">{address}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #6b7280; font-weight: 500;">Total:</span>
                <span style="color: #059669; font-weight: 700; font-size: 18px;">{total_price}</span>
              </div>
            </div>
          </div>
          
          <!-- AI Features -->
          <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🤖 AI-Powered Excellence</h3>
            <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Our AI learns your preferences for personalized service</li>
              <li>Smart scheduling optimizes crew efficiency</li>
              <li>Real-time updates and photo documentation</li>
              <li>Quality assurance through AI monitoring</li>
            </ul>
          </div>
          
          <!-- What to Expect -->
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📞 What to Expect</h3>
            <ul style="color: #b45309; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>15 minutes before arrival:</strong> Our crew will call you</li>
              <li><strong>Professional supplies:</strong> We bring everything needed</li>
              <li><strong>Service duration:</strong> Typically 2-3 hours depending on home size</li>
              <li><strong>Completion summary:</strong> You'll receive photos and service details</li>
            </ul>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://maidly.ai/booking/{booking_id}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              View Booking Details
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
            Questions? Reply to this email or call us at <strong>(214) 555-MAID</strong>
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2025 Maidly.ai - Professional AI-Powered Cleaning Service
          </p>
        </div>
      </div>
    `,
  },
  
  service_reminder_24h: {
    id: 'service_reminder_24h',
    name: '24-Hour Service Reminder',
    subject: '🔔 Your Maidly.ai Cleaning is Tomorrow - {service_date}',
    variables: ['customer_name', 'service_date', 'service_time', 'address', 'crew_name'],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🏠 Maidly.ai</h1>
          <p style="color: #ddd6fe; margin: 8px 0 0 0; font-size: 16px;">Your Cleaning is Tomorrow!</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Ready for Tomorrow? 🔔</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hi {customer_name}, just a friendly reminder that your cleaning service is scheduled for tomorrow!
          </p>
          
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">📅 Tomorrow's Service</h3>
            <p style="color: #0369a1; margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>Date:</strong> {service_date}<br>
              <strong>Time:</strong> {service_time}<br>
              <strong>Address:</strong> {address}<br>
              <strong>Crew Lead:</strong> {crew_name}
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 25px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">✅ Preparation Checklist</h3>
            <ul style="color: #b45309; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Clear surfaces and pick up personal items</li>
              <li>Secure any fragile or valuable items</li>
              <li>Ensure pets are safely contained</li>
              <li>Have your phone ready for our arrival call</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Need to reschedule? Call us at <strong>(214) 555-MAID</strong>
          </p>
        </div>
      </div>
    `,
  },
  
  service_complete: {
    id: 'service_complete',
    name: 'Service Completion with Photos',
    subject: '✨ Your Maidly.ai Cleaning is Complete - Photos Inside!',
    variables: ['customer_name', 'service_date', 'crew_name', 'photos_count', 'service_summary'],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🏠 Maidly.ai</h1>
          <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 16px;">Service Complete!</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Your Home is Sparkling Clean! ✨</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hi {customer_name}, {crew_name} has completed your cleaning service. We hope you love the results!
          </p>
          
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #065f46; margin: 0 0 15px 0;">📸 Service Documentation</h3>
            <p style="color: #047857; margin: 0 0 15px 0;">
              We've captured {photos_count} photos showing the quality of our work.
            </p>
            <div style="text-align: center;">
              <a href="https://maidly.ai/photos/{booking_id}" style="background: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View Photos
              </a>
            </div>
          </div>
          
          <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">📋 Service Summary</h3>
            <p style="color: #4b5563; margin: 0; line-height: 1.6;">{service_summary}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://maidly.ai/feedback/{booking_id}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin-right: 10px;">
              Rate Your Experience
            </a>
            <a href="https://maidly.ai/book-again" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Book Again
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Thank you for choosing Maidly.ai! Questions? Call <strong>(214) 555-MAID</strong>
          </p>
        </div>
      </div>
    `,
  },
  
  feedback_request: {
    id: 'feedback_request',
    name: 'Feedback Request',
    subject: '💭 How was your Maidly.ai experience? (2 minutes)',
    variables: ['customer_name', 'service_date', 'booking_id'],
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🏠 Maidly.ai</h1>
          <p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 16px;">We Value Your Feedback</p>
        </div>
        
        <div style="padding: 40px 30px; text-align: center;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">How did we do? 💭</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Hi {customer_name}, we hope you're enjoying your freshly cleaned home! Your feedback helps us improve our AI-powered service.
          </p>
          
          <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0;">⭐ Quick 2-Minute Survey</h3>
            <p style="color: #b45309; margin: 0 0 20px 0;">
              Help us serve you better by sharing your experience from {service_date}.
            </p>
            <a href="https://maidly.ai/feedback/{booking_id}" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Leave Feedback
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            As a thank you, you'll receive 10% off your next cleaning!
          </p>
        </div>
      </div>
    `,
  },
};

/**
 * Replace template variables with actual values
 */
function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  let result = template;
  
  // Replace all {variable} patterns with actual values
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, String(value || ''));
  });
  
  return result;
}

/**
 * Process booking data into template variables
 */
function prepareTemplateData(booking: BookingData): Record<string, any> {
  return {
    customer_name: booking.customer_name || 'Valued Customer',
    service_type: booking.service_type?.replace('_', ' ') || 'Cleaning Service',
    cleaning_type: booking.cleaning_type?.replace('_', ' ') || '',
    service_date: new Date(booking.scheduled_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    service_time: booking.scheduled_time || '',
    address: `${booking.address}, ${booking.city}, ${booking.state} ${booking.zip_code}`,
    total_price: booking.total_price?.toFixed(2) || '0.00',
    booking_id: booking.id || '',
    crew_name: 'Professional Cleaning Crew', // This would come from crew assignment
    photos_count: booking.photos?.length || 0,
    service_summary: 'Professional cleaning completed to our high standards.',
  };
}

/**
 * Send automated email based on trigger and booking data
 */
export async function sendAutomatedEmail(
  trigger: AutomationRule['trigger'],
  booking: BookingData,
  customData?: Record<string, any>
): Promise<{ success: boolean; message: string; results: any[] }> {
  try {
    // Find applicable automation rules
    const applicableRules = DEFAULT_AUTOMATION_RULES.filter(
      rule => rule.trigger === trigger && rule.enabled
    );
    
    if (applicableRules.length === 0) {
      return {
        success: true,
        message: `No automation rules found for trigger: ${trigger}`,
        results: [],
      };
    }
    
    const results = [];
    const templateData = { ...prepareTemplateData(booking), ...customData };
    
    // Process each applicable rule
    for (const rule of applicableRules) {
      const template = EMAIL_TEMPLATES[rule.template];
      
      if (!template) {
        console.warn(`Template not found: ${rule.template}`);
        continue;
      }
      
      // Replace variables in subject and HTML
      const subject = replaceTemplateVariables(template.subject, templateData);
      const html = replaceTemplateVariables(template.html, templateData);
      
      // Send email (with delay if specified)
      if (rule.delay && rule.delay > 0) {
        // In a real implementation, this would be queued for later processing
        console.log(`Email "${rule.name}" scheduled for ${rule.delay} minutes delay`);
        // For now, we'll send immediately but log the intended delay
      }
      
      const emailResult = await sendEmail(booking.customer_email, subject, html);
      
      results.push({
        rule: rule.name,
        template: rule.template,
        success: emailResult.success,
        message: emailResult.message,
        id: emailResult.id,
      });
    }
    
    return {
      success: true,
      message: `Processed ${results.length} automation rules`,
      results,
    };
    
  } catch (error) {
    console.error('Email automation error:', error);
    return {
      success: false,
      message: 'Failed to process email automation',
      results: [],
    };
  }
}

/**
 * Get available email templates
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return Object.values(EMAIL_TEMPLATES);
}

/**
 * Get automation rules
 */
export async function getAutomationRules(): Promise<AutomationRule[]> {
  return DEFAULT_AUTOMATION_RULES;
}

/**
 * Send a custom email using a template
 */
export async function sendTemplatedEmail(
  templateId: string,
  to: string,
  data: Record<string, any>
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const template = EMAIL_TEMPLATES[templateId];
    
    if (!template) {
      return {
        success: false,
        message: `Template not found: ${templateId}`,
      };
    }
    
    const subject = replaceTemplateVariables(template.subject, data);
    const html = replaceTemplateVariables(template.html, data);
    
    const result = await sendEmail(to, subject, html);
    
    return {
      success: result.success,
      message: result.message,
      id: result.id,
    };
    
  } catch (error) {
    console.error('Templated email error:', error);
    return {
      success: false,
      message: 'Failed to send templated email',
    };
  }
}
