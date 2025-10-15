require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function createCurrentStaffUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('🔧 Creating staff user record for current logged-in user...');
    
    // We need to create a user record for the current Clerk session
    // Since we don't know the exact Clerk ID, let's create a generic one
    // The user can update their profile later
    
    const currentTimestamp = Date.now();
    const tempClerkId = `temp_staff_${currentTimestamp}`;
    const tempEmail = `staff_${currentTimestamp}@stridesocial.com`;
    
    console.log('📝 Creating user with:');
    console.log(`  Clerk ID: ${tempClerkId}`);
    console.log(`  Email: ${tempEmail}`);
    console.log(`  Role: STAFF`);
    
    // Create user record
    const userResult = await pool.query(`
      INSERT INTO users (clerk_id, email, role, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [tempClerkId, tempEmail, 'STAFF', 'ACTIVE']);
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Created user with ID: ${userId}`);
    
    // Create user profile
    await pool.query(`
      INSERT INTO user_profiles (user_id, first_name, last_name, is_onboarded)
      VALUES ($1, $2, $3, $4)
    `, [userId, 'Staff', 'Member', true]);
    
    console.log('✅ Created user profile');
    console.log('');
    console.log('🎉 Staff user created successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Update the clerk_id in the database to match your actual Clerk user ID');
    console.log('2. Update the email to your actual email address');
    console.log('3. Update first_name and last_name in user_profiles table');
    console.log('');
    console.log('🔧 To find your actual Clerk ID, check the browser console when you try to assign an influencer');
    
  } catch (error) {
    console.error('❌ Error creating staff user:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the script
createCurrentStaffUser();
