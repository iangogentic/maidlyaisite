import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'maidly.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS career_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role_interest TEXT NOT NULL,
    portfolio_link TEXT,
    phone TEXT,
    linkedin TEXT,
    experience_level TEXT,
    why_interested TEXT,
    availability TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);
  CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
`);

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

// Career Applications
export const careerApplications = {
  create: (application: Omit<CareerApplication, 'id' | 'created_at' | 'updated_at'>) => {
    const stmt = db.prepare(`
      INSERT INTO career_applications (
        name, email, role_interest, portfolio_link, phone, linkedin, 
        experience_level, why_interested, availability
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      application.name,
      application.email,
      application.role_interest,
      application.portfolio_link || null,
      application.phone || null,
      application.linkedin || null,
      application.experience_level || null,
      application.why_interested || null,
      application.availability || null
    );
    
    return result.lastInsertRowid;
  },

  getAll: (): CareerApplication[] => {
    const stmt = db.prepare(`
      SELECT * FROM career_applications 
      ORDER BY created_at DESC
    `);
    return stmt.all() as CareerApplication[];
  },

  getById: (id: number): CareerApplication | null => {
    const stmt = db.prepare('SELECT * FROM career_applications WHERE id = ?');
    return stmt.get(id) as CareerApplication | null;
  },

  getByEmail: (email: string): CareerApplication[] => {
    const stmt = db.prepare('SELECT * FROM career_applications WHERE email = ? ORDER BY created_at DESC');
    return stmt.all(email) as CareerApplication[];
  },

  count: (): number => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM career_applications');
    const result = stmt.get() as { count: number };
    return result.count;
  }
};

// Admin Sessions
export const adminSessions = {
  create: (sessionToken: string, expiresAt: Date) => {
    const stmt = db.prepare(`
      INSERT INTO admin_sessions (session_token, expires_at) 
      VALUES (?, ?)
    `);
    
    const result = stmt.run(sessionToken, expiresAt.toISOString());
    return result.lastInsertRowid;
  },

  getByToken: (token: string): AdminSession | null => {
    const stmt = db.prepare(`
      SELECT * FROM admin_sessions 
      WHERE session_token = ? AND expires_at > datetime('now')
    `);
    return stmt.get(token) as AdminSession | null;
  },

  deleteExpired: () => {
    const stmt = db.prepare(`
      DELETE FROM admin_sessions 
      WHERE expires_at <= datetime('now')
    `);
    return stmt.run();
  },

  deleteByToken: (token: string) => {
    const stmt = db.prepare('DELETE FROM admin_sessions WHERE session_token = ?');
    return stmt.run(token);
  }
};

// Clean up expired sessions periodically
setInterval(() => {
  adminSessions.deleteExpired();
}, 60 * 60 * 1000); // Every hour

export default db;
