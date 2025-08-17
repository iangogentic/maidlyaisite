interface CustomerPreferences {
  products: string[];
  focus_areas: string[];
  avoid_areas: string[];
  special_instructions: string[];
  timing_preferences: string;
  access_instructions: string;
  pet_considerations: string[];
  satisfaction_indicators: string[];
}

interface AIInsight {
  preferences: CustomerPreferences;
  confidence_score: number;
  learned_from: string;
  timestamp: string;
}

export async function extractPreferencesFromNotes(
  serviceNotes: string,
  customerFeedback: string,
  bookingContext?: any
): Promise<AIInsight> {
  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.warn('DEEPSEEK_API_KEY not found, returning basic preferences');
      return generateBasicPreferences(serviceNotes, customerFeedback, bookingContext);
    }
    
    const prompt = `
      Analyze these cleaning service notes and extract customer preferences:
      
      Service Notes: ${serviceNotes}
      Customer Feedback: ${customerFeedback}
      
      ${bookingContext ? `
      Context:
      - Service Type: ${bookingContext.service_type}
      - Cleaning Type: ${bookingContext.cleaning_type}
      - Home Size: ${bookingContext.home_size} sq ft
      - Special Instructions: ${bookingContext.special_instructions || 'None'}
      ` : ''}
      
      Extract preferences in this exact JSON format:
      {
        "products": ["specific cleaning products mentioned or preferred"],
        "focus_areas": ["areas that need extra attention"],
        "avoid_areas": ["areas to be careful with or avoid"],
        "special_instructions": ["specific requests or preferences"],
        "timing_preferences": "preferred scheduling or timing notes",
        "access_instructions": "how to enter the home or access preferences",
        "pet_considerations": ["pet-related preferences or notes"],
        "satisfaction_indicators": ["what the customer specifically liked or disliked"]
      }
      
      Only include items that are explicitly mentioned or can be reasonably inferred from the notes.
      If nothing is mentioned for a category, use an empty array or empty string.
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
        max_tokens: 300,
        temperature: 0.2 // Low temperature for consistent extraction
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (aiResponse) {
      try {
        const extractedPreferences = JSON.parse(aiResponse);
        return {
          preferences: extractedPreferences,
          confidence_score: calculateConfidenceScore(serviceNotes, customerFeedback),
          learned_from: 'service_completion',
          timestamp: new Date().toISOString()
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return generateBasicPreferences(serviceNotes, customerFeedback, bookingContext);
      }
    }
    
    return generateBasicPreferences(serviceNotes, customerFeedback, bookingContext);
    
  } catch (error) {
    console.error('Error extracting preferences with AI:', error);
    return generateBasicPreferences(serviceNotes, customerFeedback, bookingContext);
  }
}

export async function generateCrewBriefing(
  customerId: number,
  customerEmail: string,
  bookingDetails: any
): Promise<string> {
  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return generateBasicBriefing(bookingDetails);
    }
    
    // Get customer preferences from database
    const { customerProfiles } = await import('@/lib/database-neon');
    const customerProfile = await customerProfiles.getByEmail(customerEmail);
    
    const prompt = `
      Generate a crew briefing for this cleaning service:
      
      Customer: ${bookingDetails.customer_name}
      Address: ${bookingDetails.address}
      Service: ${bookingDetails.service_type} (${bookingDetails.cleaning_type})
      Home: ${bookingDetails.home_size} sq ft, ${bookingDetails.bedrooms} bed, ${bookingDetails.bathrooms} bath
      Duration: ${bookingDetails.duration_minutes} minutes
      
      ${customerProfile ? `
      Customer Preferences (learned from ${customerProfile.total_bookings} previous visits):
      ${JSON.stringify(customerProfile.preferences, null, 2)}
      Satisfaction Score: ${customerProfile.satisfaction_score}/5
      ` : 'First-time customer'}
      
      Special Instructions: ${bookingDetails.special_instructions || 'None'}
      
      Create a concise, actionable briefing that includes:
      1. Contact and access information
      2. Preferred cleaning products and approach
      3. Areas requiring special attention
      4. Things to avoid or be careful with
      5. Pet or family considerations
      6. Timeline and key priorities
      
      Format as a mobile-friendly briefing that's easy to scan quickly.
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
    return data.choices[0]?.message?.content || generateBasicBriefing(bookingDetails);
    
  } catch (error) {
    console.error('Error generating crew briefing:', error);
    return generateBasicBriefing(bookingDetails);
  }
}

export async function predictCustomerSatisfaction(
  bookingDetails: any,
  customerHistory?: any
): Promise<{
  predicted_rating: number;
  confidence: number;
  risk_factors: string[];
  recommendations: string[];
}> {
  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      return generateBasicPrediction(bookingDetails, customerHistory);
    }
    
    const prompt = `
      Predict customer satisfaction for this cleaning service:
      
      Current Booking:
      - Service Type: ${bookingDetails.service_type}
      - Cleaning Type: ${bookingDetails.cleaning_type}
      - Home Size: ${bookingDetails.home_size} sq ft
      - Duration: ${bookingDetails.duration_minutes} minutes
      - Special Instructions: ${bookingDetails.special_instructions || 'None'}
      
      ${customerHistory ? `
      Customer History:
      - Previous Bookings: ${customerHistory.total_bookings}
      - Average Satisfaction: ${customerHistory.satisfaction_score}/5
      - Preferences: ${JSON.stringify(customerHistory.preferences)}
      ` : 'First-time customer'}
      
      Provide prediction in this JSON format:
      {
        "predicted_rating": 4.2,
        "confidence": 0.75,
        "risk_factors": ["specific potential issues"],
        "recommendations": ["specific actions to improve satisfaction"]
      }
      
      Base predictions on service complexity, customer history, and potential issues.
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
        max_tokens: 200,
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
        return JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Error parsing satisfaction prediction:', parseError);
      }
    }
    
    return generateBasicPrediction(bookingDetails, customerHistory);
    
  } catch (error) {
    console.error('Error predicting satisfaction:', error);
    return generateBasicPrediction(bookingDetails, customerHistory);
  }
}

// Fallback functions when AI is not available
function generateBasicPreferences(
  serviceNotes: string,
  customerFeedback: string,
  bookingContext?: any
): AIInsight {
  const preferences: CustomerPreferences = {
    products: bookingContext?.cleaning_type === 'eco_friendly' ? ['eco-friendly products'] : [],
    focus_areas: [],
    avoid_areas: [],
    special_instructions: bookingContext?.special_instructions ? [bookingContext.special_instructions] : [],
    timing_preferences: '',
    access_instructions: '',
    pet_considerations: [],
    satisfaction_indicators: []
  };
  
  // Basic keyword extraction
  if (serviceNotes.toLowerCase().includes('pet') || customerFeedback.toLowerCase().includes('pet')) {
    preferences.pet_considerations.push('Has pets - be mindful');
  }
  
  if (serviceNotes.toLowerCase().includes('kitchen') || customerFeedback.toLowerCase().includes('kitchen')) {
    preferences.focus_areas.push('Kitchen');
  }
  
  if (serviceNotes.toLowerCase().includes('bathroom') || customerFeedback.toLowerCase().includes('bathroom')) {
    preferences.focus_areas.push('Bathrooms');
  }
  
  return {
    preferences,
    confidence_score: 0.3, // Low confidence for basic extraction
    learned_from: 'basic_extraction',
    timestamp: new Date().toISOString()
  };
}

function generateBasicBriefing(bookingDetails: any): string {
  return `
🏠 **${bookingDetails.customer_name}**
📍 ${bookingDetails.address}
📞 ${bookingDetails.customer_phone || 'No phone provided'}

**Service:** ${bookingDetails.service_type.replace('_', ' ')} cleaning
**Type:** ${bookingDetails.cleaning_type.replace('_', ' ')} products
**Home:** ${bookingDetails.home_size} sq ft, ${bookingDetails.bedrooms} bed, ${bookingDetails.bathrooms} bath
**Duration:** ${bookingDetails.duration_minutes} minutes

**Special Instructions:**
${bookingDetails.special_instructions || 'No special instructions'}

**Standard Tasks:**
• Complete cleaning checklist
• Take before/after photos
• Record any observations
• Get customer feedback

**Contact customer 15 minutes before arrival**
  `.trim();
}

function generateBasicPrediction(bookingDetails: any, customerHistory?: any) {
  let predicted_rating = 4.0; // Default prediction
  let confidence = 0.5;
  const risk_factors: string[] = [];
  const recommendations: string[] = [];
  
  // Adjust based on service complexity
  if (bookingDetails.service_type === 'deep') {
    predicted_rating += 0.2;
    recommendations.push('Deep cleaning typically receives high satisfaction');
  }
  
  if (bookingDetails.service_type === 'move_out') {
    risk_factors.push('Move-out cleanings can be challenging');
    predicted_rating -= 0.1;
  }
  
  // Adjust based on customer history
  if (customerHistory) {
    predicted_rating = (predicted_rating + customerHistory.satisfaction_score) / 2;
    confidence += 0.2;
    
    if (customerHistory.total_bookings > 3) {
      confidence += 0.1;
      recommendations.push('Returning customer - follow established preferences');
    }
  }
  
  return {
    predicted_rating: Math.round(predicted_rating * 10) / 10,
    confidence: Math.min(confidence, 1.0),
    risk_factors,
    recommendations
  };
}

function calculateConfidenceScore(serviceNotes: string, customerFeedback: string): number {
  let confidence = 0.2; // Base confidence
  
  if (serviceNotes && serviceNotes.length > 50) confidence += 0.3;
  if (customerFeedback && customerFeedback.length > 20) confidence += 0.3;
  if (serviceNotes.length > 100 || customerFeedback.length > 50) confidence += 0.2;
  
  return Math.min(confidence, 1.0);
}
