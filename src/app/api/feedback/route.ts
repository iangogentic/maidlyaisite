import { NextRequest, NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validators";
import { trackEvent } from "@/lib/analytics";

// Simple in-memory store for demo purposes
// In production, this would be a database
const feedbackStore: Array<{
  id: string;
  customer: string;
  email: string;
  rating: number;
  comment: string;
  timestamp: Date;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    const validatedData = feedbackSchema.parse(body);
    
    // Create feedback entry
    const feedback = {
      id: Date.now().toString(),
      ...validatedData,
      timestamp: new Date(),
    };
    
    // Store feedback (in production, save to database)
    feedbackStore.push(feedback);
    
    // Track analytics event
    trackEvent("feedback_submitted", {
      rating: validatedData.rating,
      customer_email: validatedData.email,
    });
    
    console.log("Feedback received:", feedback);
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Feedback submitted successfully",
        id: feedback.id 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Feedback submission error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input data",
          errors: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return recent feedback (for demo purposes)
    const recentFeedback = feedbackStore
      .slice(-10)
      .map(({ email, ...feedback }) => ({
        ...feedback,
        email: email.replace(/(.{2}).*(@.*)/, "$1***$2"), // Mask email
      }));
    
    return NextResponse.json({
      success: true,
      data: recentFeedback,
      total: feedbackStore.length,
    });
    
  } catch (error) {
    console.error("Feedback retrieval error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to retrieve feedback" 
      },
      { status: 500 }
    );
  }
}
