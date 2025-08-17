import { NextRequest, NextResponse } from 'next/server';
import { customerInterests, adminSessions } from '@/lib/database-neon';

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const session = await adminSessions.getByToken(sessionToken);
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 });
    }

    // Fetch all customer interests
    const customers = await customerInterests.getAll();
    const totalCount = await customerInterests.count();

    // Calculate summary statistics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentCustomers = customers.filter(customer => 
      new Date(customer.created_at || '') >= weekAgo
    ).length;

    // Group by cleaning frequency
    const byFrequency: Record<string, number> = {};
    customers.forEach(customer => {
      if (customer.cleaning_frequency) {
        byFrequency[customer.cleaning_frequency] = (byFrequency[customer.cleaning_frequency] || 0) + 1;
      }
    });

    // Group by budget range
    const byBudget: Record<string, number> = {};
    customers.forEach(customer => {
      if (customer.budget_range) {
        byBudget[customer.budget_range] = (byBudget[customer.budget_range] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        customers,
        totalCount,
        summary: {
          total: totalCount,
          recent: recentCustomers,
          byFrequency,
          byBudget
        }
      }
    });

  } catch (error) {
    console.error('Admin customers fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
