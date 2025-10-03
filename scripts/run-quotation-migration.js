const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runQuotationMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Running quotation and campaign invitation migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'quotation-campaign-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Successfully created quotation tables');
    
    // Verify the tables were created
    const verifyQuotations = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('quotations', 'quotation_influencers', 'campaign_invitations')
    `);
    
    console.log('\n📊 Verification:');
    verifyQuotations.rows.forEach(row => {
      console.log(`  ✅ Table '${row.table_name}' exists`);
    });
    
    // Check for quotation_status enum
    const verifyEnum = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname = 'quotation_status'
    `);
    
    if (verifyEnum.rows.length > 0) {
      console.log('  ✅ Enum type \'quotation_status\' exists');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    console.error('\nDetails:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runQuotationMigration();

