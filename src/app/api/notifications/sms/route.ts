import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendSMS, getSMSStatus, sendBulkSMS } from '@/lib/sms-service';

// Schema for single SMS request
const smsSchema = z.object({
  to: z.string().min(1, 'Phone number is required'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
  from: z.string().optional(),
  statusCallback: z.string().url().optional(),
});

// Schema for bulk SMS request
const bulkSmsSchema = z.object({
  messages: z.array(z.object({
    to: z.string().min(1, 'Phone number is required'),
    message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
  })).min(1, 'At least one message is required').max(100, 'Too many messages'),
  from: z.string().optional(),
  batchSize: z.number().min(1).max(20).optional(),
  delayBetweenBatches: z.number().min(0).max(10000).optional(),
});

// Schema for status check request
const statusSchema = z.object({
  messageSid: z.string().min(1, 'Message SID is required'),
});

// Send single SMS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a bulk request
    if (body.messages && Array.isArray(body.messages)) {
      const { messages, from, batchSize, delayBetweenBatches } = bulkSmsSchema.parse(body);
      
      const results = await sendBulkSMS(messages, {
        from,
        batchSize,
        delayBetweenBatches,
      });
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return NextResponse.json({
        success: true,
        message: `Bulk SMS processing complete. ${successCount} sent, ${failureCount} failed.`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
        }
      });
    }
    
    // Single SMS request
    const { to, message, from, statusCallback } = smsSchema.parse(body);
    
    const result = await sendSMS(to, message, {
      from,
      statusCallback,
    });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        id: result.id,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('SMS API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.issues,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send SMS',
    }, { status: 500 });
  }
}

// Check SMS delivery status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageSid = searchParams.get('messageSid');
    
    if (!messageSid) {
      return NextResponse.json({
        success: false,
        message: 'Message SID is required',
      }, { status: 400 });
    }
    
    const { messageSid: validatedSid } = statusSchema.parse({ messageSid });
    
    const status = await getSMSStatus(validatedSid);
    
    if (status) {
      return NextResponse.json({
        success: true,
        status,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Status not found',
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('SMS status API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.issues,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get SMS status',
    }, { status: 500 });
  }
}
