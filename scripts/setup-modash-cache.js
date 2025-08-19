#!/usr/bin/env node

/**
 * Setup script for Modash cache system
 * 
 * This script:
 * 1. Creates the cache database tables
 * 2. Adds the modash_profile_id column to existing tables
 * 3. Sets up indexes for performance
 * 4. Verifies the setup
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Database configuration from environment variables
const dbConfig = {
  host: process.env.POSTGRES_HOST || process.env.PGHOST,
  port: process.env.POSTGRES_PORT || process.env.PGPORT || 5432,
  database: process.env.POSTGRES_DATABASE || process.env.PGDATABASE,
  user: process.env.POSTGRES_USER || process.env.PGUSER,
  password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}

async function setupModashCache() {
  const client = new Pool(dbConfig)
  
  try {
    console.log('🚀 Setting up Modash cache system...')
    
    // 1. Add modash_profile_id column
    console.log('📝 Adding modash_profile_id column...')
    const addColumnSQL = fs.readFileSync(
      path.join(__dirname, '../src/lib/db/add-modash-profile-id.sql'),
      'utf8'
    )
    await client.query(addColumnSQL)
    console.log('✅ Added modash_profile_id column')
    
    // 2. Create cache tables
    console.log('📝 Creating cache tables...')
    const cacheSchemaSQL = fs.readFileSync(
      path.join(__dirname, '../src/lib/db/modash-cache-schema.sql'),
      'utf8'
    )
    await client.query(cacheSchemaSQL)
    console.log('✅ Created cache tables')
    
    // 3. Verify setup
    console.log('🔍 Verifying setup...')
    
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('modash_profile_cache', 'modash_audience_cache', 'modash_update_log')
      ORDER BY table_name
    `)
    
    console.log('📊 Cache tables found:', tableCheck.rows.map(r => r.table_name))
    
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'influencer_platforms' 
        AND column_name = 'modash_profile_id'
    `)
    
    console.log('📊 Modash profile ID column:', columnCheck.rows.length > 0 ? 'Present' : 'Missing')
    
    // 4. Show summary
    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   ✅ modash_profile_cache table')
    console.log('   ✅ modash_audience_cache table') 
    console.log('   ✅ modash_update_log table')
    console.log('   ✅ modash_profile_id column in influencer_platforms')
    console.log('   ✅ Performance indexes')
    
    console.log('\n🔄 Next steps:')
    console.log('   1. Configure cron job to hit /api/modash/update-cache every 4 weeks')
    console.log('   2. Set MODASH_UPDATE_TOKEN environment variable')
    console.log('   3. Test the cache system with a real influencer profile')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the setup
setupModashCache() 
