const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Running onboarding migration...');
    
    // Add is_onboarded field if it doesn't exist
    await pool.query(`
      ALTER TABLE user_profiles 
      ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ Added is_onboarded field to user_profiles table');

    // Update existing brand users to show they need onboarding
    const result = await pool.query(`
      UPDATE user_profiles 
      SET is_onboarded = FALSE 
      WHERE user_id IN (
        SELECT id FROM users WHERE role = 'BRAND'
      )
    `);
    console.log(`✅ Updated ${result.rowCount} brand user profiles for onboarding`);

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration(); 