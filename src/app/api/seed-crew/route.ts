import { NextResponse } from 'next/server';
import { seedCrewMembers } from '@/lib/seed-crew';

export async function POST() {
  try {
    await seedCrewMembers();
    
    return NextResponse.json({
      success: true,
      message: 'Crew members seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding crew members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed crew members' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed crew members',
    endpoint: '/api/seed-crew'
  });
}
