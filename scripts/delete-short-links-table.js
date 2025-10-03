const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function deleteShortLinksTable() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🗑️  DELETING UNUSED short_links TABLE\n')
  
  // 1. Check if it has any data first
  console.log('1️⃣ Checking for data in short_links...')
  try {
    const count = await sql`SELECT COUNT(*) as count FROM short_links`
    console.log(`   Found ${count[0].count} records in short_links\n`)
  } catch (err) {
    console.log('   ⚠️  Could not count records (table might not exist)\n')
  }
  
  // 2. Check foreign key dependencies
  console.log('2️⃣ Checking for foreign key dependencies...')
  const dependencies = await sql`
    SELECT 
      tc.table_name, 
      kcu.column_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND ccu.table_name = 'short_links'
  `
  
  if (dependencies.length > 0) {
    console.log('   ⚠️  WARNING: Other tables reference short_links:')
    console.table(dependencies)
    console.log('\n   Aborting - please remove foreign key constraints first!')
    return
  } else {
    console.log('   ✅ No foreign key dependencies found\n')
  }
  
  // 3. Delete the table
  console.log('3️⃣ Dropping short_links table...')
  try {
    await sql`DROP TABLE IF EXISTS short_links CASCADE`
    console.log('   ✅ short_links table deleted successfully!\n')
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`)
    return
  }
  
  // 4. Verify deletion
  console.log('4️⃣ Verifying deletion...')
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'short_links'
  `
  
  if (tables.length === 0) {
    console.log('   ✅ CONFIRMED: short_links table no longer exists!\n')
  } else {
    console.log('   ⚠️  Table still exists?!\n')
  }
  
  console.log('📊 SUMMARY:')
  console.log('   ✅ Deleted: short_links (unused duplicate)')
  console.log('   ✅ Kept: tracking_links (actively used in code)')
  console.log('\n✅ Cleanup complete!')
}

deleteShortLinksTable().catch(console.error)
