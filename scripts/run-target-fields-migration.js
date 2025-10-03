const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🚀 Running target fields migration...\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-target-fields-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Verify the changes
    console.log('🔍 Verifying migrations...\n');
    
    const campaignsCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' 
      AND column_name IN ('target_niches', 'target_platforms')
      ORDER BY column_name
    `);
    
    console.log('📊 Campaigns table:');
    campaignsCheck.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name} (${row.data_type})`);
    });
    
    const quotationsCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quotations' 
      AND column_name IN ('target_niches', 'target_platforms')
      ORDER BY column_name
    `);
    
    console.log('\n📊 Quotations table:');
    quotationsCheck.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name} (${row.data_type})`);
    });
    
    console.log('\n✨ Database is now up to date!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

