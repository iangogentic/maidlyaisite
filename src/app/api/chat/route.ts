import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema } from "@/lib/validators";
import { trackEvent } from "@/lib/analytics";

// Simple demo responses - in production this would use OpenAI API
const generateDemoResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Pattern matching for common requests
  if (lowerMessage.includes("allergic") || lowerMessage.includes("allergy")) {
    return "I understand you have allergies. I'll make sure to note that in your preferences. What specific products or ingredients should we avoid?";
  }
  
  if (lowerMessage.includes("pet") || lowerMessage.includes("dog") || lowerMessage.includes("cat")) {
    return "Got it! I'll add a note about your pet. This helps our crew know what to expect and how to interact safely with your furry friend.";
  }
  
  if (lowerMessage.includes("key") || lowerMessage.includes("lock") || lowerMessage.includes("door")) {
    return "I'll note your access preferences. Clear instructions about keys and entry help our crew provide seamless service.";
  }
  
  if (lowerMessage.includes("fragrance") || lowerMessage.includes("scent") || lowerMessage.includes("smell")) {
    return "Noted! I'll make sure we use unscented or lightly scented products based on your preference.";
  }
  
  if (lowerMessage.includes("delicate") || lowerMessage.includes("careful") || lowerMessage.includes("gentle")) {
    return "I understand you have items that need special care. I'll add this to your cleaning profile so our crew knows to be extra gentle.";
  }
  
  if (lowerMessage.includes("eco") || lowerMessage.includes("green") || lowerMessage.includes("natural")) {
    return "Perfect! I'll note your preference for eco-friendly products. We have a full range of green cleaning supplies that are effective and safe.";
  }
  
  if (lowerMessage.includes("time") || lowerMessage.includes("schedule") || lowerMessage.includes("when")) {
    return "I can help with scheduling preferences! Let me know what times work best for you, and I'll make sure our crew knows your preferred schedule.";
  }
  
  // Generic responses
  const responses = [
    "Thanks for that information! I've updated your preferences. Is there anything else you'd like me to remember for your next cleaning?",
    "Perfect! I'll make sure our crew knows about this preference. Your personalized cleaning profile is getting more detailed with each visit.",
    "Got it! This preference will be included in the brief I create for your cleaning crew. What else can I help you with?",
    "Excellent! I've noted that preference. The more I know about your home and preferences, the better service we can provide.",
    "Thank you for sharing that! I'll include this in your cleaning profile. Our crew will see this information before they arrive.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    const validatedData = chatMessageSchema.parse(body);
    
    // Generate demo response
    const response = generateDemoResponse(validatedData.message);
    
    // Track analytics event
    trackEvent("chat_message_sent", {
      message_length: validatedData.message.length,
      has_customer_id: !!validatedData.customerId,
    });
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    console.log("Chat message processed:", {
      input: validatedData.message,
      response: response,
      customerId: validatedData.customerId,
    });
    
    return NextResponse.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Chat processing error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid message format",
          errors: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to process message" 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Chat API is running",
    timestamp: new Date().toISOString(),
  });
}
