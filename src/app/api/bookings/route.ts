import { NextRequest, NextResponse } from 'next/server';
import { bookings, customerProfiles } from '@/lib/database-neon';
import { z } from 'zod';

const bookingSchema = z.object({
  customer_name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().max(20, 'Phone number too long').optional(),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  city: z.string().min(1, 'City is required').max(50, 'City name too long'),
  state: z.string().min(1, 'State is required').max(50, 'State name too long'),
  zip_code: z.string().min(1, 'ZIP code is required').max(10, 'ZIP code too long'),
  home_size: z.number().min(500, 'Home size too small').max(10000, 'Home size too large'),
  bedrooms: z.number().min(0, 'Invalid bedroom count').max(10, 'Too many bedrooms'),
  bathrooms: z.number().min(1, 'At least 1 bathroom required').max(10, 'Too many bathrooms'),
  service_type: z.enum(['regular', 'deep', 'one_time', 'move_in', 'move_out']),
  cleaning_type: z.enum(['eco_friendly', 'regular', 'bring_own_supplies']),
  frequency: z.enum(['weekly', 'bi_weekly', 'monthly']).optional(),
  scheduled_date: z.string().min(1, 'Date is required'),
  scheduled_time: z.string().min(1, 'Time is required'),
  duration_minutes: z.number().min(60, 'Minimum 1 hour').max(480, 'Maximum 8 hours'),
  price_cents: z.number().min(5000, 'Minimum $50').max(100000, 'Maximum $1000'),
  add_ons: z.array(z.string()).default([]),
  special_instructions: z.string().max(500, 'Instructions too long').optional(),
  ai_preferences: z.record(z.string(), z.any()).default({})
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);
    
    // Generate initial AI preferences from booking data
    const initialPreferences = await generateInitialPreferences(validatedData);
    
    // Create booking with AI preferences
    const bookingData = {
      ...validatedData,
      ai_preferences: initialPreferences,
      status: 'scheduled' as const
    };
    
    const bookingId = await bookings.create(bookingData);
    
    // Create or update customer profile
    await createOrUpdateCustomerProfile(validatedData, bookingId);
    
    // Send booking confirmation (we'll implement this next)
    await sendBookingConfirmation(bookingId, validatedData);
    
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully!',
      bookingId,
      aiPreferences: initialPreferences
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      // Get bookings for specific customer
      const customerBookings = await bookings.getByEmail(email);
      return NextResponse.json({
        success: true,
        bookings: customerBookings
      });
    } else {
      // Get all bookings (admin view)
      const allBookings = await bookings.getAll();
      return NextResponse.json({
        success: true,
        bookings: allBookings
      });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching bookings'
    }, { status: 500 });
  }
}

// Helper functions
async function generateInitialPreferences(bookingData: any) {
  const preferences = {
    service_type: bookingData.service_type,
    cleaning_type: bookingData.cleaning_type,
    frequency: bookingData.frequency,
    home_details: {
      size: bookingData.home_size,
      bedrooms: bookingData.bedrooms,
      bathrooms: bookingData.bathrooms
    },
    add_ons: bookingData.add_ons,
    special_instructions: bookingData.special_instructions,
    contact_preferences: {
      phone: bookingData.customer_phone,
      email: bookingData.customer_email
    },
    address: {
      street: bookingData.address,
      city: bookingData.city,
      state: bookingData.state,
      zip: bookingData.zip_code
    },
    ai_insights: {
      initial_booking: true,
      confidence_level: 0.3, // Low confidence for initial booking
      learned_from: 'initial_booking'
    }
  };
  
  return preferences;
}

async function createOrUpdateCustomerProfile(bookingData: any, bookingId: number) {
  try {
    const existingProfile = await customerProfiles.getByEmail(bookingData.customer_email);
    
    const profileData = {
      email: bookingData.customer_email,
      name: bookingData.customer_name,
      phone: bookingData.customer_phone,
      addresses: existingProfile ? 
        [...existingProfile.addresses, {
          street: bookingData.address,
          city: bookingData.city,
          state: bookingData.state,
          zip: bookingData.zip_code,
          is_primary: existingProfile.addresses.length === 0
        }] : 
        [{
          street: bookingData.address,
          city: bookingData.city,
          state: bookingData.state,
          zip: bookingData.zip_code,
          is_primary: true
        }],
      preferences: existingProfile ? 
        { ...existingProfile.preferences, ...await generateInitialPreferences(bookingData) } :
        await generateInitialPreferences(bookingData),
      total_bookings: existingProfile ? existingProfile.total_bookings + 1 : 1,
      satisfaction_score: existingProfile ? existingProfile.satisfaction_score : 5.0,
      lifetime_value_cents: existingProfile ? 
        existingProfile.lifetime_value_cents + bookingData.price_cents : 
        bookingData.price_cents,
      last_service_date: bookingData.scheduled_date
    };
    
    await customerProfiles.createOrUpdate(profileData);
  } catch (error) {
    console.error('Error creating/updating customer profile:', error);
    // Don't throw - booking should still succeed even if profile update fails
  }
}

async function sendBookingConfirmation(bookingId: number, bookingData: any) {
  try {
    const { sendBookingConfirmation: sendConfirmation } = await import('@/lib/notifications');
    
    const notificationData = {
      id: bookingId,
      customer_name: bookingData.customer_name,
      customer_email: bookingData.customer_email,
      customer_phone: bookingData.customer_phone,
      address: bookingData.address,
      city: bookingData.city,
      state: bookingData.state,
      zip_code: bookingData.zip_code,
      service_type: bookingData.service_type,
      cleaning_type: bookingData.cleaning_type,
      scheduled_date: bookingData.scheduled_date,
      scheduled_time: bookingData.scheduled_time,
      total_price: bookingData.price_cents / 100, // Convert cents to dollars
    };
    
    await sendConfirmation(notificationData);
    console.log(`Booking confirmation sent for booking ${bookingId}`);
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    // Don't throw - booking should still succeed even if confirmation fails
  }
}
