const { neon } = require('@neondatabase/serverless');

// Database connection
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url) {
    // Fallback URL for development
    return 'postgresql://neondb_owner:npg_2AigG5BtfpkX@ep-little-brook-af8rp8sj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
  }
  
  if (url.startsWith("psql '") && url.endsWith("'")) {
    url = url.slice(6, -1);
  }
  
  url = url.replace(/&channel_binding=require/, '');
  
  return url;
};

const sql = neon(getDatabaseUrl());

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing database...');
    
    // Clear all tables
    await sql`DELETE FROM acceptance_documents;`;
    console.log('✅ Cleared acceptance_documents table');
    
    await sql`DELETE FROM career_applications;`;
    console.log('✅ Cleared career_applications table');
    
    await sql`DELETE FROM admin_sessions;`;
    console.log('✅ Cleared admin_sessions table');
    
    // Reset sequences
    await sql`ALTER SEQUENCE career_applications_id_seq RESTART WITH 1;`;
    await sql`ALTER SEQUENCE acceptance_documents_id_seq RESTART WITH 1;`;
    await sql`ALTER SEQUENCE admin_sessions_id_seq RESTART WITH 1;`;
    console.log('✅ Reset ID sequences');
    
    console.log('🎉 Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

clearDatabase();
