import { NextRequest, NextResponse } from 'next/server';
import { bookings, customerProfiles } from '@/lib/database-neon';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let jobs;
    if (date) {
      // Get jobs for specific date
      jobs = await getJobsForDate(date);
    } else {
      // Get today's jobs by default
      jobs = await bookings.getTodaysJobs();
    }
    
    // Enrich jobs with AI briefings
    const enrichedJobs = await Promise.all(
      jobs.map(async (job) => {
        const briefing = await generateCrewBriefing(job);
        return {
          ...job,
          ai_briefing: briefing
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      jobs: enrichedJobs
    });
    
  } catch (error) {
    console.error('Error fetching crew jobs:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching jobs'
    }, { status: 500 });
  }
}

async function getJobsForDate(dateString: string) {
  try {
    // This would be a custom query for a specific date
    // For now, we'll use the existing getTodaysJobs and filter
    const allJobs = await bookings.getAll();
    return allJobs.filter(job => job.scheduled_date === dateString);
  } catch (error) {
    console.error('Error fetching jobs for date:', error);
    return [];
  }
}

async function generateCrewBriefing(booking: any): Promise<string> {
  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return generateFallbackBriefing(booking);
    }
    
    // Get customer profile for additional context
    const customerProfile = await customerProfiles.getByEmail(booking.customer_email);
    
    const prompt = `
      Generate a concise crew briefing for this cleaning job:
      
      Customer: ${booking.customer_name}
      Address: ${booking.address}, ${booking.city}, ${booking.state} ${booking.zip_code}
      Phone: ${booking.customer_phone || 'Not provided'}
      
      Service Details:
      - Type: ${booking.service_type}
      - Cleaning Type: ${booking.cleaning_type}
      - Home: ${booking.home_size} sq ft, ${booking.bedrooms} bed, ${booking.bathrooms} bath
      - Duration: ${booking.duration_minutes} minutes
      - Add-ons: ${booking.add_ons.join(', ') || 'None'}
      
      Special Instructions: ${booking.special_instructions || 'None'}
      
      ${customerProfile ? `
      Customer Preferences (from previous visits):
      ${JSON.stringify(customerProfile.preferences, null, 2)}
      Total Previous Bookings: ${customerProfile.total_bookings}
      Satisfaction Score: ${customerProfile.satisfaction_score}/5
      ` : 'First-time customer - no previous preferences available.'}
      
      Create a friendly, professional briefing that covers:
      1. How to contact the customer and access the home
      2. What cleaning products/approach to use
      3. Areas that need special attention
      4. Things to be careful with or avoid
      5. Any pet or family considerations
      6. Expected timeline and key tasks
      
      Keep it concise but thorough - this will be read on a mobile device.
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
        max_tokens: 400,
        temperature: 0.4
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || generateFallbackBriefing(booking);
    
  } catch (error) {
    console.error('Error generating AI briefing:', error);
    return generateFallbackBriefing(booking);
  }
}

function generateFallbackBriefing(booking: any): string {
  return `
🏠 **${booking.customer_name}**
📍 ${booking.address}, ${booking.city}, ${booking.state}
📞 ${booking.customer_phone || 'No phone provided'}

**Service Details:**
• ${booking.service_type.replace('_', ' ')} cleaning (${booking.cleaning_type.replace('_', ' ')})
• ${booking.home_size} sq ft, ${booking.bedrooms} bed, ${booking.bathrooms} bath
• Duration: ${booking.duration_minutes} minutes
• Add-ons: ${booking.add_ons.join(', ') || 'None'}

**Special Instructions:**
${booking.special_instructions || 'No special instructions provided.'}

**Key Tasks:**
• Standard cleaning checklist for ${booking.service_type} service
• Use ${booking.cleaning_type.replace('_', ' ')} products
• Focus on high-traffic areas
• Take before/after photos
• Complete service notes in app

**Contact:** Call customer 15 minutes before arrival.
  `.trim();
}
