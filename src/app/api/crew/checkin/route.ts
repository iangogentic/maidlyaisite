import { NextRequest, NextResponse } from 'next/server';
import { timeEntries, crewMembers, crewLocations } from '@/lib/database-neon';
// import { triggerCrewNotification } from '@/lib/notification-triggers'; // TODO: Implement crew notifications
import { z } from 'zod';

// Validation schemas
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  address: z.string().optional(),
  timestamp: z.string().optional()
});

const checkInSchema = z.object({
  crew_member_id: z.number().positive(),
  booking_id: z.number().positive().optional(),
  location: locationSchema,
  activity_type: z.enum(['clock_in', 'clock_out', 'break_start', 'break_end', 'job_arrival', 'job_departure']),
  notes: z.string().max(500).optional()
});

// Reverse geocoding function (simplified - in production use Google Maps API)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // In production, use Google Maps Geocoding API or similar
    // For now, return a formatted coordinate string
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// Calculate distance between two points (Haversine formula)
// TODO: Implement distance calculation for crew location verification
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checkInSchema.parse(body);
    
    const { crew_member_id, booking_id, location, activity_type, notes } = validatedData;
    
    // Verify crew member exists
    const crewMember = await crewMembers.getById(crew_member_id);
    if (!crewMember) {
      return NextResponse.json(
        { success: false, error: 'Crew member not found' },
        { status: 404 }
      );
    }
    
    // Add address if not provided
    if (!location.address) {
      location.address = await reverseGeocode(location.latitude, location.longitude);
    }
    
    // Add timestamp if not provided
    if (!location.timestamp) {
      location.timestamp = new Date().toISOString();
    }
    
    // Record location
    await crewLocations.create({
      crew_member_id,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address,
      timestamp: location.timestamp,
      activity_type
    });
    
    const result: any = { success: true };
    
    // Handle different activity types
    switch (activity_type) {
      case 'clock_in':
        // Check if already clocked in
        const existingEntries = await timeEntries.getByCrewMember(crew_member_id);
        const activeEntry = existingEntries.find(entry => entry.status === 'active');
        
        if (activeEntry) {
          return NextResponse.json(
            { success: false, error: 'Already clocked in. Please clock out first.' },
            { status: 400 }
          );
        }
        
        const entryId = await timeEntries.clockIn(crew_member_id, {
          ...location,
          timestamp: location.timestamp || new Date().toISOString()
        }, booking_id);
        result.time_entry_id = entryId;
        result.message = 'Successfully clocked in';
        break;
        
      case 'clock_out':
        // Find active time entry
        const activeEntries = await timeEntries.getByCrewMember(crew_member_id);
        const currentEntry = activeEntries.find(entry => entry.status === 'active');
        
        if (!currentEntry) {
          return NextResponse.json(
            { success: false, error: 'No active time entry found. Please clock in first.' },
            { status: 400 }
          );
        }
        
        const clockOutSuccess = await timeEntries.clockOut(currentEntry.id!, {
          ...location,
          timestamp: location.timestamp || new Date().toISOString()
        }, notes);
        if (!clockOutSuccess) {
          return NextResponse.json(
            { success: false, error: 'Failed to clock out' },
            { status: 500 }
          );
        }
        
        result.message = 'Successfully clocked out';
        break;
        
      case 'job_arrival':
      case 'job_departure':
        // Update crew member status based on activity
        const newStatus = activity_type === 'job_arrival' ? 'on_job' : 'available';
        await crewMembers.updateStatus(crew_member_id, newStatus);
        result.message = `Successfully recorded ${activity_type.replace('_', ' ')}`;
        break;
        
      case 'break_start':
      case 'break_end':
        // Update crew member status
        const breakStatus = activity_type === 'break_start' ? 'break' : 'on_job';
        await crewMembers.updateStatus(crew_member_id, breakStatus);
        result.message = `Successfully recorded ${activity_type.replace('_', ' ')}`;
        break;
        
      default:
        result.message = 'Location recorded successfully';
    }
    
    // Add location verification info
    result.location = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address,
      timestamp: location.timestamp
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Check-in API error:', error);
    
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');
    
    if (!crewMemberId) {
      return NextResponse.json(
        { success: false, error: 'crew_member_id is required' },
        { status: 400 }
      );
    }
    
    // Get current status
    const crewMember = await crewMembers.getById(parseInt(crewMemberId));
    if (!crewMember) {
      return NextResponse.json(
        { success: false, error: 'Crew member not found' },
        { status: 404 }
      );
    }
    
    // Get latest location
    const latestLocation = await crewLocations.getLatestByCrewMember(parseInt(crewMemberId));
    
    // Get active time entry
    const timeEntriesData = await timeEntries.getByCrewMember(parseInt(crewMemberId));
    const activeEntry = timeEntriesData.find(entry => entry.status === 'active');
    
    return NextResponse.json({
      success: true,
      crew_member: {
        id: crewMember.id,
        name: crewMember.name,
        status: crewMember.status
      },
      latest_location: latestLocation,
      active_time_entry: activeEntry,
      can_clock_in: !activeEntry,
      can_clock_out: !!activeEntry
    });
    
  } catch (error) {
    console.error('Check-in status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
