require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
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
  
  const client = new Client({
    connectionString: connectionString
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to Neon database');
    
    const sqlPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'staff-saved-influencers.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 Executing migration script...');
    
    await client.query(sql);
    console.log('🚀 Migration completed successfully!');
    console.log('📊 staff_saved_influencers table created with indexes');
    console.log('✨ Ready to use the Saved tab functionality!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Table might already exist - this is normal if running migration again');
    }
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();
