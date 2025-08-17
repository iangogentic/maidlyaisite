import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crew_member_id, amount_cents, description, crew_member_email, crew_member_name } = body;

    // Create a payment intent for crew payroll
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: 'usd',
      description: description || `Payroll payment for ${crew_member_name}`,
      metadata: {
        crew_member_id: crew_member_id.toString(),
        crew_member_name,
        crew_member_email,
        payment_type: 'payroll',
        created_at: new Date().toISOString()
      },
      // For sandbox testing, we can simulate automatic confirmation
      confirm: false,
      payment_method_types: ['card']
    });

    // Also create/update customer record
    let customer;
    try {
      customer = await stripe.customers.create({
        name: crew_member_name,
        email: crew_member_email,
        metadata: {
          crew_member_id: crew_member_id.toString(),
          role: 'crew_member'
        }
      });
    } catch (customerError) {
      console.log('Customer creation skipped:', customerError);
    }

    return NextResponse.json({
      success: true,
      payment_intent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        description: paymentIntent.description,
        client_secret: paymentIntent.client_secret
      },
      customer: customer ? {
        id: customer.id,
        name: customer.name,
        email: customer.email
      } : null,
      message: 'Payroll payment intent created successfully'
    });
  } catch (error: any) {
    console.error('Error creating payroll payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create payroll payment',
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}

// Get payment history for crew members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');

    // Get payment intents with payroll metadata
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 50,
      ...(crewMemberId && {
        metadata: {
          crew_member_id: crewMemberId
        }
      })
    });

    const payments = paymentIntents.data
      .filter(pi => pi.metadata.payment_type === 'payroll')
      .map(pi => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        description: pi.description,
        crew_member_id: pi.metadata.crew_member_id,
        crew_member_name: pi.metadata.crew_member_name,
        created: new Date(pi.created * 1000).toISOString(),
        metadata: pi.metadata
      }));

    return NextResponse.json({
      success: true,
      payments,
      total_count: payments.length,
      total_amount: payments.reduce((sum, p) => sum + p.amount, 0)
    });
  } catch (error: any) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
