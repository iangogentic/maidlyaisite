import { NextRequest, NextResponse } from 'next/server';
import { careerApplications, acceptanceDocuments } from '@/lib/database-neon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find application by token
    const application = await careerApplications.getByToken(token);
    
    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired acceptance token'
      }, { status: 404 });
    }

    // Check if application is accepted
    if (application.status !== 'accepted') {
      return NextResponse.json({
        success: false,
        message: 'Application has not been accepted yet'
      }, { status: 403 });
    }

    // Get any existing documents
    const documents = await acceptanceDocuments.getByApplicationId(application.id!);

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          name: application.name,
          email: application.email,
          role_interest: application.role_interest,
          created_at: application.created_at
        },
        documents,
        hasSignedDocuments: documents.some(doc => doc.signed_at)
      }
    });

  } catch (error) {
    console.error('Acceptance page error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    // Find application by token
    const application = await careerApplications.getByToken(token);
    
    if (!application) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired acceptance token'
      }, { status: 404 });
    }

    // Check if application is accepted
    if (application.status !== 'accepted') {
      return NextResponse.json({
        success: false,
        message: 'Application has not been accepted yet'
      }, { status: 403 });
    }

    // Save document data
    const documentId = await acceptanceDocuments.create(
      application.id!,
      body.documentType || 'acceptance_form',
      body.documentData
    );

    // Mark as signed if specified
    if (body.signed && documentId) {
      await acceptanceDocuments.markSigned(documentId);
    }

    return NextResponse.json({
      success: true,
      message: 'Document saved successfully',
      documentId
    });

  } catch (error) {
    console.error('Document save error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
