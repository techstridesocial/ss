const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function verifyCleanup() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('✅ VERIFYING DATABASE CLEANUP\n')
  
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `
  
  console.log(`📊 Total tables now: ${tables.length}\n`)
  
  // Check for the tables we care about
  const tracking = tables.find(t => t.table_name === 'tracking_links')
  const short = tables.find(t => t.table_name === 'short_links')
  
  console.log('Link Tracking Tables:')
  console.log(`   tracking_links: ${tracking ? '✅ EXISTS (in use)' : '❌ MISSING'}`)
  console.log(`   short_links:    ${short ? '⚠️  STILL EXISTS' : '✅ DELETED'}`)
  
  console.log('\n✅ Cleanup verification complete!')
}

verifyCleanup().catch(console.error)
