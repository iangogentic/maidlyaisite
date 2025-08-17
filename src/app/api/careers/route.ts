import { NextRequest, NextResponse } from 'next/server';
import { careerApplications } from '@/lib/database-neon';
import { z } from 'zod';

const careerApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  role_interest: z.enum(['COO', 'CMO', 'CTO/AI', 'CFO']).refine(
    (val) => ['COO', 'CMO', 'CTO/AI', 'CFO'].includes(val),
    { message: 'Please select a valid role' }
  ),
  portfolio_link: z.string().url('Invalid URL').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  experience_level: z.enum(['Student', 'Recent Graduate', '1-2 years', '3-5 years', '5+ years']).optional().or(z.literal('')),
  why_interested: z.string().max(1000, 'Response too long').optional().or(z.literal('')),
  availability: z.enum(['Immediately', 'Within 2 weeks', 'Within 1 month', 'Flexible']).optional().or(z.literal(''))
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = careerApplicationSchema.parse(body);
    
    // Convert empty strings to undefined for optional fields
    const cleanedData = {
      ...validatedData,
      portfolio_link: validatedData.portfolio_link || undefined,
      phone: validatedData.phone || undefined,
      linkedin: validatedData.linkedin || undefined,
      experience_level: validatedData.experience_level || undefined,
      why_interested: validatedData.why_interested || undefined,
      availability: validatedData.availability || undefined,
    };
    
    // Save to database
    const applicationId = await careerApplications.create(cleanedData);
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully!',
      applicationId
    }, { status: 201 });
    
  } catch (error) {
    console.error('Career application error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to submit application. Please try again.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Career applications endpoint',
    endpoints: {
      POST: 'Submit a new career application',
      'GET /api/admin/careers': 'Get all applications (admin only)'
    }
  });
}
