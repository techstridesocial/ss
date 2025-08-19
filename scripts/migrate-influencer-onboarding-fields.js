const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
})

async function runMigration() {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.log('Database connection string length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0)
  
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting influencer onboarding fields migration...')
    
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '../src/lib/db/add-influencer-onboarding-fields.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute the migration
    await client.query(migrationSQL)
    
    console.log('✅ Successfully added missing influencer onboarding fields')
    
    // Verify the new columns exist
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'influencers' 
      AND column_name IN ('main_platform', 'website_url')
      ORDER BY column_name
    `)
    
    console.log('📋 Influencer onboarding fields:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`)
    })
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().catch(error => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
}

module.exports = { runMigration }
