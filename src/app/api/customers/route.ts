import { NextRequest, NextResponse } from 'next/server';
import { customerInterests } from '@/lib/database-neon';
import { z } from 'zod';

const customerInterestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  address: z.string().max(200, 'Address too long').optional().or(z.literal('')),
  city: z.string().max(50, 'City name too long').optional().or(z.literal('')),
  state: z.string().max(50, 'State name too long').optional().or(z.literal('')),
  zip_code: z.string().max(10, 'ZIP code too long').optional().or(z.literal('')),
  home_size: z.enum(['Studio/1BR', '2BR', '3BR', '4BR', '5+ BR', 'Other']).optional().or(z.literal('')),
  cleaning_frequency: z.enum(['Weekly', 'Bi-weekly', 'Monthly', 'One-time', 'As needed']).optional().or(z.literal('')),
  current_service: z.enum(['None', 'Individual cleaner', 'Cleaning company', 'Family/friends', 'Other']).optional().or(z.literal('')),
  budget_range: z.enum(['$50-100', '$100-200', '$200-300', '$300-500', '$500+', 'Not sure']).optional().or(z.literal('')),
  special_requests: z.string().max(500, 'Special requests too long').optional().or(z.literal('')),
  preferred_contact: z.enum(['email', 'phone', 'text']).optional().or(z.literal(''))
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = customerInterestSchema.parse(body);
    
    // Clean up empty strings to undefined
    const cleanedData = {
      ...validatedData,
      phone: validatedData.phone || undefined,
      address: validatedData.address || undefined,
      city: validatedData.city || undefined,
      state: validatedData.state || undefined,
      zip_code: validatedData.zip_code || undefined,
      home_size: validatedData.home_size || undefined,
      cleaning_frequency: validatedData.cleaning_frequency || undefined,
      current_service: validatedData.current_service || undefined,
      budget_range: validatedData.budget_range || undefined,
      special_requests: validatedData.special_requests || undefined,
      preferred_contact: validatedData.preferred_contact || 'email'
    };

    const customerId = await customerInterests.create(cleanedData);

    return NextResponse.json({
      success: true,
      message: 'Customer interest submitted successfully!',
      customerId
    });

  } catch (error) {
    console.error('Customer interest submission error:', error);
    
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
      message: 'Internal server error'
    }, { status: 500 });
  }
}
