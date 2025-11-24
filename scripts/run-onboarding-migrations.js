/**
 * Run onboarding and submission list migrations
 * 
 * Usage: node scripts/run-onboarding-migrations.js
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function runMigration(filePath) {
  try {
    console.log(`\n📄 Running migration: ${path.basename(filePath)}`)
    const sql = fs.readFileSync(filePath, 'utf8')
    
    // Execute the entire SQL file (handles multi-statement SQL properly)
    await pool.query(sql)
    
    console.log(`✅ Migration completed: ${path.basename(filePath)}`)
    return true
  } catch (error) {
    console.error(`❌ Error running migration ${filePath}:`, error.message)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting onboarding and submission list migrations...\n')
    
    // Test connection
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful\n')

    // Run migrations in order
    const migrations = [
      path.join(__dirname, 'migrations', 'add-talent-onboarding-tables.sql'),
      path.join(__dirname, 'migrations', 'add-staff-submission-lists-tables.sql')
    ]

    for (const migration of migrations) {
      if (!fs.existsSync(migration)) {
        console.warn(`⚠️  Migration file not found: ${migration}`)
        continue
      }
      await runMigration(migration)
    }

    // Verify tables were created
    console.log('\n🔍 Verifying migrations...\n')
    
    const verifyTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'talent_onboarding_steps',
        'talent_brand_preferences',
        'talent_payment_history',
        'talent_brand_collaborations',
        'staff_submission_lists',
        'staff_submission_list_influencers',
        'staff_submission_list_comments'
      )
      ORDER BY table_name
    `)
    
    console.log('📊 Created tables:')
    verifyTables.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`)
    })
    
    // Check for enum type
    const verifyEnum = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname = 'submission_list_status'
    `)
    
    if (verifyEnum.rows.length > 0) {
      console.log('  ✅ Enum type \'submission_list_status\' exists')
    }
    
    console.log('\n🎉 All migrations completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

