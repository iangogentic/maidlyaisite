const { neon } = require('@neondatabase/serverless');

// Database connection
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url) {
    return 'postgresql://neondb_owner:npg_2AigG5BtfpkX@ep-little-brook-af8rp8sj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
  }
  
  if (url.startsWith("psql '") && url.endsWith("'")) {
    url = url.slice(6, -1);
  }
  
  url = url.replace(/&channel_binding=require/, '');
  
  return url;
};

const sql = neon(getDatabaseUrl());

async function updateDatabaseSchema() {
  try {
    console.log('🔄 Updating database schema...');
    
    // Add new columns to career_applications table
    console.log('Adding acceptance_token column...');
    try {
      await sql`ALTER TABLE career_applications ADD COLUMN acceptance_token TEXT UNIQUE;`;
      console.log('✅ Added acceptance_token column');
    } catch (error) {
      if (error.code === '42701') {
        console.log('⚠️  acceptance_token column already exists');
      } else {
        throw error;
      }
    }
    
    console.log('Adding status column...');
    try {
      await sql`ALTER TABLE career_applications ADD COLUMN status TEXT DEFAULT 'pending';`;
      console.log('✅ Added status column');
    } catch (error) {
      if (error.code === '42701') {
        console.log('⚠️  status column already exists');
      } else {
        throw error;
      }
    }
    
    // Create acceptance_documents table
    console.log('Creating acceptance_documents table...');
    try {
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
      console.log('✅ Created acceptance_documents table');
    } catch (error) {
      console.log('⚠️  acceptance_documents table already exists or error:', error.message);
    }
    
    // Create indexes
    console.log('Creating indexes...');
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_token ON career_applications(acceptance_token);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_acceptance_documents_app_id ON acceptance_documents(application_id);`;
      console.log('✅ Created indexes');
    } catch (error) {
      console.log('⚠️  Indexes already exist or error:', error.message);
    }
    
    // Update existing records to have tokens
    console.log('Updating existing records with tokens...');
    const existingRecords = await sql`SELECT id FROM career_applications WHERE acceptance_token IS NULL;`;
    
    for (const record of existingRecords) {
      const token = generateAcceptanceToken();
      await sql`UPDATE career_applications SET acceptance_token = ${token} WHERE id = ${record.id};`;
    }
    
    console.log(`✅ Updated ${existingRecords.length} existing records with tokens`);
    
    console.log('🎉 Database schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error);
  }
}

// Utility function to generate unique tokens
function generateAcceptanceToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

updateDatabaseSchema();
