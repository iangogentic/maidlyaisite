import { neon } from '@neondatabase/serverless';

// Use a default connection string that we'll replace with environment variable
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url) {
    // Fallback URL for development
    return 'postgresql://neondb_owner:npg_2AigG5BtfpkX@ep-little-brook-af8rp8sj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
  }
  
  // Clean up the URL - remove any psql command wrapper and extra parameters
  if (url.startsWith("psql '") && url.endsWith("'")) {
    url = url.slice(6, -1); // Remove "psql '" from start and "'" from end
  }
  
  // Remove problematic parameters that Neon doesn't like
  url = url.replace(/&channel_binding=require/, '');
  
  return url;
};

let sql: any;
try {
  sql = neon(getDatabaseUrl());
} catch (error) {
  console.error('Database connection error:', error);
  // Fallback to direct URL
  sql = neon('postgresql://neondb_owner:npg_2AigG5BtfpkX@ep-little-brook-af8rp8sj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');
}

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
  acceptance_token?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface AdminSession {
  id?: number;
  session_token: string;
  expires_at: string;
  created_at?: string;
}

export interface AcceptanceDocument {
  id?: number;
  application_id: number;
  document_type: string;
  document_data: any;
  signed_at?: string;
  created_at?: string;
}

export interface CustomerInterest {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  home_size?: string;
  cleaning_frequency?: string;
  current_service?: string;
  budget_range?: string;
  special_requests?: string;
  preferred_contact?: string;
  created_at?: string;
  updated_at?: string;
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
        acceptance_token TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
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

    // Create acceptance_documents table
    await sql`
      CREATE TABLE IF NOT EXISTS acceptance_documents (
        id SERIAL PRIMARY KEY,
        application_id INTEGER REFERENCES career_applications(id) ON DELETE CASCADE,
        document_type TEXT NOT NULL,
        document_data JSONB NOT NULL,
        signed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create customer_interests table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_interests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        home_size TEXT,
        cleaning_frequency TEXT,
        current_service TEXT,
        budget_range TEXT,
        special_requests TEXT,
        preferred_contact TEXT DEFAULT 'email',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_token ON career_applications(acceptance_token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_acceptance_documents_app_id ON acceptance_documents(application_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_interests_email ON customer_interests(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_interests_created_at ON customer_interests(created_at);`;

  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Utility function to generate unique tokens
function generateAcceptanceToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Career Applications
export const careerApplications = {
  create: async (application: Omit<CareerApplication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await initializeTables();
      
      const acceptanceToken = generateAcceptanceToken();
      
      const result = await sql`
        INSERT INTO career_applications (
          name, email, role_interest, portfolio_link, phone, linkedin, 
          experience_level, why_interested, availability, acceptance_token, status
        ) VALUES (
          ${application.name},
          ${application.email},
          ${application.role_interest},
          ${application.portfolio_link || null},
          ${application.phone || null},
          ${application.linkedin || null},
          ${application.experience_level || null},
          ${application.why_interested || null},
          ${application.availability || null},
          ${acceptanceToken},
          ${application.status || 'pending'}
        ) RETURNING id, acceptance_token;
      `;
      
      return { id: result[0]?.id, acceptance_token: result[0]?.acceptance_token };
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
      
      return result as CareerApplication[];
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
      
      return result[0] as CareerApplication || null;
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
      
      return result as CareerApplication[];
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
      
      return parseInt(result[0]?.count || '0');
    } catch (error) {
      console.error('Error counting career applications:', error);
      return 0;
    }
  },

  getByToken: async (token: string): Promise<CareerApplication | null> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM career_applications WHERE acceptance_token = ${token};
      `;
      
      return result[0] as CareerApplication || null;
    } catch (error) {
      console.error('Error fetching career application by token:', error);
      return null;
    }
  },

  updateStatus: async (id: number, status: 'pending' | 'accepted' | 'rejected'): Promise<boolean> => {
    try {
      await initializeTables();
      
      const result = await sql`
        UPDATE career_applications 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      
      return result.length > 0;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
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
      
      return result[0]?.id;
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
      
      return result[0] as AdminSession || null;
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
      
      return result.length || 0;
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
      
      return result.length || 0;
    } catch (error) {
      console.error('Error deleting session by token:', error);
      return 0;
    }
  }
};

// Acceptance Documents
export const acceptanceDocuments = {
  create: async (applicationId: number, documentType: string, documentData: any) => {
    try {
      await initializeTables();
      
      const result = await sql`
        INSERT INTO acceptance_documents (application_id, document_type, document_data) 
        VALUES (${applicationId}, ${documentType}, ${JSON.stringify(documentData)})
        RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating acceptance document:', error);
      throw error;
    }
  },

  getByApplicationId: async (applicationId: number): Promise<AcceptanceDocument[]> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM acceptance_documents 
        WHERE application_id = ${applicationId} 
        ORDER BY created_at DESC;
      `;
      
      return result.map((doc: any) => ({
        ...doc,
        document_data: typeof doc.document_data === 'string' ? JSON.parse(doc.document_data) : doc.document_data
      })) as AcceptanceDocument[];
    } catch (error) {
      console.error('Error fetching acceptance documents:', error);
      return [];
    }
  },

  markSigned: async (id: number): Promise<boolean> => {
    try {
      await initializeTables();
      
      const result = await sql`
        UPDATE acceptance_documents 
        SET signed_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      
      return result.length > 0;
    } catch (error) {
      console.error('Error marking document as signed:', error);
      return false;
    }
  }
};

// Customer Interests
export const customerInterests = {
  create: async (interest: Omit<CustomerInterest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await initializeTables();
      
      const result = await sql`
        INSERT INTO customer_interests (
          name, email, phone, address, city, state, zip_code, 
          home_size, cleaning_frequency, current_service, budget_range, 
          special_requests, preferred_contact
        ) VALUES (
          ${interest.name},
          ${interest.email},
          ${interest.phone || null},
          ${interest.address || null},
          ${interest.city || null},
          ${interest.state || null},
          ${interest.zip_code || null},
          ${interest.home_size || null},
          ${interest.cleaning_frequency || null},
          ${interest.current_service || null},
          ${interest.budget_range || null},
          ${interest.special_requests || null},
          ${interest.preferred_contact || 'email'}
        ) RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating customer interest:', error);
      throw error;
    }
  },

  getAll: async (): Promise<CustomerInterest[]> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM customer_interests 
        ORDER BY created_at DESC;
      `;
      
      return result as CustomerInterest[];
    } catch (error) {
      console.error('Error fetching customer interests:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<CustomerInterest | null> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT * FROM customer_interests WHERE id = ${id};
      `;
      
      return result[0] as CustomerInterest || null;
    } catch (error) {
      console.error('Error fetching customer interest by ID:', error);
      return null;
    }
  },

  count: async (): Promise<number> => {
    try {
      await initializeTables();
      
      const result = await sql`
        SELECT COUNT(*) as count FROM customer_interests;
      `;
      
      return parseInt(result[0]?.count || '0');
    } catch (error) {
      console.error('Error counting customer interests:', error);
      return 0;
    }
  }
};
