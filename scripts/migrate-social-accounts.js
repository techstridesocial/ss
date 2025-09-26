#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('🔗 Connecting to database...');
  const pool = new Pool({
    connectionString: databaseUrl
  });
  
  try {
    console.log('🔄 Running social accounts table migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-social-accounts-simple.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Social accounts table created successfully!');
    
    // Verify the table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'influencer_social_accounts'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful!');
    } else {
      console.log('⚠️  Table verification failed - table may not exist');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch((error) => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});
