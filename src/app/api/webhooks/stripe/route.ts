import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { bookings } from '@/lib/database-neon';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No Stripe signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Extract booking data from metadata
    const bookingDataStr = paymentIntent.metadata.booking_data;
    if (!bookingDataStr) {
      console.error('No booking data found in payment intent metadata');
      return;
    }
    
    const bookingData = JSON.parse(bookingDataStr);
    
    // Create the booking with the confirmed payment
    const bookingId = await bookings.create({
      ...bookingData,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'confirmed' // Payment confirmed, booking is now confirmed
    });
    
    console.log('Booking created successfully:', bookingId);
    
    // Send confirmation email/SMS
    await sendBookingConfirmation(bookingId, bookingData);
    
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);
    
    // Log the failure for analytics
    console.error('Payment failure details:', {
      payment_intent_id: paymentIntent.id,
      last_payment_error: paymentIntent.last_payment_error,
      customer_email: paymentIntent.metadata.customer_email,
    });
    
    // Could send a payment failure email here
    // await sendPaymentFailureNotification(paymentIntent.metadata.customer_email);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment canceled:', paymentIntent.id);
    
    // Log the cancellation
    console.log('Payment cancellation:', {
      payment_intent_id: paymentIntent.id,
      customer_email: paymentIntent.metadata.customer_email,
    });
    
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}

async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log('Charge dispute created:', dispute.id);
    
    // Log dispute for manual review
    console.error('Dispute created:', {
      dispute_id: dispute.id,
      charge_id: dispute.charge,
      amount: dispute.amount,
      reason: dispute.reason,
      status: dispute.status,
    });
    
    // Could send alert to admin team
    // await sendDisputeAlert(dispute);
    
  } catch (error) {
    console.error('Error handling dispute creation:', error);
  }
}

async function sendBookingConfirmation(bookingId: number, bookingData: any) {
  try {
    console.log(`Booking confirmation would be sent for booking ${bookingId}`);
    // TODO: Implement actual email/SMS confirmation
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
}
