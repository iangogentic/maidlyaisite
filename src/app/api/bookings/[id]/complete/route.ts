import { NextRequest, NextResponse } from 'next/server';
import { bookings, serviceNotes, customerProfiles } from '@/lib/database-neon';
import { z } from 'zod';

const completeBookingSchema = z.object({
  crew_notes: z.string().max(1000, 'Notes too long').optional(),
  customer_feedback: z.string().max(500, 'Feedback too long').optional(),
  photos: z.array(z.string()).default([]),
  issues_encountered: z.string().max(500, 'Issues description too long').optional(),
  satisfaction_rating: z.number().min(1).max(5).optional(),
  duration_actual_minutes: z.number().min(30).max(600).optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    const body = await request.json();
    const validatedData = completeBookingSchema.parse(body);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid booking ID'
      }, { status: 400 });
    }
    
    // Get the booking
    const booking = await bookings.getById(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 });
    }
    
    // Update booking status to completed
    await bookings.updateStatus(bookingId, 'completed');
    
    // Create service notes
    if (validatedData.crew_notes) {
      await serviceNotes.create({
        booking_id: bookingId,
        note_type: 'crew_observation',
        content: validatedData.crew_notes,
        confidence_score: 1.0,
        created_by: 'crew'
      });
    }
    
    if (validatedData.customer_feedback) {
      await serviceNotes.create({
        booking_id: bookingId,
        note_type: 'customer_feedback',
        content: validatedData.customer_feedback,
        confidence_score: 1.0,
        created_by: 'customer'
      });
    }
    
    if (validatedData.issues_encountered) {
      await serviceNotes.create({
        booking_id: bookingId,
        note_type: 'quality_check',
        content: `Issues encountered: ${validatedData.issues_encountered}`,
        confidence_score: 1.0,
        created_by: 'crew'
      });
    }
    
    // Process notes with AI to extract preferences
    const aiInsights = await processServiceNotesWithAI(
      booking,
      validatedData.crew_notes || '',
      validatedData.customer_feedback || '',
      validatedData.satisfaction_rating
    );
    
    // Create AI insight note
    if (aiInsights.insights.length > 0) {
      await serviceNotes.create({
        booking_id: bookingId,
        note_type: 'ai_insight',
        content: JSON.stringify(aiInsights),
        confidence_score: aiInsights.confidence,
        created_by: 'ai_system'
      });
    }
    
    // Update customer profile with learned preferences
    await updateCustomerPreferences(booking.customer_email, aiInsights);
    
    // Send post-service follow-up
    await sendPostServiceFollowup(booking, validatedData.satisfaction_rating);
    
    return NextResponse.json({
      success: true,
      message: 'Service completed successfully',
      aiInsights: aiInsights.insights
    });
    
  } catch (error) {
    console.error('Error completing booking:', error);
    
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
      message: 'Error completing booking'
    }, { status: 500 });
  }
}

// AI processing function
async function processServiceNotesWithAI(
  booking: any,
  crewNotes: string,
  customerFeedback: string,
  satisfactionRating?: number
) {
  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.warn('DEEPSEEK_API_KEY not found, skipping AI processing');
      return { insights: [], confidence: 0 };
    }
    
    const prompt = `
      Analyze this cleaning service completion and extract customer preferences:
      
      Customer: ${booking.customer_name}
      Service Type: ${booking.service_type}
      Cleaning Type: ${booking.cleaning_type}
      Home Size: ${booking.home_size} sq ft, ${booking.bedrooms} bed, ${booking.bathrooms} bath
      
      Crew Notes: ${crewNotes}
      Customer Feedback: ${customerFeedback}
      Satisfaction Rating: ${satisfactionRating || 'Not provided'}/5
      
      Extract preferences and insights in this JSON format:
      {
        "preferences": {
          "products": ["specific products mentioned"],
          "focus_areas": ["areas that need extra attention"],
          "avoid_areas": ["areas to be careful with"],
          "timing_preferences": "preferred time/schedule notes",
          "access_instructions": "how to enter home",
          "pet_considerations": ["pet-related notes"],
          "special_items": ["delicate items or special care needed"]
        },
        "satisfaction_indicators": {
          "positive_feedback": ["what they loved"],
          "improvement_areas": ["what could be better"],
          "likely_to_rebook": true/false
        },
        "operational_insights": {
          "actual_duration": "time insights",
          "crew_efficiency": "crew performance notes",
          "service_quality": "quality observations"
        }
      }
      
      Only include items that are explicitly mentioned or can be reasonably inferred.
    `;
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (aiResponse) {
      try {
        const parsedInsights = JSON.parse(aiResponse);
        return {
          insights: parsedInsights,
          confidence: calculateConfidenceScore(crewNotes, customerFeedback, satisfactionRating)
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return { insights: [], confidence: 0 };
      }
    }
    
    return { insights: [], confidence: 0 };
    
  } catch (error) {
    console.error('Error processing with AI:', error);
    return { insights: [], confidence: 0 };
  }
}

function calculateConfidenceScore(crewNotes: string, customerFeedback: string, satisfactionRating?: number): number {
  let confidence = 0.3; // Base confidence
  
  if (crewNotes && crewNotes.length > 50) confidence += 0.2;
  if (customerFeedback && customerFeedback.length > 20) confidence += 0.3;
  if (satisfactionRating) confidence += 0.2;
  
  return Math.min(confidence, 1.0);
}

async function updateCustomerPreferences(email: string, aiInsights: any) {
  try {
    const existingProfile = await customerProfiles.getByEmail(email);
    if (!existingProfile || !aiInsights.insights.preferences) return;
    
    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...existingProfile.preferences,
      ...aiInsights.insights.preferences,
      ai_learning: {
        ...existingProfile.preferences.ai_learning,
        last_updated: new Date().toISOString(),
        confidence_score: aiInsights.confidence,
        total_services: (existingProfile.preferences.ai_learning?.total_services || 0) + 1
      }
    };
    
    await customerProfiles.createOrUpdate({
      ...existingProfile,
      preferences: updatedPreferences,
      satisfaction_score: aiInsights.insights.satisfaction_indicators?.likely_to_rebook ? 
        Math.min(existingProfile.satisfaction_score + 0.1, 5.0) : 
        Math.max(existingProfile.satisfaction_score - 0.1, 1.0)
    });
    
  } catch (error) {
    console.error('Error updating customer preferences:', error);
  }
}

async function sendPostServiceFollowup(booking: any, satisfactionRating?: number) {
  try {
    console.log(`Post-service follow-up would be sent for booking ${booking.id}`);
    // TODO: Implement email/SMS follow-up
  } catch (error) {
    console.error('Error sending post-service follow-up:', error);
  }
}
