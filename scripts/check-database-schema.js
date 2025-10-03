const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function checkDatabaseSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Checking database schema for campaigns and quotations...\n');
    
    // Check campaigns table
    console.log('📊 CAMPAIGNS TABLE:');
    const campaignsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'campaigns'
      ORDER BY ordinal_position
    `);
    
    if (campaignsSchema.rows.length === 0) {
      console.log('  ❌ Campaigns table not found\n');
    } else {
      campaignsSchema.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '- NOT NULL' : ''}`);
      });
      
      // Check for required fields
      const requiredCampaignFields = ['brand', 'target_niches', 'target_platforms', 'start_date', 'end_date'];
      console.log('\n🔎 Required Campaign Fields:');
      
      requiredCampaignFields.forEach(field => {
        const exists = campaignsSchema.rows.find(col => col.column_name === field);
        if (exists) {
          console.log(`  ✅ ${field} - EXISTS (${exists.data_type})`);
        } else {
          console.log(`  ❌ ${field} - MISSING (needs migration)`);
        }
      });
    }
    
    // Check quotations table
    console.log('\n📊 QUOTATIONS TABLE:');
    const quotationsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'quotations'
      ORDER BY ordinal_position
    `);
    
    if (quotationsSchema.rows.length === 0) {
      console.log('  ❌ Quotations table not found\n');
    } else {
      quotationsSchema.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      
      // Check for required fields
      const requiredQuotationFields = ['target_niches', 'target_platforms'];
      console.log('\n🔎 Required Quotation Fields:');
      
      requiredQuotationFields.forEach(field => {
        const exists = quotationsSchema.rows.find(col => col.column_name === field);
        if (exists) {
          console.log(`  ✅ ${field} - EXISTS (${exists.data_type})`);
        } else {
          console.log(`  ❌ ${field} - MISSING (needs migration)`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkDatabaseSchema();

