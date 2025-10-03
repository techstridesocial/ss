const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runWhatsAppMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Adding whatsapp_url field to influencers table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-whatsapp-field.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Successfully added whatsapp_url field to influencers table');
    
    // Verify the column was added
    const verifyResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'influencers' 
      AND column_name = 'whatsapp_url'
    `);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Verified: whatsapp_url column exists');
      console.log(`   Type: ${verifyResult.rows[0].data_type}`);
    } else {
      console.log('⚠️  Warning: Could not verify column creation');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runWhatsAppMigration();

