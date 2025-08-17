import { NextRequest, NextResponse } from 'next/server';
import { careerApplications, adminSessions } from '@/lib/database-neon';

async function verifyAdminSession(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  
  if (!sessionToken) {
    return false;
  }
  
  const session = await adminSessions.getByToken(sessionToken);
  return !!session;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const isAuthenticated = await verifyAdminSession(request);
    
    if (!isAuthenticated) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }
    
    // Get all career applications
    const applications = await careerApplications.getAll();
    const totalCount = await careerApplications.count();
    
    return NextResponse.json({
      success: true,
      data: {
        applications,
        totalCount,
        summary: {
          total: totalCount,
          byRole: applications.reduce((acc, app) => {
            acc[app.role_interest] = (acc[app.role_interest] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          recent: applications.filter(app => {
            const createdAt = new Date(app.created_at || '');
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return createdAt > weekAgo;
          }).length
        }
      }
    });
    
  } catch (error) {
    console.error('Admin careers API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch applications'
    }, { status: 500 });
  }
}
