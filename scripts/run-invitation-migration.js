#!/usr/bin/env node

/**
 * Run the invitation tracking migration
 * This script applies the database migration to add invitation tracking
 */

const fs = require('fs')
const path = require('path')

async function runMigration() {
  try {
    console.log('🚀 Starting invitation tracking migration...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../src/lib/db/invitation-tracking-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration SQL loaded')
    console.log('⚠️  Please run this SQL in your database:')
    console.log('')
    console.log('=' * 80)
    console.log(migrationSQL)
    console.log('=' * 80)
    console.log('')
    console.log('✅ Migration SQL ready to execute')
    console.log('')
    console.log('Next steps:')
    console.log('1. Connect to your database')
    console.log('2. Run the SQL above')
    console.log('3. Set up Clerk webhook endpoint: /api/webhooks/clerk')
    console.log('4. Configure CLERK_WEBHOOK_SECRET in your environment')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
