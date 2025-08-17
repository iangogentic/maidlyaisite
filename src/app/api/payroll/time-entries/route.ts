import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Mock time entries data
    const timeEntries = [
      {
        id: 1,
        crew_member_id: 1,
        crew_member_name: 'Sarah Johnson',
        booking_id: 101,
        customer_name: 'Johnson Family',
        clock_in_time: '2024-01-15T08:00:00Z',
        clock_out_time: '2024-01-15T16:30:00Z',
        break_start_time: '2024-01-15T12:00:00Z',
        break_end_time: '2024-01-15T12:30:00Z',
        total_hours: 8.0,
        regular_hours: 8.0,
        overtime_hours: 0,
        location_clock_in: {
          latitude: 32.7767,
          longitude: -96.7970,
          address: '123 Main St, Dallas, TX'
        },
        location_clock_out: {
          latitude: 32.7767,
          longitude: -96.7970,
          address: '123 Main St, Dallas, TX'
        },
        status: 'approved',
        notes: 'Deep cleaning service completed',
        created_at: '2024-01-15T08:00:00Z'
      },
      {
        id: 2,
        crew_member_id: 1,
        crew_member_name: 'Sarah Johnson',
        booking_id: 102,
        customer_name: 'Smith Residence',
        clock_in_time: '2024-01-16T09:00:00Z',
        clock_out_time: '2024-01-16T17:00:00Z',
        break_start_time: '2024-01-16T13:00:00Z',
        break_end_time: '2024-01-16T13:30:00Z',
        total_hours: 7.5,
        regular_hours: 7.5,
        overtime_hours: 0,
        location_clock_in: {
          latitude: 32.7555,
          longitude: -96.8085,
          address: '456 Oak Ave, Dallas, TX'
        },
        location_clock_out: {
          latitude: 32.7555,
          longitude: -96.8085,
          address: '456 Oak Ave, Dallas, TX'
        },
        status: 'approved',
        notes: 'Weekly maintenance cleaning',
        created_at: '2024-01-16T09:00:00Z'
      },
      {
        id: 3,
        crew_member_id: 2,
        crew_member_name: 'Mike Chen',
        booking_id: 103,
        customer_name: 'Davis Home',
        clock_in_time: '2024-01-15T07:30:00Z',
        clock_out_time: '2024-01-15T18:00:00Z',
        break_start_time: '2024-01-15T12:30:00Z',
        break_end_time: '2024-01-15T13:00:00Z',
        total_hours: 10.0,
        regular_hours: 8.0,
        overtime_hours: 2.0,
        location_clock_in: {
          latitude: 32.7889,
          longitude: -96.7644,
          address: '789 Pine St, Dallas, TX'
        },
        location_clock_out: {
          latitude: 32.7889,
          longitude: -96.7644,
          address: '789 Pine St, Dallas, TX'
        },
        status: 'approved',
        notes: 'Move-out cleaning with overtime',
        created_at: '2024-01-15T07:30:00Z'
      },
      {
        id: 4,
        crew_member_id: 3,
        crew_member_name: 'Lisa Rodriguez',
        booking_id: null,
        customer_name: null,
        clock_in_time: '2024-01-17T08:00:00Z',
        clock_out_time: null, // Currently clocked in
        break_start_time: null,
        break_end_time: null,
        total_hours: 0,
        regular_hours: 0,
        overtime_hours: 0,
        location_clock_in: {
          latitude: 32.7767,
          longitude: -96.7970,
          address: 'Maidly HQ, Dallas, TX'
        },
        location_clock_out: null,
        status: 'active',
        notes: 'Training session',
        created_at: '2024-01-17T08:00:00Z'
      }
    ];

    // Filter by crew member if specified
    let filteredEntries = timeEntries;
    if (crewMemberId) {
      filteredEntries = timeEntries.filter(entry => 
        entry.crew_member_id === parseInt(crewMemberId)
      );
    }

    // Calculate summary statistics
    const summary = {
      total_entries: filteredEntries.length,
      total_hours: filteredEntries.reduce((sum, entry) => sum + entry.total_hours, 0),
      regular_hours: filteredEntries.reduce((sum, entry) => sum + entry.regular_hours, 0),
      overtime_hours: filteredEntries.reduce((sum, entry) => sum + entry.overtime_hours, 0),
      active_entries: filteredEntries.filter(entry => entry.status === 'active').length,
      pending_approval: filteredEntries.filter(entry => entry.status === 'completed').length
    };

    return NextResponse.json({
      success: true,
      time_entries: filteredEntries,
      summary,
      totalCount: filteredEntries.length
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      crew_member_id, 
      booking_id, 
      action, // 'clock_in', 'clock_out', 'break_start', 'break_end'
      location,
      notes 
    } = body;

    const timestamp = new Date().toISOString();

    // Mock time entry creation/update
    const timeEntry = {
      id: Date.now(),
      crew_member_id,
      booking_id,
      action,
      timestamp,
      location,
      notes,
      status: action === 'clock_out' ? 'completed' : 'active'
    };

    return NextResponse.json({
      success: true,
      time_entry: timeEntry,
      message: `Successfully ${action.replace('_', ' ')}`
    });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}
