import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/database-neon';
import { StripePayrollService } from '@/lib/stripe-payroll';

export async function GET() {
  try {
    // Mock crew members data with payroll information
    const crewMembers = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@maidly.ai',
        phone: '(555) 123-4567',
        employee_id: 'EMP001',
        hire_date: '2024-01-15',
        status: 'active',
        payment_type: 'hourly',
        hourly_rate: 18.50,
        stripe_connect_account_id: 'acct_1234567890',
        team_id: 1,
        total_hours_this_period: 38.5,
        gross_pay_this_period: 71225, // $712.25 in cents
        certifications: ['Basic Cleaning', 'Green Cleaning'],
        performance_rating: 4.8,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Mike Chen',
        email: 'mike@maidly.ai',
        phone: '(555) 234-5678',
        employee_id: 'EMP002',
        hire_date: '2024-02-01',
        status: 'active',
        payment_type: 'hourly',
        hourly_rate: 20.00,
        stripe_connect_account_id: 'acct_0987654321',
        team_id: 1,
        total_hours_this_period: 40.0,
        gross_pay_this_period: 80000, // $800.00 in cents
        certifications: ['Basic Cleaning', 'Deep Cleaning', 'Carpet Care'],
        performance_rating: 4.9,
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        id: 3,
        name: 'Lisa Rodriguez',
        email: 'lisa@maidly.ai',
        phone: '(555) 345-6789',
        employee_id: 'EMP003',
        hire_date: '2024-01-20',
        status: 'active',
        payment_type: 'hourly',
        hourly_rate: 19.25,
        stripe_connect_account_id: null, // Not yet onboarded
        team_id: 2,
        total_hours_this_period: 35.0,
        gross_pay_this_period: 67375, // $673.75 in cents
        certifications: ['Basic Cleaning', 'Window Cleaning'],
        performance_rating: 4.7,
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 4,
        name: 'David Kim',
        email: 'david@maidly.ai',
        phone: '(555) 456-7890',
        employee_id: 'EMP004',
        hire_date: '2024-03-01',
        status: 'active',
        payment_type: 'per_job',
        hourly_rate: null,
        commission_rate: 0.15, // 15% of job value
        stripe_connect_account_id: 'acct_1122334455',
        team_id: 2,
        total_hours_this_period: 32.0,
        gross_pay_this_period: 95000, // $950.00 in cents (commission-based)
        certifications: ['Basic Cleaning', 'Move-in/Move-out'],
        performance_rating: 4.6,
        created_at: '2024-03-01T10:00:00Z'
      }
    ];

    return NextResponse.json({
      success: true,
      crew_members: crewMembers,
      totalCount: crewMembers.length,
      summary: {
        total_active: crewMembers.filter(cm => cm.status === 'active').length,
        total_payroll_this_period: crewMembers.reduce((sum, cm) => sum + cm.gross_pay_this_period, 0),
        average_hourly_rate: crewMembers
          .filter(cm => cm.hourly_rate)
          .reduce((sum, cm) => sum + (cm.hourly_rate || 0), 0) / 
          crewMembers.filter(cm => cm.hourly_rate).length,
        pending_onboarding: crewMembers.filter(cm => !cm.stripe_connect_account_id).length
      }
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
    const { name, email, phone, hourly_rate, payment_type, address } = body;

    // Create Stripe Connect account
    let stripeAccountId = null;
    try {
      stripeAccountId = await StripePayrollService.createConnectAccount({
        crew_member_id: Date.now(), // Temporary ID
        name,
        email,
        phone,
        address,
      });
    } catch (stripeError) {
      console.error('Stripe account creation failed:', stripeError);
      // Continue without Stripe account - can be set up later
    }

    // Mock crew member creation
    const newCrewMember = {
      id: Date.now(),
      name,
      email,
      phone,
      employee_id: `EMP${String(Date.now()).slice(-3)}`,
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active',
      payment_type,
      hourly_rate: payment_type === 'hourly' ? hourly_rate : null,
      stripe_connect_account_id: stripeAccountId,
      team_id: null,
      total_hours_this_period: 0,
      gross_pay_this_period: 0,
      certifications: [],
      performance_rating: 5.0,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      crew_member: newCrewMember,
      message: 'Crew member created successfully',
      onboarding_required: !stripeAccountId
    });
  } catch (error) {
    console.error('Error creating crew member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create crew member' },
      { status: 500 }
    );
  }
}
