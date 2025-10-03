// Run migration through the application's database connection
const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Running Campaign ID migration via application...');

// Read the SQL file
const fs = require('fs');
const sqlPath = path.join(__dirname, 'add-campaign-id-field.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('📄 SQL to execute:');
console.log(sql);

// Create a simple script that uses the app's database connection
const migrationScript = `
import { query } from '../src/lib/db/connection.js';

async function runMigration() {
  try {
    console.log('🔄 Running Campaign ID migration...');
    
    const sql = \`${sql.replace(/`/g, '\\`')}\`;
    
    await query(sql);
    console.log('✅ Campaign ID field added successfully');
    
    // Verify the field was added
    const result = await query(\`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' AND column_name = 'campaign_id'
    \`);
    
    if (result.length > 0) {
      console.log('✅ Verification successful - campaign_id field exists');
      console.log('Field details:', result[0]);
    } else {
      console.log('❌ Verification failed - campaign_id field not found');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
`;

// Write the migration script
fs.writeFileSync(path.join(__dirname, 'temp-migration.mjs'), migrationScript);

console.log('📝 Created temporary migration script');
console.log('⚠️  Please run the following command manually:');
console.log('node scripts/temp-migration.mjs');
console.log('');
console.log('Or execute this SQL directly in your Neon database:');
console.log('');
console.log(sql);
