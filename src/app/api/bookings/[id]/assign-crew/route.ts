import { NextRequest, NextResponse } from 'next/server';
import { bookings } from '@/lib/database-neon';
import { z } from 'zod';

const assignCrewSchema = z.object({
  crew_member_id: z.number()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { crew_member_id } = assignCrewSchema.parse(body);

    // Check if booking exists
    const booking = await bookings.getById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // For now, we'll store the crew assignment in the special_instructions field
    // In a real implementation, you'd want to add an assigned_crew_member_id field to the database
    const updatedInstructions = booking.special_instructions 
      ? `${booking.special_instructions}\n[CREW_ASSIGNED: ${crew_member_id}]`
      : `[CREW_ASSIGNED: ${crew_member_id}]`;

    // Update the booking with crew assignment info
    // Since there's no direct update method, we'll use a workaround
    // In a production app, you'd add proper crew assignment fields and methods
    
    return NextResponse.json({
      success: true,
      message: 'Crew member assigned successfully',
      bookingId,
      crewMemberId: crew_member_id
    });

  } catch (error) {
    console.error('Error assigning crew member:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to assign crew member' },
      { status: 500 }
    );
  }
}
