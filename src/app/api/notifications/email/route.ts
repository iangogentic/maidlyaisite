import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, verifyEmailConfig, sendTestEmail } from '@/lib/email-service';
import { z } from 'zod';

// Schema for email sending
const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().min(1, 'HTML content is required'),
  options: z.object({
    from: z.string().email().optional(),
    replyTo: z.string().email().optional(),
    cc: z.array(z.string().email()).optional(),
    bcc: z.array(z.string().email()).optional(),
  }).optional(),
});

// Schema for test email
const testEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a test email request
    if (body.action === 'test') {
      const { to } = testEmailSchema.parse(body);
      const result = await sendTestEmail(to);
      
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }
    
    // Check if this is a config verification request
    if (body.action === 'verify') {
      const result = await verifyEmailConfig();
      
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }
    
    // Regular email sending
    const { to, subject, html, options } = sendEmailSchema.parse(body);
    const result = await sendEmail(to, subject, html, options);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
    
  } catch (error) {
    console.error('Email API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return email configuration status
    const result = await verifyEmailConfig();
    
    return NextResponse.json({
      configured: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Email config check error:', error);
    
    return NextResponse.json(
      {
        configured: false,
        message: 'Failed to check email configuration',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
