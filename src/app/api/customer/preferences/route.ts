'use server';

import { NextRequest, NextResponse } from 'next/server';
import { customerPreferences } from '@/lib/database-neon';
import { z } from 'zod';

// Validation schema for customer preferences
const customerPreferencesSchema = z.object({
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().optional(),
  customer_name: z.string().optional(),
  // Notification channels
  sms_enabled: z.boolean().default(true),
  email_enabled: z.boolean().default(true),
  push_enabled: z.boolean().default(true),
  // Notification types
  booking_confirmations: z.boolean().default(true),
  service_reminders: z.boolean().default(true),
  crew_arrival_notifications: z.boolean().default(true),
  service_completion: z.boolean().default(true),
  payment_receipts: z.boolean().default(true),
  promotional_messages: z.boolean().default(false),
  // Timing preferences
  reminder_timing: z.enum(['none', '15min', '30min', '1hour', '2hours', '1day']).default('1hour'),
  quiet_hours_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quiet_hours_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string().default('America/New_York')
});

// GET - Fetch customer preferences by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const preferences = await customerPreferences.getByEmail(email);
    
    if (!preferences) {
      // Return default preferences if none exist
      const defaults = customerPreferences.getDefaults();
      return NextResponse.json({
        success: true,
        preferences: {
          ...defaults,
          customer_email: email
        },
        isDefault: true
      });
    }

    return NextResponse.json({
      success: true,
      preferences,
      isDefault: false
    });

  } catch (error) {
    console.error('Error fetching customer preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// POST - Create or update customer preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validation = customerPreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid preferences data',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const validatedPreferences = validation.data;

    // Validate quiet hours logic
    if (validatedPreferences.quiet_hours_start && validatedPreferences.quiet_hours_end) {
      const startTime = validatedPreferences.quiet_hours_start;
      const endTime = validatedPreferences.quiet_hours_end;
      
      // Basic validation - could be enhanced for cross-midnight scenarios
      if (startTime === endTime) {
        return NextResponse.json(
          { success: false, error: 'Quiet hours start and end times cannot be the same' },
          { status: 400 }
        );
      }
    }

    // Create or update preferences
    const savedPreferences = await customerPreferences.upsert(validatedPreferences);
    
    if (!savedPreferences) {
      return NextResponse.json(
        { success: false, error: 'Failed to save preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: savedPreferences,
      message: 'Preferences saved successfully'
    });

  } catch (error) {
    console.error('Error saving customer preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

// PATCH - Update specific preference fields
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_email, ...updates } = body;

    if (!customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Get existing preferences
    const existingPreferences = await customerPreferences.getByEmail(customer_email);
    
    if (!existingPreferences) {
      return NextResponse.json(
        { success: false, error: 'Customer preferences not found' },
        { status: 404 }
      );
    }

    // Merge updates with existing preferences
    const updatedPreferences = {
      ...existingPreferences,
      ...updates,
      customer_email // Ensure email doesn't change
    };

    // Validate the merged data
    const validation = customerPreferencesSchema.safeParse(updatedPreferences);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid preferences update',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    // Save updated preferences
    const savedPreferences = await customerPreferences.upsert(validation.data);
    
    if (!savedPreferences) {
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: savedPreferences,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating customer preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

// DELETE - Reset preferences to defaults (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Get defaults and save them (effectively resetting)
    const defaults = customerPreferences.getDefaults();
    const resetPreferences = {
      ...defaults,
      customer_email: email
    };

    const savedPreferences = await customerPreferences.upsert(resetPreferences);
    
    if (!savedPreferences) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: savedPreferences,
      message: 'Preferences reset to defaults'
    });

  } catch (error) {
    console.error('Error resetting customer preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset preferences' },
      { status: 500 }
    );
  }
}
