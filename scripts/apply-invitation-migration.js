#!/usr/bin/env node

/**
 * Apply the invitation tracking migration to the database
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function applyMigration() {
  let pool
  
  try {
    console.log('🚀 Starting invitation tracking migration...')
    
    // Create database connection
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found in environment variables')
    }
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
    
    console.log('📡 Connected to database')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../src/lib/db/invitation-tracking-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration SQL loaded')
    
    // Split the SQL into individual statements and group them properly
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute statements in order, handling dependencies
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
          console.log(`   SQL: ${statement.substring(0, 100)}...`)
          await pool.query(statement)
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (error) {
          // Check if it's a "already exists" error (which is fine)
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation') && error.message.includes('already exists') ||
              error.message.includes('type') && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message.split('\n')[0]}`)
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message)
            console.error(`   SQL: ${statement}`)
            throw error
          }
        }
      }
    }
    
    console.log('')
    console.log('🎉 Migration completed successfully!')
    console.log('')
    console.log('✅ Database tables created:')
    console.log('   - user_invitations')
    console.log('   - clerk_webhook_events')
    console.log('   - invitation_status enum')
    console.log('   - Indexes and triggers')
    console.log('')
    console.log('🔧 Next steps:')
    console.log('1. Set CLERK_WEBHOOK_SECRET in your .env.local')
    console.log('2. Configure Clerk webhook endpoint: /api/webhooks/clerk')
    console.log('3. Test the invitation system!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
      console.log('📡 Database connection closed')
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

applyMigration()
