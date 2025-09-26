#!/usr/bin/env node

/**
 * Check what's already in the database
 */

const { Pool } = require('pg')

async function checkDatabase() {
  let pool
  
  try {
    console.log('🔍 Checking database state...')
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found')
    }
    
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    })
    
    // Check existing enums
    console.log('📋 Checking existing enums...')
    const enumResult = await pool.query(`
      SELECT typname, enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE typname LIKE '%status%' OR typname LIKE '%invitation%'
      ORDER BY typname, e.enumsortorder
    `)
    
    console.log('Existing enums:')
    enumResult.rows.forEach(row => {
      console.log(`  ${row.typname}: ${row.enumlabel}`)
    })
    
    // Check existing tables
    console.log('\n📋 Checking existing tables...')
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%invitation%' OR table_name LIKE '%webhook%'
      ORDER BY table_name
    `)
    
    console.log('Existing tables:')
    tableResult.rows.forEach(row => {
      console.log(`  ${row.table_name}`)
    })
    
  } catch (error) {
    console.error('❌ Check failed:', error.message)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

require('dotenv').config({ path: '.env.local' })
checkDatabase()
