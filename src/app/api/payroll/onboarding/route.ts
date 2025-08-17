import { NextRequest, NextResponse } from 'next/server';
import { StripePayrollService } from '@/lib/stripe-payroll';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crew_member_id, return_url, refresh_url } = body;

    // Mock crew member lookup
    const crewMembers = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@maidly.ai',
        stripe_connect_account_id: 'acct_1234567890'
      },
      {
        id: 3,
        name: 'Lisa Rodriguez',
        email: 'lisa@maidly.ai',
        stripe_connect_account_id: null
      }
    ];

    const crewMember = crewMembers.find(cm => cm.id === crew_member_id);
    if (!crewMember) {
      return NextResponse.json(
        { success: false, error: 'Crew member not found' },
        { status: 404 }
      );
    }

    let accountId = crewMember.stripe_connect_account_id;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      try {
        accountId = await StripePayrollService.createConnectAccount({
          crew_member_id: crewMember.id,
          name: crewMember.name,
          email: crewMember.email,
        });
      } catch (error: any) {
        console.error('Stripe Connect account creation error:', error.message);
        return NextResponse.json(
          { 
            success: false, 
            error: error.message || 'Failed to create payment account',
            requires_connect_setup: error.message?.includes('signed up for Connect')
          },
          { status: 500 }
        );
      }
    }

    // Generate onboarding link
    try {
      const onboardingUrl = await StripePayrollService.createAccountLink(
        accountId,
        return_url || `${process.env.NEXT_PUBLIC_APP_URL}/admin/payroll/onboarding/complete`,
        refresh_url || `${process.env.NEXT_PUBLIC_APP_URL}/admin/payroll/onboarding/refresh`
      );

      return NextResponse.json({
        success: true,
        onboarding_url: onboardingUrl,
        account_id: accountId,
        crew_member: {
          id: crewMember.id,
          name: crewMember.name,
          email: crewMember.email
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to create onboarding link' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process onboarding request' },
      { status: 500 }
    );
  }
}

// Check onboarding status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID required' },
        { status: 400 }
      );
    }

    try {
      const status = await StripePayrollService.checkAccountStatus(accountId);

      return NextResponse.json({
        success: true,
        account_id: accountId,
        status: {
          charges_enabled: status.charges_enabled,
          payouts_enabled: status.payouts_enabled,
          details_submitted: status.details_submitted,
          requirements: status.requirements,
          onboarding_complete: status.charges_enabled && status.payouts_enabled && status.details_submitted,
          can_receive_payments: status.payouts_enabled
        }
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to check account status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process status request' },
      { status: 500 }
    );
  }
}
