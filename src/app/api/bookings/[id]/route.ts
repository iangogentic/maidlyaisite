import { NextRequest, NextResponse } from 'next/server';
import { bookings, serviceNotes } from '@/lib/database-neon';

export async function GET(
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
    
    const booking = await bookings.getById(bookingId);
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }
    
    // Get service notes for this booking
    const notes = await serviceNotes.getByBookingId(bookingId);
    
    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        service_notes: notes
      }
    });
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching booking'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    const { status } = await request.json();
    
    if (isNaN(bookingId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid booking ID'
      }, { status: 400 });
    }
    
    const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status'
      }, { status: 400 });
    }
    
    const success = await bookings.updateStatus(bookingId, status);
    
    if (!success) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found or update failed'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json({
      success: false,
      message: 'Error updating booking status'
    }, { status: 500 });
  }
}
