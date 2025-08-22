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
let tablesInitialized = false;

try {
  sql = neon(getDatabaseUrl());
} catch (error) {
  console.error('Database connection error:', error);
  // Fallback to direct URL
  sql = neon('postgresql://neondb_owner:npg_2AigG5BtfpkX@ep-little-brook-af8rp8sj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');
}

// Initialize tables once at startup
async function ensureTablesInitialized() {
  if (tablesInitialized) return;
  
  try {
    await initializeTables();
    tablesInitialized = true;
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    // Don't set tablesInitialized = true so it will retry next time
  }
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

export interface CustomerPreferences {
  id?: number;
  customer_email: string;
  customer_phone?: string;
  customer_name?: string;
  // Notification channels
  sms_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  // Notification types
  booking_confirmations: boolean;
  service_reminders: boolean;
  crew_arrival_notifications: boolean;
  service_completion: boolean;
  payment_receipts: boolean;
  promotional_messages: boolean;
  // Timing preferences
  reminder_timing: 'none' | '15min' | '30min' | '1hour' | '2hours' | '1day';
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string; // HH:MM format
  timezone?: string;
  // Metadata
  created_at?: string;
  updated_at?: string;
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

export interface Booking {
  id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  home_size: number;
  bedrooms: number;
  bathrooms: number;
  service_type: 'regular' | 'deep' | 'one_time' | 'move_in' | 'move_out';
  cleaning_type: 'eco_friendly' | 'regular' | 'bring_own_supplies';
  frequency?: 'weekly' | 'bi_weekly' | 'monthly';
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  price_cents: number;
  add_ons: string[];
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  special_instructions?: string;
  ai_preferences: any;
  photos?: any[];
  stripe_payment_intent_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceNote {
  id?: number;
  booking_id: number;
  note_type: 'crew_observation' | 'customer_feedback' | 'ai_insight' | 'quality_check';
  content: string;
  confidence_score: number;
  created_by?: string;
  created_at?: string;
}

export interface CustomerProfile {
  id?: number;
  email: string;
  name: string;
  phone?: string;
  addresses: any[];
  preferences: any;
  total_bookings: number;
  satisfaction_score: number;
  lifetime_value_cents: number;
  last_service_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SimpleInventoryItem {
  id?: number;
  item_name: string;
  category: string;
  current_stock: number;
  cost_per_use_cents: number;
  supplier_info?: any;
  last_updated?: string;
}

export interface CrewMember {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  employee_id?: string;
  status: 'available' | 'on_job' | 'break' | 'off_duty' | 'unavailable';
  hourly_rate_cents: number;
  hire_date?: string;
  certifications?: string[];
  emergency_contact?: any;
  stripe_connect_account_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeEntry {
  id?: number;
  crew_member_id: number;
  booking_id?: number;
  clock_in_time?: string;
  clock_out_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  clock_in_location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    timestamp: string;
  };
  clock_out_location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    timestamp: string;
  };
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  status: 'active' | 'completed' | 'approved' | 'rejected';
  notes?: string;
  photos?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CrewLocation {
  id?: number;
  crew_member_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: string;
  activity_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'location_update' | 'job_arrival' | 'job_departure';
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

    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        home_size INTEGER NOT NULL,
        bedrooms INTEGER NOT NULL,
        bathrooms INTEGER NOT NULL,
        service_type TEXT NOT NULL,
        cleaning_type TEXT NOT NULL,
        frequency TEXT,
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 120,
        price_cents INTEGER NOT NULL,
        add_ons JSONB DEFAULT '[]',
        status TEXT DEFAULT 'scheduled',
        special_instructions TEXT,
        ai_preferences JSONB DEFAULT '{}',
        photos JSONB DEFAULT '[]',
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create service_notes table
    await sql`
      CREATE TABLE IF NOT EXISTS service_notes (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        note_type TEXT NOT NULL,
        content TEXT NOT NULL,
        confidence_score DECIMAL(3,2) DEFAULT 1.0,
        created_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create customer_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_profiles (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        addresses JSONB DEFAULT '[]',
        preferences JSONB DEFAULT '{}',
        total_bookings INTEGER DEFAULT 0,
        satisfaction_score DECIMAL(3,2) DEFAULT 5.0,
        lifetime_value_cents INTEGER DEFAULT 0,
        last_service_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create simple_inventory table
    await sql`
      CREATE TABLE IF NOT EXISTS simple_inventory (
        id SERIAL PRIMARY KEY,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        current_stock INTEGER DEFAULT 0,
        cost_per_use_cents INTEGER DEFAULT 0,
        supplier_info JSONB,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create crew_members table
    await sql`
      CREATE TABLE IF NOT EXISTS crew_members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        employee_id TEXT UNIQUE,
        status TEXT DEFAULT 'available',
        hourly_rate_cents INTEGER DEFAULT 0,
        hire_date DATE,
        certifications JSONB DEFAULT '[]',
        emergency_contact JSONB,
        stripe_connect_account_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create time_entries table with GPS tracking
    await sql`
      CREATE TABLE IF NOT EXISTS time_entries (
        id SERIAL PRIMARY KEY,
        crew_member_id INTEGER REFERENCES crew_members(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
        clock_in_time TIMESTAMPTZ,
        clock_out_time TIMESTAMPTZ,
        break_start_time TIMESTAMPTZ,
        break_end_time TIMESTAMPTZ,
        clock_in_location JSONB,
        clock_out_location JSONB,
        total_hours DECIMAL(5,2) DEFAULT 0,
        regular_hours DECIMAL(5,2) DEFAULT 0,
        overtime_hours DECIMAL(5,2) DEFAULT 0,
        status TEXT DEFAULT 'active',
        notes TEXT,
        photos JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create crew_locations table for real-time tracking
    await sql`
      CREATE TABLE IF NOT EXISTS crew_locations (
        id SERIAL PRIMARY KEY,
        crew_member_id INTEGER REFERENCES crew_members(id) ON DELETE CASCADE,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        accuracy DECIMAL(8,2),
        address TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        activity_type TEXT DEFAULT 'location_update',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create customer_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS customer_preferences (
        id SERIAL PRIMARY KEY,
        customer_email TEXT UNIQUE NOT NULL,
        customer_phone TEXT,
        customer_name TEXT,
        -- Notification channels
        sms_enabled BOOLEAN DEFAULT true,
        email_enabled BOOLEAN DEFAULT true,
        push_enabled BOOLEAN DEFAULT true,
        -- Notification types
        booking_confirmations BOOLEAN DEFAULT true,
        service_reminders BOOLEAN DEFAULT true,
        crew_arrival_notifications BOOLEAN DEFAULT true,
        service_completion BOOLEAN DEFAULT true,
        payment_receipts BOOLEAN DEFAULT true,
        promotional_messages BOOLEAN DEFAULT false,
        -- Timing preferences
        reminder_timing TEXT DEFAULT '1hour' CHECK (reminder_timing IN ('none', '15min', '30min', '1hour', '2hours', '1day')),
        quiet_hours_start TIME,
        quiet_hours_end TIME,
        timezone TEXT DEFAULT 'America/New_York',
        -- Metadata
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
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_notes_booking_id ON service_notes(booking_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_simple_inventory_category ON simple_inventory(category);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crew_members_email ON crew_members(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crew_members_status ON crew_members(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crew_members_employee_id ON crew_members(employee_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_time_entries_crew_member ON time_entries(crew_member_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_time_entries_booking ON time_entries(booking_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in_time);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crew_locations_member ON crew_locations(crew_member_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_crew_locations_timestamp ON crew_locations(timestamp);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_customer_preferences_email ON customer_preferences(customer_email);`;

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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
      const result = await sql`
        UPDATE career_applications 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      
      return result.rowCount > 0;
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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
      await ensureTablesInitialized();
      
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

// Bookings
export const bookings = {
  create: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO bookings (
          customer_name, customer_email, customer_phone, address, city, state, zip_code,
          home_size, bedrooms, bathrooms, service_type, cleaning_type, frequency,
          scheduled_date, scheduled_time, duration_minutes, price_cents, add_ons,
          status, special_instructions, ai_preferences, stripe_payment_intent_id
        ) VALUES (
          ${booking.customer_name}, ${booking.customer_email}, ${booking.customer_phone || null},
          ${booking.address}, ${booking.city}, ${booking.state}, ${booking.zip_code},
          ${booking.home_size}, ${booking.bedrooms}, ${booking.bathrooms},
          ${booking.service_type}, ${booking.cleaning_type}, ${booking.frequency || null},
          ${booking.scheduled_date}, ${booking.scheduled_time}, ${booking.duration_minutes},
          ${booking.price_cents}, ${JSON.stringify(booking.add_ons)}, ${booking.status},
          ${booking.special_instructions || null}, ${JSON.stringify(booking.ai_preferences)},
          ${booking.stripe_payment_intent_id || null}
        ) RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  getAll: async (): Promise<Booking[]> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM bookings 
        ORDER BY scheduled_date DESC, scheduled_time DESC;
      `;
      
      return result.map((booking: any) => ({
        ...booking,
        add_ons: typeof booking.add_ons === 'string' ? JSON.parse(booking.add_ons) : booking.add_ons,
        ai_preferences: typeof booking.ai_preferences === 'string' ? JSON.parse(booking.ai_preferences) : booking.ai_preferences
      })) as Booking[];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Booking | null> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM bookings WHERE id = ${id};
      `;
      
      if (result[0]) {
        const booking = result[0];
        return {
          ...booking,
          add_ons: typeof booking.add_ons === 'string' ? JSON.parse(booking.add_ons) : booking.add_ons,
          ai_preferences: typeof booking.ai_preferences === 'string' ? JSON.parse(booking.ai_preferences) : booking.ai_preferences
        } as Booking;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      return null;
    }
  },

  getByEmail: async (email: string): Promise<Booking[]> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM bookings 
        WHERE customer_email = ${email} 
        ORDER BY scheduled_date DESC, scheduled_time DESC;
      `;
      
      return result.map((booking: any) => ({
        ...booking,
        add_ons: typeof booking.add_ons === 'string' ? JSON.parse(booking.add_ons) : booking.add_ons,
        ai_preferences: typeof booking.ai_preferences === 'string' ? JSON.parse(booking.ai_preferences) : booking.ai_preferences
      })) as Booking[];
    } catch (error) {
      console.error('Error fetching bookings by email:', error);
      return [];
    }
  },

  updateStatus: async (id: number, status: Booking['status']): Promise<boolean> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        UPDATE bookings 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  },

  updatePhotos: async (id: number, photos: any[]): Promise<boolean> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        UPDATE bookings 
        SET photos = ${JSON.stringify(photos)}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating booking photos:', error);
      return false;
    }
  },

  getTodaysJobs: async (): Promise<Booking[]> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM bookings 
        WHERE scheduled_date = CURRENT_DATE 
        AND status IN ('scheduled', 'confirmed', 'in_progress')
        ORDER BY scheduled_time ASC;
      `;
      
      return result.map((booking: any) => ({
        ...booking,
        add_ons: typeof booking.add_ons === 'string' ? JSON.parse(booking.add_ons) : booking.add_ons,
        ai_preferences: typeof booking.ai_preferences === 'string' ? JSON.parse(booking.ai_preferences) : booking.ai_preferences
      })) as Booking[];
    } catch (error) {
      console.error('Error fetching today\'s jobs:', error);
      return [];
    }
  }
};

// Service Notes
export const serviceNotes = {
  create: async (note: Omit<ServiceNote, 'id' | 'created_at'>) => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO service_notes (booking_id, note_type, content, confidence_score, created_by)
        VALUES (${note.booking_id}, ${note.note_type}, ${note.content}, ${note.confidence_score}, ${note.created_by || null})
        RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating service note:', error);
      throw error;
    }
  },

  getByBookingId: async (bookingId: number): Promise<ServiceNote[]> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM service_notes 
        WHERE booking_id = ${bookingId} 
        ORDER BY created_at DESC;
      `;
      
      return result as ServiceNote[];
    } catch (error) {
      console.error('Error fetching service notes:', error);
      return [];
    }
  }
};

// Customer Profiles
export const customerProfiles = {
  createOrUpdate: async (profile: Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO customer_profiles (
          email, name, phone, addresses, preferences, total_bookings, 
          satisfaction_score, lifetime_value_cents, last_service_date
        ) VALUES (
          ${profile.email}, ${profile.name}, ${profile.phone || null},
          ${JSON.stringify(profile.addresses)}, ${JSON.stringify(profile.preferences)},
          ${profile.total_bookings}, ${profile.satisfaction_score}, 
          ${profile.lifetime_value_cents}, ${profile.last_service_date || null}
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          addresses = EXCLUDED.addresses,
          preferences = EXCLUDED.preferences,
          total_bookings = EXCLUDED.total_bookings,
          satisfaction_score = EXCLUDED.satisfaction_score,
          lifetime_value_cents = EXCLUDED.lifetime_value_cents,
          last_service_date = EXCLUDED.last_service_date,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating/updating customer profile:', error);
      throw error;
    }
  },

  getByEmail: async (email: string): Promise<CustomerProfile | null> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM customer_profiles WHERE email = ${email};
      `;
      
      if (result[0]) {
        const profile = result[0];
        return {
          ...profile,
          addresses: typeof profile.addresses === 'string' ? JSON.parse(profile.addresses) : profile.addresses,
          preferences: typeof profile.preferences === 'string' ? JSON.parse(profile.preferences) : profile.preferences
        } as CustomerProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
  }
};

// Crew Members
export const crewMembers = {
  create: async (member: Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO crew_members (
          name, email, phone, employee_id, status, hourly_rate_cents, 
          hire_date, certifications, emergency_contact, stripe_connect_account_id
        ) VALUES (
          ${member.name}, ${member.email}, ${member.phone || null},
          ${member.employee_id || null}, ${member.status}, ${member.hourly_rate_cents},
          ${member.hire_date || null}, ${JSON.stringify(member.certifications || [])},
          ${JSON.stringify(member.emergency_contact || {})}, ${member.stripe_connect_account_id || null}
        ) RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating crew member:', error);
      throw error;
    }
  },

  getAll: async (): Promise<CrewMember[]> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM crew_members 
        ORDER BY name ASC;
      `;
      
      return result.map((member: any) => ({
        ...member,
        certifications: typeof member.certifications === 'string' ? JSON.parse(member.certifications) : member.certifications,
        emergency_contact: typeof member.emergency_contact === 'string' ? JSON.parse(member.emergency_contact) : member.emergency_contact
      })) as CrewMember[];
    } catch (error) {
      console.error('Error fetching crew members:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<CrewMember | null> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM crew_members WHERE id = ${id};
      `;
      
      if (result[0]) {
        const member = result[0];
        return {
          ...member,
          certifications: typeof member.certifications === 'string' ? JSON.parse(member.certifications) : member.certifications,
          emergency_contact: typeof member.emergency_contact === 'string' ? JSON.parse(member.emergency_contact) : member.emergency_contact
        } as CrewMember;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching crew member by ID:', error);
      return null;
    }
  },

  updateStatus: async (id: number, status: CrewMember['status']): Promise<boolean> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        UPDATE crew_members 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${id};
      `;
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating crew member status:', error);
      return false;
    }
  }
};

// Time Entries
export const timeEntries = {
  create: async (entry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO time_entries (
          crew_member_id, booking_id, clock_in_time, clock_out_time,
          break_start_time, break_end_time, clock_in_location, clock_out_location,
          total_hours, regular_hours, overtime_hours, status, notes, photos
        ) VALUES (
          ${entry.crew_member_id}, ${entry.booking_id || null},
          ${entry.clock_in_time || null}, ${entry.clock_out_time || null},
          ${entry.break_start_time || null}, ${entry.break_end_time || null},
          ${JSON.stringify(entry.clock_in_location || {})}, ${JSON.stringify(entry.clock_out_location || {})},
          ${entry.total_hours}, ${entry.regular_hours}, ${entry.overtime_hours},
          ${entry.status}, ${entry.notes || null}, ${JSON.stringify(entry.photos || [])}
        ) RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  },

  getByCrewMember: async (crewMemberId: number, startDate?: string, endDate?: string): Promise<TimeEntry[]> => {
    try {
      await ensureTablesInitialized();
      
      if (startDate && endDate) {
        const result = await sql`
          SELECT * FROM time_entries 
          WHERE crew_member_id = ${crewMemberId}
          AND clock_in_time >= ${startDate} 
          AND clock_in_time <= ${endDate}
          ORDER BY clock_in_time DESC
        `;
        
        return result.map((entry: any) => ({
          ...entry,
          clock_in_location: typeof entry.clock_in_location === 'string' ? JSON.parse(entry.clock_in_location) : entry.clock_in_location,
          clock_out_location: typeof entry.clock_out_location === 'string' ? JSON.parse(entry.clock_out_location) : entry.clock_out_location,
          photos: typeof entry.photos === 'string' ? JSON.parse(entry.photos) : entry.photos
        })) as TimeEntry[];
      } else {
        const result = await sql`
          SELECT * FROM time_entries 
          WHERE crew_member_id = ${crewMemberId}
          ORDER BY clock_in_time DESC
        `;
        
        return result.map((entry: any) => ({
          ...entry,
          clock_in_location: typeof entry.clock_in_location === 'string' ? JSON.parse(entry.clock_in_location) : entry.clock_in_location,
          clock_out_location: typeof entry.clock_out_location === 'string' ? JSON.parse(entry.clock_out_location) : entry.clock_out_location,
          photos: typeof entry.photos === 'string' ? JSON.parse(entry.photos) : entry.photos
        })) as TimeEntry[];
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  },

  getAll: async (): Promise<TimeEntry[]> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM time_entries 
        ORDER BY clock_in_time DESC
      `;
      
      return result.map((entry: any) => ({
        ...entry,
        clock_in_location: typeof entry.clock_in_location === 'string' ? JSON.parse(entry.clock_in_location) : entry.clock_in_location,
        clock_out_location: typeof entry.clock_out_location === 'string' ? JSON.parse(entry.clock_out_location) : entry.clock_out_location,
        photos: typeof entry.photos === 'string' ? JSON.parse(entry.photos) : entry.photos
      })) as TimeEntry[];
    } catch (error) {
      console.error('Error fetching all time entries:', error);
      return [];
    }
  },

  clockIn: async (crewMemberId: number, location: TimeEntry['clock_in_location'], bookingId?: number): Promise<number | null> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO time_entries (
          crew_member_id, booking_id, clock_in_time, clock_in_location, status, total_hours, regular_hours, overtime_hours
        ) VALUES (
          ${crewMemberId}, ${bookingId || null}, NOW(), ${JSON.stringify(location)}, 'active', 0, 0, 0
        ) RETURNING id;
      `;
      
      // Update crew member status
      await crewMembers.updateStatus(crewMemberId, 'on_job');
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error clocking in:', error);
      return null;
    }
  },

  clockOut: async (entryId: number, location: TimeEntry['clock_out_location'], notes?: string): Promise<boolean> => {
    try {
      await ensureTablesInitialized();
      
      // Get the entry to calculate hours
      const entry = await sql`
        SELECT clock_in_time, crew_member_id FROM time_entries WHERE id = ${entryId};
      `;
      
      if (!entry[0]) return false;
      
      const clockInTime = new Date(entry[0].clock_in_time);
      const clockOutTime = new Date();
      const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      const regularHours = Math.min(hoursWorked, 8);
      const overtimeHours = Math.max(0, hoursWorked - 8);
      
      const result = await sql`
        UPDATE time_entries 
        SET 
          clock_out_time = NOW(),
          clock_out_location = ${JSON.stringify(location)},
          total_hours = ${hoursWorked},
          regular_hours = ${regularHours},
          overtime_hours = ${overtimeHours},
          status = 'completed',
          notes = ${notes || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${entryId};
      `;
      
      // Update crew member status back to available
      await crewMembers.updateStatus(entry[0].crew_member_id, 'available');
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error clocking out:', error);
      return false;
    }
  }
};

// Crew Locations
export const crewLocations = {
  create: async (location: Omit<CrewLocation, 'id' | 'created_at'>) => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO crew_locations (
          crew_member_id, latitude, longitude, accuracy, address, timestamp, activity_type
        ) VALUES (
          ${location.crew_member_id}, ${location.latitude}, ${location.longitude},
          ${location.accuracy || null}, ${location.address || null},
          ${location.timestamp || null}, ${location.activity_type}
        ) RETURNING id;
      `;
      
      return result[0]?.id;
    } catch (error) {
      console.error('Error creating crew location:', error);
      throw error;
    }
  },

  getLatestByCrewMember: async (crewMemberId: number): Promise<CrewLocation | null> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM crew_locations 
        WHERE crew_member_id = ${crewMemberId} 
        ORDER BY timestamp DESC 
        LIMIT 1;
      `;
      
      return result[0] as CrewLocation || null;
    } catch (error) {
      console.error('Error fetching latest crew location:', error);
      return null;
    }
  },

  getAllCurrent: async (): Promise<CrewLocation[]> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT DISTINCT ON (crew_member_id) *
        FROM crew_locations 
        WHERE timestamp > NOW() - INTERVAL '1 hour'
        ORDER BY crew_member_id, timestamp DESC;
      `;
      
      return result as CrewLocation[];
    } catch (error) {
      console.error('Error fetching current crew locations:', error);
      return [];
    }
  }
};

// Customer Preferences
export const customerPreferences = {
  // Get preferences for a customer by email
  getByEmail: async (email: string): Promise<CustomerPreferences | null> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        SELECT * FROM customer_preferences 
        WHERE customer_email = ${email} 
        LIMIT 1;
      `;
      
      return result[0] as CustomerPreferences || null;
    } catch (error) {
      console.error('Error fetching customer preferences:', error);
      return null;
    }
  },

  // Create or update customer preferences
  upsert: async (preferences: Omit<CustomerPreferences, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerPreferences | null> => {
    try {
      await ensureTablesInitialized();
      
      const result = await sql`
        INSERT INTO customer_preferences (
          customer_email, customer_phone, customer_name,
          sms_enabled, email_enabled, push_enabled,
          booking_confirmations, service_reminders, crew_arrival_notifications,
          service_completion, payment_receipts, promotional_messages,
          reminder_timing, quiet_hours_start, quiet_hours_end, timezone
        ) VALUES (
          ${preferences.customer_email}, ${preferences.customer_phone || null}, ${preferences.customer_name || null},
          ${preferences.sms_enabled}, ${preferences.email_enabled}, ${preferences.push_enabled},
          ${preferences.booking_confirmations}, ${preferences.service_reminders}, ${preferences.crew_arrival_notifications},
          ${preferences.service_completion}, ${preferences.payment_receipts}, ${preferences.promotional_messages},
          ${preferences.reminder_timing}, ${preferences.quiet_hours_start || null}, ${preferences.quiet_hours_end || null}, ${preferences.timezone || null}
        )
        ON CONFLICT (customer_email) 
        DO UPDATE SET
          customer_phone = EXCLUDED.customer_phone,
          customer_name = EXCLUDED.customer_name,
          sms_enabled = EXCLUDED.sms_enabled,
          email_enabled = EXCLUDED.email_enabled,
          push_enabled = EXCLUDED.push_enabled,
          booking_confirmations = EXCLUDED.booking_confirmations,
          service_reminders = EXCLUDED.service_reminders,
          crew_arrival_notifications = EXCLUDED.crew_arrival_notifications,
          service_completion = EXCLUDED.service_completion,
          payment_receipts = EXCLUDED.payment_receipts,
          promotional_messages = EXCLUDED.promotional_messages,
          reminder_timing = EXCLUDED.reminder_timing,
          quiet_hours_start = EXCLUDED.quiet_hours_start,
          quiet_hours_end = EXCLUDED.quiet_hours_end,
          timezone = EXCLUDED.timezone,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      
      return result[0] as CustomerPreferences;
    } catch (error) {
      console.error('Error upserting customer preferences:', error);
      return null;
    }
  },

  // Get default preferences for a new customer
  getDefaults: (): Omit<CustomerPreferences, 'id' | 'customer_email' | 'created_at' | 'updated_at'> => {
    return {
      customer_phone: undefined,
      customer_name: undefined,
      // Enable all channels by default
      sms_enabled: true,
      email_enabled: true,
      push_enabled: true,
      // Enable important notifications by default
      booking_confirmations: true,
      service_reminders: true,
      crew_arrival_notifications: true,
      service_completion: true,
      payment_receipts: true,
      promotional_messages: false, // Opt-in for promotional
      // Default timing
      reminder_timing: '1hour',
      quiet_hours_start: undefined,
      quiet_hours_end: undefined,
      timezone: 'America/New_York'
    };
  },

  // Check if customer should receive a specific notification type
  shouldReceiveNotification: async (
    email: string, 
    notificationType: keyof Pick<CustomerPreferences, 'booking_confirmations' | 'service_reminders' | 'crew_arrival_notifications' | 'service_completion' | 'payment_receipts' | 'promotional_messages'>,
    channel: 'sms' | 'email' | 'push'
  ): Promise<boolean> => {
    try {
      const preferences = await customerPreferences.getByEmail(email);
      
      if (!preferences) {
        // If no preferences found, use defaults (conservative approach)
        const defaults = customerPreferences.getDefaults();
        return Boolean(defaults[notificationType]) && Boolean(defaults[`${channel}_enabled` as keyof typeof defaults]);
      }
      
      // Check if the notification type is enabled AND the channel is enabled
      const channelEnabled = preferences[`${channel}_enabled` as keyof CustomerPreferences];
      const notificationEnabled = preferences[notificationType];
      
      return Boolean(channelEnabled && notificationEnabled);
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return false; // Conservative default
    }
  }
};

export { sql };
