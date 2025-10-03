require('dotenv/config');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    console.log('🔍 Checking campaigns table schema...\n');
    
    const campaignsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'campaigns'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Campaigns Table Columns:');
    campaignsSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '- NOT NULL' : ''}`);
    });
    
    // Check specifically for the fields we're using
    const requiredFields = ['brand', 'brand_name', 'target_niches', 'target_platforms', 'start_date', 'end_date'];
    console.log(`\n🔎 Checking for required fields:`);
    
    requiredFields.forEach(field => {
      const exists = campaignsSchema.rows.find(col => col.column_name === field);
      if (exists) {
        console.log(`  ✅ ${field} - EXISTS (${exists.data_type})`);
      } else {
        console.log(`  ❌ ${field} - MISSING`);
      }
    });
    
    // Check quotations table
    console.log(`\n📊 Checking quotations table...`);
    const quotationsSchema = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'quotations'
      ORDER BY ordinal_position
    `);
    
    const quotationFields = ['target_niches', 'target_platforms'];
    console.log(`\n🔎 Checking quotations for required fields:`);
    quotationFields.forEach(field => {
      const exists = quotationsSchema.rows.find(col => col.column_name === field);
      if (exists) {
        console.log(`  ✅ ${field} - EXISTS (${exists.data_type})`);
      } else {
        console.log(`  ❌ ${field} - MISSING`);
      }
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkSchema();
