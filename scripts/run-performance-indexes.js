#!/usr/bin/env node

/**
 * Performance Indexes Migration Script
 * Adds missing database indexes for optimal query performance
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function runMigration() {
  const pool = new Pool({ connectionString })
  
  try {
    console.log('🔄 Connecting to database...')
    const client = await pool.connect()
    
    console.log('✅ Connected to database')
    console.log('📋 Reading performance indexes SQL file...')
    
    const sqlPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'performance-indexes.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('🚀 Running performance indexes migration...')
    await client.query(sql)
    
    console.log('✅ Performance indexes created successfully!')
    
    // Verify indexes were created
    console.log('\n📊 Verifying indexes...')
    const result = await client.query(`
      SELECT schemaname, tablename, indexname 
      FROM pg_indexes 
      WHERE tablename IN ('quotations', 'shortlists', 'campaign_influencers', 'influencers', 'user_profiles', 'campaign_content_submissions')
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `)
    
    console.log(`\n✅ Found ${result.rows.length} indexes:`)
    result.rows.forEach(row => {
      console.log(`   - ${row.tablename}.${row.indexname}`)
    })
    
    client.release()
    await pool.end()
    
    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    await pool.end()
    process.exit(1)
  }
}

runMigration()
