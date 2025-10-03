const { Pool } = require('pg');
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Running Campaign ID migration...');
    
    // Read the migration SQL
    const fs = require('fs');
    const sql = fs.readFileSync('./scripts/add-campaign-id-field.sql', 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Campaign ID field added successfully');
    
    // Verify the field was added
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' AND column_name = 'campaign_id'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verification successful - campaign_id field exists');
      console.log('Field details:', result.rows[0]);
    } else {
      console.log('❌ Verification failed - campaign_id field not found');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
