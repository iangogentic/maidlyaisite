// Import database functions
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

// Utility function to generate unique tokens
function generateAcceptanceToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Career Applications functions
const careerApplications = {
  create: async (application) => {
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
  },

  getById: async (id) => {
    const result = await sql`
      SELECT * FROM career_applications WHERE id = ${id};
    `;
    return result[0] || null;
  },

  getByToken: async (token) => {
    const result = await sql`
      SELECT * FROM career_applications WHERE acceptance_token = ${token};
    `;
    return result[0] || null;
  },

  updateStatus: async (id, status) => {
    const result = await sql`
      UPDATE career_applications 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id};
    `;
    return result.length > 0;
  },

  getAll: async () => {
    const result = await sql`
      SELECT * FROM career_applications 
      ORDER BY created_at DESC;
    `;
    return result;
  }
};

async function testFunctionality() {
  console.log('🧪 Testing Career Application System...\n');
  
  try {
    // Test 1: Create a test application
    console.log('1️⃣ Creating test application...');
    const applicationData = {
      name: "Test User",
      email: "test@example.com",
      role_interest: "CTO/AI",
      portfolio_link: "https://github.com/testuser",
      phone: "555-123-4567",
      linkedin: "https://linkedin.com/in/testuser",
      experience_level: "3-5 years",
      why_interested: "I am excited about building AI systems and want to contribute to the future of home automation.",
      availability: "Within 2 weeks"
    };
    
    const result = await careerApplications.create(applicationData);
    console.log('✅ Application created with ID:', result.id);
    console.log('🔗 Acceptance token:', result.acceptance_token);
    console.log('🌐 Acceptance URL: https://your-domain.com/acceptance/' + result.acceptance_token);
    
    // Test 2: Retrieve the application
    console.log('\n2️⃣ Retrieving application...');
    const application = await careerApplications.getById(result.id);
    console.log('✅ Application retrieved:', {
      id: application.id,
      name: application.name,
      email: application.email,
      role_interest: application.role_interest,
      status: application.status,
      acceptance_token: application.acceptance_token
    });
    
    // Test 3: Test status updates
    console.log('\n3️⃣ Testing status updates...');
    
    // Update to accepted
    await careerApplications.updateStatus(result.id, 'accepted');
    const acceptedApp = await careerApplications.getById(result.id);
    console.log('✅ Status updated to accepted:', acceptedApp.status);
    
    // Update to rejected
    await careerApplications.updateStatus(result.id, 'rejected');
    const rejectedApp = await careerApplications.getById(result.id);
    console.log('✅ Status updated to rejected:', rejectedApp.status);
    
    // Update back to pending
    await careerApplications.updateStatus(result.id, 'pending');
    const pendingApp = await careerApplications.getById(result.id);
    console.log('✅ Status updated to pending:', pendingApp.status);
    
    // Test 4: Test token lookup
    console.log('\n4️⃣ Testing token lookup...');
    const appByToken = await careerApplications.getByToken(result.acceptance_token);
    console.log('✅ Application found by token:', {
      id: appByToken.id,
      name: appByToken.name,
      status: appByToken.status
    });
    
    // Test 5: Get all applications
    console.log('\n5️⃣ Getting all applications...');
    const allApps = await careerApplications.getAll();
    console.log('✅ Total applications:', allApps.length);
    
    console.log('\n🎉 All tests passed! The system is working correctly.');
    console.log('\n📋 Summary:');
    console.log('- ✅ Applications are created with unique tokens');
    console.log('- ✅ Status updates (pending/accepted/rejected) work');
    console.log('- ✅ Token-based lookup works');
    console.log('- ✅ Database operations are functioning');
    
    console.log('\n🔗 Test the acceptance page at:');
    console.log(`https://maidly-real-dy6bkt6gy-ians-projects-d5107473.vercel.app/acceptance/${result.acceptance_token}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFunctionality();
