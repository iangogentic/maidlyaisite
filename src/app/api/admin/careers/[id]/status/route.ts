import { NextRequest, NextResponse } from 'next/server';
import { careerApplications, adminSessions } from '@/lib/database-neon';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected'])
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);

    // Update application status
    const resolvedParams = await params;
    const applicationId = parseInt(resolvedParams.id);
    if (isNaN(applicationId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid application ID'
      }, { status: 400 });
    }

    const success = await careerApplications.updateStatus(applicationId, validatedData.status);
    
    if (!success) {
      return NextResponse.json({
        success: false,
        message: 'Application not found or update failed'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully'
    });

  } catch (error) {
    console.error('Status update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status value',
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
