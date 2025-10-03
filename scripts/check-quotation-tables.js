const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function checkQuotationTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Checking quotation tables...\n');
    
    // Check for tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('quotations', 'quotation_influencers', 'campaign_invitations')
      ORDER BY table_name
    `);
    
    console.log('📊 Tables found:');
    if (tables.rows.length === 0) {
      console.log('  ❌ No quotation tables found');
    } else {
      tables.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`);
      });
    }
    
    // Check for enum
    const enums = await pool.query(`
      SELECT typname, enumlabel 
      FROM pg_type 
      JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid
      WHERE typname = 'quotation_status'
      ORDER BY enumlabel
    `);
    
    console.log('\n📋 Quotation status enum values:');
    if (enums.rows.length === 0) {
      console.log('  ❌ quotation_status enum not found');
    } else {
      enums.rows.forEach(row => {
        console.log(`  - ${row.enumlabel}`);
      });
    }
    
    // If tables exist, count records
    if (tables.rows.some(r => r.table_name === 'quotations')) {
      const count = await pool.query('SELECT COUNT(*) as count FROM quotations');
      console.log(`\n💾 Quotations in database: ${count.rows[0].count}`);
      
      if (count.rows[0].count > 0) {
        const recent = await pool.query(`
          SELECT id, brand_name, campaign_name, status, created_at 
          FROM quotations 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        console.log('\n🔄 Recent quotations:');
        recent.rows.forEach(q => {
          console.log(`  - ${q.brand_name} | ${q.campaign_name} | ${q.status} | ${new Date(q.created_at).toLocaleDateString()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkQuotationTables();

