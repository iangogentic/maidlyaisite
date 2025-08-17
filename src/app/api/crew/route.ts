import { NextRequest, NextResponse } from 'next/server';
import { crewMembers, crewLocations, timeEntries } from '@/lib/database-neon';
import { z } from 'zod';

const crewMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20, 'Phone number too long').optional(),
  employee_id: z.string().max(50, 'Employee ID too long').optional(),
  hourly_rate_cents: z.number().min(0, 'Rate must be positive'),
  hire_date: z.string().optional(),
  certifications: z.array(z.string()).default([]),
  emergency_contact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional()
});

export async function GET() {
  try {
    // Get all crew members
    const members = await crewMembers.getAll();
    
    // Get current locations for each crew member
    const membersWithLocations = await Promise.all(
      members.map(async (member) => {
        const latestLocation = await crewLocations.getLatestByCrewMember(member.id!);
        const activeTimeEntries = await timeEntries.getByCrewMember(member.id!);
        const activeEntry = activeTimeEntries.find(entry => entry.status === 'active');
        
        return {
          ...member,
          latest_location: latestLocation,
          active_time_entry: activeEntry,
          is_clocked_in: !!activeEntry
        };
      })
    );

    return NextResponse.json({
      success: true,
      crew_members: membersWithLocations,
      totalCount: membersWithLocations.length
    });
  } catch (error) {
    console.error('Error fetching crew members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch crew members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = crewMemberSchema.parse(body);
    
    // Create crew member
    const crewMemberId = await crewMembers.create({
      ...validatedData,
      status: 'available'
    });
    
    // Get the created crew member with full data
    const newCrewMember = await crewMembers.getById(crewMemberId);

    return NextResponse.json({
      success: true,
      crew_member: newCrewMember,
      message: 'Crew member created successfully'
    });
  } catch (error) {
    console.error('Error creating crew member:', error);
    
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
    
    // Handle database constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23505') { // Unique constraint violation
        if ('constraint' in error && error.constraint === 'crew_members_email_key') {
          return NextResponse.json(
            { success: false, error: 'A crew member with this email address already exists' },
            { status: 409 }
          );
        }
        // Generic duplicate key error
        return NextResponse.json(
          { success: false, error: 'A crew member with this information already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create crew member' },
      { status: 500 }
    );
  }
}
