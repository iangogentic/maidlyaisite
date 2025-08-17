import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  amount: z.number().min(0.50, 'Minimum amount is $0.50').max(10000, 'Maximum amount is $10,000'),
  currency: z.string().default('usd'),
  customer_email: z.string().email('Invalid email address'),
  customer_name: z.string().min(1, 'Customer name is required'),
  booking_data: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);
    
    // Create metadata for the payment intent
    const metadata = {
      customer_email: validatedData.customer_email,
      customer_name: validatedData.customer_name,
      booking_data: validatedData.booking_data ? JSON.stringify(validatedData.booking_data) : '',
      created_via: 'booking_flow',
    };
    
    // Create the payment intent
    const paymentIntent = await createPaymentIntent(
      validatedData.amount,
      validatedData.currency,
      metadata
    );
    
    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create payment intent'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');
    
    if (!paymentIntentId) {
      return NextResponse.json({
        success: false,
        message: 'Payment intent ID is required'
      }, { status: 400 });
    }
    
    const { retrievePaymentIntent } = await import('@/lib/stripe');
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    
    return NextResponse.json({
      success: true,
      payment_intent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      }
    });
    
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve payment intent'
    }, { status: 500 });
  }
}
