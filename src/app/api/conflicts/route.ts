import { NextRequest, NextResponse } from 'next/server';
import { bookings, crewMembers, timeEntries } from '@/lib/database-neon';
import { createConflictDetector, detectConflictsForDateRange } from '@/lib/conflict-detector';
import { z } from 'zod';

const conflictQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bookingId: z.string().optional(),
  includeResolved: z.boolean().default(false)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      bookingId: searchParams.get('bookingId') || undefined,
      includeResolved: searchParams.get('includeResolved') === 'true'
    };

    const validatedQuery = conflictQuerySchema.parse(query);

    // Fetch all necessary data
    const [allBookings, allCrewMembers, allTimeEntries] = await Promise.all([
      bookings.getAll(),
      crewMembers.getAll(),
      timeEntries.getAll()
    ]);

    // Filter out resolved conflicts if requested
    const activeBookings = validatedQuery.includeResolved 
      ? allBookings 
      : allBookings.filter(b => ['scheduled', 'confirmed', 'in_progress'].includes(b.status));

    const context = {
      bookings: activeBookings,
      crewMembers: allCrewMembers,
      timeEntries: allTimeEntries,
      // TODO: Add travel time matrix from external service
      travelTimeMatrix: {}
    };

    let conflicts;

    if (validatedQuery.bookingId) {
      // Detect conflicts for a specific booking
      const detector = createConflictDetector(context);
      conflicts = detector.detectBookingConflicts(parseInt(validatedQuery.bookingId));
    } else if (validatedQuery.startDate && validatedQuery.endDate) {
      // Detect conflicts for a date range
      conflicts = detectConflictsForDateRange(
        validatedQuery.startDate,
        validatedQuery.endDate,
        context
      );
    } else {
      // Detect all conflicts
      const detector = createConflictDetector(context);
      conflicts = detector.detectAllConflicts();
    }

    // Calculate summary statistics
    const summary = {
      totalConflicts: conflicts.length,
      bySeverity: {
        critical: conflicts.filter(c => c.severity === 'critical').length,
        high: conflicts.filter(c => c.severity === 'high').length,
        medium: conflicts.filter(c => c.severity === 'medium').length,
        low: conflicts.filter(c => c.severity === 'low').length
      },
      byType: {
        time_overlap: conflicts.filter(c => c.type === 'time_overlap').length,
        crew_double_booking: conflicts.filter(c => c.type === 'crew_double_booking').length,
        crew_unavailable: conflicts.filter(c => c.type === 'crew_unavailable').length,
        travel_time: conflicts.filter(c => c.type === 'travel_time').length,
        resource_unavailable: conflicts.filter(c => c.type === 'resource_unavailable').length
      },
      affectedBookings: [...new Set(conflicts.flatMap(c => c.affectedBookings))].length,
      affectedCrewMembers: [...new Set(conflicts.flatMap(c => c.affectedCrewMembers || []))].length
    };

    return NextResponse.json({
      success: true,
      conflicts,
      summary,
      query: validatedQuery,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error detecting conflicts:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, conflictId, parameters } = body;

    if (!action || !conflictId) {
      return NextResponse.json({
        success: false,
        message: 'Action and conflictId are required'
      }, { status: 400 });
    }

    // Handle conflict resolution actions
    switch (action) {
      case 'resolve':
        // Mark conflict as resolved (would typically update a conflicts table)
        return NextResponse.json({
          success: true,
          message: 'Conflict marked as resolved',
          conflictId
        });

      case 'apply_suggestion':
        // Apply a suggested resolution
        const result = await applyResolutionSuggestion(conflictId, parameters);
        return NextResponse.json({
          success: result.success,
          message: result.message,
          data: result.data
        });

      case 'dismiss':
        // Dismiss conflict (mark as acknowledged but not resolved)
        return NextResponse.json({
          success: true,
          message: 'Conflict dismissed',
          conflictId
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Unknown action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error handling conflict action:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * Apply a resolution suggestion
 */
async function applyResolutionSuggestion(conflictId: string, parameters: any) {
  try {
    const { suggestionId, bookingId, ...params } = parameters;

    switch (suggestionId) {
      case 'reschedule_booking_1':
      case 'reschedule_booking_2':
      case 'reschedule_for_availability':
        // Reschedule booking logic would go here
        // This would typically update the booking's scheduled_date and scheduled_time
        return {
          success: true,
          message: 'Booking rescheduled successfully',
          data: { bookingId, action: 'rescheduled' }
        };

      case 'reassign_crew_1':
      case 'reassign_crew_2':
      case 'reassign_available_crew':
      case 'reassign_closer_crew':
        // Crew reassignment logic would go here
        // This would typically update the crew assignment for the booking
        return {
          success: true,
          message: 'Crew reassigned successfully',
          data: { bookingId, action: 'crew_reassigned' }
        };

      case 'extend_time_slot':
      case 'extend_time_between':
        // Time extension logic would go here
        // This would typically update booking durations or add buffer time
        return {
          success: true,
          message: 'Time extended successfully',
          data: { bookingId, action: 'time_extended' }
        };

      case 'add_crew_member':
        // Add crew member logic would go here
        return {
          success: true,
          message: 'Additional crew member assigned',
          data: { action: 'crew_added' }
        };

      default:
        return {
          success: false,
          message: 'Unknown suggestion type'
        };
    }

  } catch (error) {
    console.error('Error applying resolution suggestion:', error);
    return {
      success: false,
      message: 'Failed to apply resolution suggestion'
    };
  }
}
