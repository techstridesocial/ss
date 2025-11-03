#!/usr/bin/env node

/**
 * Run Performance Indexes Migration
 * Adds composite indexes for faster query performance
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  process.exit(1);
}

async function runMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔗 Connecting to Neon database...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'src', 'lib', 'db', 'add-performance-indexes.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Running performance indexes migration...');
    console.log('⏳ This may take a few minutes for large tables...\n');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        // Skip comments
        if (statement.startsWith('--')) continue;
        
        // Extract index name for logging
        const indexMatch = statement.match(/idx_[\w_]+/);
        const indexName = indexMatch ? indexMatch[0] : 'unknown';
        
        if (statement.includes('CREATE INDEX')) {
          process.stdout.write(`  Creating ${indexName}... `);
          await pool.query(statement);
          console.log('✅');
          successCount++;
        } else if (statement.includes('ANALYZE')) {
          const tableMatch = statement.match(/ANALYZE (\w+)/);
          const tableName = tableMatch ? tableMatch[1] : 'table';
          process.stdout.write(`  Analyzing ${tableName}... `);
          await pool.query(statement);
          console.log('✅');
          successCount++;
        } else {
          await pool.query(statement);
          successCount++;
        }
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⏭️  (already exists)');
          skipCount++;
        } else {
          console.log('❌');
          console.error(`  Error: ${error.message}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Created: ${successCount}`);
    console.log(`  ⏭️  Skipped: ${skipCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Performance indexes migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

