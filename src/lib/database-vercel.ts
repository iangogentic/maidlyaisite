import { sql } from '@vercel/postgres';

export interface CareerApplication {
  id?: number;
  name: string;
  email: string;
  role_interest: string;
  portfolio_link?: string;
  phone?: string;
  linkedin?: string;
  experience_level?: string;
  why_interested?: string;
  availability?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminSession {
  id?: number;
  session_token: string;
  expires_at: string;
  created_at?: string;
}

// Initialize tables
export async function initializeTables() {
  try {
    // Create career_applications table
    await sql`
      CREATE TABLE IF NOT EXISTS career_applications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role_interest TEXT NOT NULL,
        portfolio_link TEXT,
        phone TEXT,
        linkedin TEXT,
        experience_level TEXT,
        why_interested TEXT,
        availability TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create admin_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        session_token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);`;

  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Career Applications
export const careerApplications = {
  create: async (application: Omit<CareerApplication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await initializeTables();
      
      const result = await sql`
        INSERT INTO career_applications (
          name, email, role_interest, portfolio_link, phone, linkedin, 
          experience_level, why_interested, availability
        ) VALUES (
          ${application.name},
          ${application.email},
          ${application.role_interest},
          ${application.portfolio_link || null},
          ${application.phone || null},
          ${application.linkedin || null},
          ${application.experience_level || null},
          ${application.why_interested || null},
          ${application.availability || null}
        ) RETURNING id;
      `;
      
      return result.rows[0]?.id;
    } catch (error) {
      console.error('Error creating career application:', error);
      throw error;
    }
  },

  getAll: async (): Promise<CareerApplication[]> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM career_applications 
        ORDER BY created_at DESC;
      `;
      
      return result.rows as CareerApplication[];
    } catch (error) {
      console.error('Error fetching career applications:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<CareerApplication | null> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM career_applications WHERE id = ${id};
      `;
      
      return result.rows[0] as CareerApplication || null;
    } catch (error) {
      console.error('Error fetching career application by ID:', error);
      return null;
    }
  },

  getByEmail: async (email: string): Promise<CareerApplication[]> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM career_applications 
        WHERE email = ${email} 
        ORDER BY created_at DESC;
      `;
      
      return result.rows as CareerApplication[];
    } catch (error) {
      console.error('Error fetching career applications by email:', error);
      return [];
    }
  },

  count: async (): Promise<number> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT COUNT(*) as count FROM career_applications;
      `;
      
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error counting career applications:', error);
      return 0;
    }
  }
};

// Admin Sessions
export const adminSessions = {
  create: async (sessionToken: string, expiresAt: Date) => {
    try {
      await initializeTables();
      
      const result = await sql`
        INSERT INTO admin_sessions (session_token, expires_at) 
        VALUES (${sessionToken}, ${expiresAt.toISOString()})
        RETURNING id;
      `;
      
      return result.rows[0]?.id;
    } catch (error) {
      console.error('Error creating admin session:', error);
      throw error;
    }
  },

  getByToken: async (token: string): Promise<AdminSession | null> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM admin_sessions 
        WHERE session_token = ${token} AND expires_at > NOW();
      `;
      
      return result.rows[0] as AdminSession || null;
    } catch (error) {
      console.error('Error fetching admin session:', error);
      return null;
    }
  },

  deleteExpired: async () => {
    try {
      await initializeTables();
      
      const result = await sql`
        DELETE FROM admin_sessions 
        WHERE expires_at <= NOW();
      `;
      
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error deleting expired sessions:', error);
      return 0;
    }
  },

  deleteByToken: async (token: string) => {
    try {
      await initializeTables();
      
      const result = await sql`
        DELETE FROM admin_sessions 
        WHERE session_token = ${token};
      `;
      
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error deleting session by token:', error);
      return 0;
    }
  }
};
