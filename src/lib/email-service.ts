"use server";

import nodemailer from 'nodemailer';

export interface EmailResult {
  success: boolean;
  message: string;
  id?: string;
  error?: string;
}

export interface EmailOptions {
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Initialize nodemailer transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error('Missing required SMTP configuration. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates for development
      },
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
      } else {
        console.log('SMTP server is ready to take our messages');
      }
    });
  }

  return transporter;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send an email using nodemailer
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options: EmailOptions = {}
): Promise<EmailResult> {
  try {
    // Validate email address
    if (!isValidEmail(to)) {
      return {
        success: false,
        message: 'Invalid email address format',
        error: 'INVALID_EMAIL',
      };
    }

    // Get transporter
    const transporter = getTransporter();

    // Prepare email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: options.from || process.env.SMTP_USER || 'noreply@maidly.ai',
      to,
      subject,
      html,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return {
      success: true,
      message: 'Email sent successfully',
      id: info.messageId,
    };

  } catch (error: any) {
    console.error('Email sending error:', error);
    
    let errorMessage = 'Failed to send email';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code) {
      errorCode = error.code;
      switch (error.code) {
        case 'EAUTH':
          errorMessage = 'Authentication failed. Please check your SMTP credentials.';
          break;
        case 'ECONNECTION':
          errorMessage = 'Connection failed. Please check your SMTP server settings.';
          break;
        case 'EMESSAGE':
          errorMessage = 'Invalid message format.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }

    return {
      success: false,
      message: errorMessage,
      error: errorCode,
    };
  }
}

/**
 * Send multiple emails in batches
 */
export async function sendBulkEmail(
  emails: Array<{ to: string; subject: string; html: string; options?: EmailOptions }>,
  batchOptions: {
    batchSize?: number;
    delayBetweenBatches?: number;
  } = {}
): Promise<Array<EmailResult & { to: string }>> {
  const { batchSize = 10, delayBetweenBatches = 1000 } = batchOptions;
  const results: Array<EmailResult & { to: string }> = [];

  // Process emails in batches
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    // Send batch concurrently
    const batchPromises = batch.map(async (email) => {
      const result = await sendEmail(email.to, email.subject, email.html, email.options);
      return { ...result, to: email.to };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches (except for the last batch)
    if (i + batchSize < emails.length && delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<EmailResult> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    
    return {
      success: true,
      message: 'Email configuration is valid',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Email configuration is invalid',
      error: error.message,
    };
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  const testHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">🏠 Maidly.ai</h1>
        <h2 style="color: #1f2937; margin-bottom: 20px;">Email Configuration Test</h2>
      </div>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0;">✅ Success!</h3>
        <p>Your email configuration is working correctly. This is a test email sent from your Maidly.ai application.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #6b7280;">This is an automated test email from Maidly.ai</p>
      </div>
    </div>
  `;

  return await sendEmail(to, '✅ Maidly.ai Email Test', testHtml);
}
