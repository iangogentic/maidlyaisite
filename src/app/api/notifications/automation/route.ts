import { NextRequest, NextResponse } from 'next/server';
import { 
  sendAutomatedEmail, 
  getEmailTemplates, 
  getAutomationRules,
  sendTemplatedEmail 
} from '@/lib/email-automation';
import { z } from 'zod';

// Schema for triggering automation
const triggerAutomationSchema = z.object({
  trigger: z.enum(['booking_created', 'service_reminder', 'crew_arrival', 'service_complete', 'payment_received', 'custom']),
  booking: z.object({
    id: z.number().optional(),
    customer_email: z.string().email(),
    customer_name: z.string(),
    customer_phone: z.string().optional(),
    service_type: z.string(),
    cleaning_type: z.string(),
    scheduled_date: z.string(),
    scheduled_time: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip_code: z.string(),
    total_price: z.number(),
    photos: z.array(z.any()).optional(),
  }),
  customData: z.record(z.string(), z.any()).optional(),
});

// Schema for sending templated email
const templatedEmailSchema = z.object({
  templateId: z.string(),
  to: z.string().email(),
  data: z.record(z.string(), z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a templated email request
    if (body.action === 'send_template') {
      const { templateId, to, data } = templatedEmailSchema.parse(body);
      const result = await sendTemplatedEmail(templateId, to, data);
      
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }
    
    // Regular automation trigger
    const { trigger, booking, customData } = triggerAutomationSchema.parse(body);
    const result = await sendAutomatedEmail(trigger, booking, customData);
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
    
  } catch (error) {
    console.error('Email automation API error:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'templates') {
      // Return available email templates
      const templates = await getEmailTemplates();
      return NextResponse.json({
        success: true,
        templates,
      });
    }
    
    if (type === 'rules') {
      // Return automation rules
      const rules = await getAutomationRules();
      return NextResponse.json({
        success: true,
        rules,
      });
    }
    
    // Return both templates and rules by default
    const templates = await getEmailTemplates();
    const rules = await getAutomationRules();
    
    return NextResponse.json({
      success: true,
      templates,
      rules,
      info: {
        totalTemplates: templates.length,
        totalRules: rules.length,
        enabledRules: rules.filter(rule => rule.enabled).length,
      },
    });
    
  } catch (error) {
    console.error('Email automation GET error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve automation data',
      },
      { status: 500 }
    );
  }
}
