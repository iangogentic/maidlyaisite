import { NextRequest, NextResponse } from 'next/server';
import { adminSessions } from '@/lib/database-neon';
import { z } from 'zod';
import crypto from 'crypto';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required')
});

const ADMIN_PASSWORD = 'maidly2025';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = loginSchema.parse(body);
    
    // Check password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: 'Invalid password'
      }, { status: 401 });
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Save session to database
    await adminSessions.create(sessionToken, expiresAt);
    
    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    });
    
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Admin login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    
    if (sessionToken) {
      await adminSessions.deleteByToken(sessionToken);
    }
    
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    response.cookies.delete('admin_session');
    
    return response;
    
  } catch (error) {
    console.error('Admin logout error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 });
  }
}
