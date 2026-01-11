require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ No database connection string found in environment variables');
    console.log('💡 Please check .env.local for DATABASE_URL or POSTGRES_URL');
    return;
  }
  
  console.log('🔌 Using database URL from environment');
  
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔗 Connecting to Neon database...');
    
    const sqlPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'add-shortlist-id-to-quotations.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 Executing migration script...');
    console.log('SQL to execute:');
    console.log(sql);
    console.log('\n');
    
    // Execute the SQL statements
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
    console.log('📊 Added shortlist_id column to quotations table');
    console.log('📊 Created index on shortlist_id');
    console.log('✨ Ready to track quotations by shortlist!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('ℹ️ Column or index might already exist - this is normal if running migration again');
    } else {
      console.error('Full error:', error);
    }
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();

