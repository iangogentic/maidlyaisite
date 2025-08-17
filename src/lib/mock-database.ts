// Mock database for development when real database is not available
// This allows the admin system to work without requiring Neon setup

interface AdminSession {
  id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
}

// In-memory storage for development
let adminSessions: AdminSession[] = [];
let sessionIdCounter = 1;

export const mockDatabase = {
  // Create admin session
  async createAdminSession(sessionToken: string, expiresAt: Date) {
    const session: AdminSession = {
      id: sessionIdCounter.toString(),
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    };
    
    adminSessions.push(session);
    sessionIdCounter++;
    
    return { id: session.id };
  },

  // Verify admin session
  async verifyAdminSession(sessionToken: string) {
    const session = adminSessions.find(s => 
      s.session_token === sessionToken && 
      new Date(s.expires_at) > new Date()
    );
    
    return session ? { valid: true, session } : { valid: false, session: null };
  },

  // Delete admin session
  async deleteAdminSession(sessionToken: string) {
    const index = adminSessions.findIndex(s => s.session_token === sessionToken);
    if (index > -1) {
      adminSessions.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    const now = new Date();
    adminSessions = adminSessions.filter(s => new Date(s.expires_at) > now);
    return { cleaned: true };
  }
};

// Check if we should use mock database (when real database fails)
export const shouldUseMockDatabase = () => {
  const dbUrl = process.env.DATABASE_URL;
  return !dbUrl || 
         dbUrl.includes('ep-example') || 
         dbUrl.includes('npg_password') ||
         dbUrl === 'postgresql://neondb_owner:npg_password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require';
};
