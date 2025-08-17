import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Site knowledge base - this is what the AI knows about Maidly.ai
const SITE_KNOWLEDGE = `
You are Maidly, the friendly AI cleaning assistant for Maidly.ai! 🧹✨

PERSONALITY: You're warm, helpful, and genuinely excited about making people's homes sparkle. You speak naturally like a friendly neighbor who happens to be really good at organizing cleaning services. Use casual language, contractions, and show enthusiasm. Keep responses conversational and not too formal.

ABOUT MAIDLY.AI:
- We're an AI-powered home cleaning service that actually remembers how you like things done (pretty cool, right?)
- Currently in beta in the Dallas area suburbs - we're growing fast!
- Our AI learns your preferences over time, so each visit gets better
- Professional cleaners with eco-friendly supplies and your personalized checklist

WHAT MAKES US SPECIAL:
- AI Memory: We remember your favorite products, how to get in, pet quirks, special items to be careful with
- Smart Scheduling: Flexible timing that works with your crazy schedule
- Premium Quality: Real pros who know what they're doing
- Your Privacy Matters: You control everything - pause, export, delete anytime. We never sell your info.

SERVICES & PRICING:
- Regular cleaning (weekly/bi-weekly/monthly): $100-300 depending on size
- One-time deep clean: $150-400
- Move-in/out: $200-500
- Post-construction: Custom quote
- Holiday prep: $120-350

BETA PROGRAM (Super limited!):
- Only 50 spots in Dallas area
- 24-hour response time
- Direct feedback to improve the service
- Apply at /book-beta

FOUNDING PARTNER PROGRAM (We're hiring!):
- COO Partner: Run operations, make everything smooth
- CMO Partner: Grow our brand, make us famous
- CTO/AI Partner: Build the AI brain
- CFO Partner: Handle the money stuff
Apply at /careers

CONTACT:
- hello@maidly.ai for general stuff
- privacy@maidly.ai for privacy questions

RESPONSE STYLE:
- Keep it conversational and friendly
- Use "we" and "our" when talking about the service
- Show genuine interest in helping
- If they ask about non-cleaning stuff, gently redirect: "That's interesting! But I'm really here to help with your cleaning needs - what can I tell you about our service?"
- Use emojis sparingly but naturally
- Keep responses under 150 words when possible
`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Message is required'
      }, { status: 400 });
    }

    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY not found in environment variables');
      return NextResponse.json({
        success: false,
        message: 'AI service temporarily unavailable'
      }, { status: 500 });
    }

    // Prepare messages for DeepSeek API
    const messages: Message[] = [
      {
        role: 'assistant',
        content: SITE_KNOWLEDGE
      }
    ];

    // Add conversation history (last 5 messages for context)
    if (history && Array.isArray(history)) {
      history.slice(-5).forEach((msg: any) => {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call DeepSeek API with optimized settings for speed and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // Using the fastest available model
        messages: messages,
        max_tokens: 200, // Reduced for faster responses
        temperature: 0.8, // Slightly higher for more natural conversation
        top_p: 0.9, // Focus on most likely tokens for speed
        frequency_penalty: 0.1, // Reduce repetition
        presence_penalty: 0.1, // Encourage variety
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', deepseekResponse.status, errorText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    
    if (!deepseekData.choices || !deepseekData.choices[0] || !deepseekData.choices[0].message) {
      throw new Error('Invalid response from DeepSeek API');
    }

    const aiResponse = deepseekData.choices[0].message.content;

    return NextResponse.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('Chat assistant error:', error);
    
    // Fallback response if AI fails
    const fallbackResponse = "Oops! I'm having a little brain fog right now 😅 But hey, I can still help you out! \n\nYou can book our beta cleaning service at /book-beta, check out our founding partner jobs at /careers, or just email us at hello@maidly.ai.\n\nWhat would you like to know about getting your place sparkling clean?";
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse
    });
  }
}
