import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { bookings } from '@/lib/database-neon';
import { 
  sendBookingConfirmationSMS, 
  sendServiceReminderSMS, 
  sendCrewArrivalSMS, 
  sendServiceCompleteSMS 
} from '@/lib/sms-service';

// Schema for notification request
const notificationSchema = z.object({
  type: z.enum([
    'booking_confirmation',
    'service_reminder', 
    'crew_arrival',
    'service_complete'
  ]),
  customMessage: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid booking ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { type, customMessage } = notificationSchema.parse(body);
    
    // Get booking details
    const booking = await bookings.getById(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }

    // Check if customer has phone number
    if (!booking.customer_phone) {
      return NextResponse.json({
        success: false,
        message: 'Customer phone number not available'
      }, { status: 400 });
    }

    let result;
    
    // Send appropriate notification based on type
    switch (type) {
      case 'booking_confirmation':
        result = await sendBookingConfirmationSMS(booking);
        break;
        
      case 'service_reminder':
        result = await sendServiceReminderSMS(booking);
        break;
        
      case 'crew_arrival':
        result = await sendCrewArrivalSMS(booking);
        break;
        
      case 'service_complete':
        result = await sendServiceCompleteSMS(booking);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid notification type'
        }, { status: 400 });
    }

    // Log notification attempt (you might want to store this in database)
    console.log(`SMS notification sent for booking ${bookingId}:`, {
      type,
      to: booking.customer_phone,
      success: result.success,
      messageId: result.id,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} notification sent successfully`,
        notificationId: result.id,
        sentTo: booking.customer_phone,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Booking notification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.issues,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send notification',
    }, { status: 500 });
  }
}
