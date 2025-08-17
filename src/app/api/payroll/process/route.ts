import { NextRequest, NextResponse } from 'next/server';
import { StripePayrollService } from '@/lib/stripe-payroll';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payroll_period_id, crew_member_ids, pay_date } = body;

    // Mock payroll processing
    const payrollResults = [];
    const errors = [];

    // Sample crew members with their calculated pay
    const crewPayroll = [
      {
        crew_member_id: 1,
        name: 'Sarah Johnson',
        stripe_connect_account_id: 'acct_1234567890',
        regular_hours: 38.5,
        overtime_hours: 0,
        hourly_rate: 18.50,
        bonuses: 5000, // $50 bonus in cents
        deductions: 0,
        gross_pay: 71225, // $712.25
        net_pay: 71225
      },
      {
        crew_member_id: 2,
        name: 'Mike Chen',
        stripe_connect_account_id: 'acct_0987654321',
        regular_hours: 40.0,
        overtime_hours: 2.0,
        hourly_rate: 20.00,
        bonuses: 10000, // $100 performance bonus
        deductions: 0,
        gross_pay: 86000, // $860.00 (40 * $20 + 2 * $30 + $100)
        net_pay: 86000
      },
      {
        crew_member_id: 3,
        name: 'Lisa Rodriguez',
        stripe_connect_account_id: null, // Not onboarded yet
        regular_hours: 35.0,
        overtime_hours: 0,
        hourly_rate: 19.25,
        bonuses: 0,
        deductions: 2500, // $25 uniform deduction
        gross_pay: 67375,
        net_pay: 64875
      }
    ];

    // Process payments for each crew member
    for (const payroll of crewPayroll) {
      if (!crew_member_ids || crew_member_ids.includes(payroll.crew_member_id)) {
        if (payroll.stripe_connect_account_id) {
          try {
            // Send payment via Stripe Connect
            const transferId = await StripePayrollService.sendPayout({
              connect_account_id: payroll.stripe_connect_account_id,
              amount_cents: payroll.net_pay,
              description: `Payroll for period ${payroll_period_id}`,
              metadata: {
                crew_member_id: payroll.crew_member_id.toString(),
                payroll_period_id: payroll_period_id?.toString() || 'current',
                regular_hours: payroll.regular_hours.toString(),
                overtime_hours: payroll.overtime_hours.toString()
              }
            });

            payrollResults.push({
              crew_member_id: payroll.crew_member_id,
              name: payroll.name,
              amount_paid: payroll.net_pay,
              transfer_id: transferId,
              status: 'paid',
              payment_date: new Date().toISOString()
            });
          } catch (error) {
            errors.push({
              crew_member_id: payroll.crew_member_id,
              name: payroll.name,
              error: error instanceof Error ? error.message : 'Payment failed',
              amount: payroll.net_pay
            });
          }
        } else {
          // Crew member not onboarded to Stripe
          errors.push({
            crew_member_id: payroll.crew_member_id,
            name: payroll.name,
            error: 'Stripe Connect account not set up',
            amount: payroll.net_pay,
            action_required: 'onboarding'
          });
        }
      }
    }

    const totalPaid = payrollResults.reduce((sum, result) => sum + result.amount_paid, 0);
    const totalFailed = errors.reduce((sum, error) => sum + (error.amount || 0), 0);

    return NextResponse.json({
      success: true,
      payroll_period_id,
      summary: {
        total_processed: payrollResults.length,
        total_failed: errors.length,
        total_amount_paid: totalPaid,
        total_amount_failed: totalFailed,
        processing_date: new Date().toISOString()
      },
      successful_payments: payrollResults,
      failed_payments: errors,
      message: `Processed ${payrollResults.length} payments successfully, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Error processing payroll:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payroll' },
      { status: 500 }
    );
  }
}

// Get payroll periods and history
export async function GET() {
  try {
    const payrollPeriods = [
      {
        id: 1,
        start_date: '2024-01-01',
        end_date: '2024-01-15',
        pay_date: '2024-01-20',
        status: 'paid',
        total_amount_cents: 245600, // $2,456.00
        total_crew_members: 4,
        created_at: '2024-01-16T10:00:00Z',
        processed_at: '2024-01-20T14:30:00Z'
      },
      {
        id: 2,
        start_date: '2024-01-16',
        end_date: '2024-01-31',
        pay_date: '2024-02-05',
        status: 'processing',
        total_amount_cents: 267800, // $2,678.00
        total_crew_members: 4,
        created_at: '2024-02-01T10:00:00Z',
        processed_at: null
      },
      {
        id: 3,
        start_date: '2024-02-01',
        end_date: '2024-02-15',
        pay_date: '2024-02-20',
        status: 'draft',
        total_amount_cents: 289400, // $2,894.00
        total_crew_members: 4,
        created_at: '2024-02-16T10:00:00Z',
        processed_at: null
      }
    ];

    return NextResponse.json({
      success: true,
      payroll_periods: payrollPeriods,
      current_period: payrollPeriods.find(p => p.status === 'draft'),
      totalCount: payrollPeriods.length
    });
  } catch (error) {
    console.error('Error fetching payroll periods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll periods' },
      { status: 500 }
    );
  }
}
