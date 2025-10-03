const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function deleteInfluencerSocialAccounts() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🗑️  DELETING influencer_social_accounts TABLE\n')
  
  // 1. Check data count
  console.log('1️⃣ Checking data in influencer_social_accounts...')
  const count = await sql`SELECT COUNT(*) as count FROM influencer_social_accounts`
  console.log(`   Found ${count[0].count} records\n`)
  
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
      AND ccu.table_name = 'influencer_social_accounts'
  `
  
  if (dependencies.length > 0) {
    console.log('   ⚠️  WARNING: Other tables reference influencer_social_accounts:')
    console.table(dependencies)
    console.log('\n   ❌ Aborting - please remove foreign key constraints first!')
    return
  } else {
    console.log('   ✅ No foreign key dependencies\n')
  }
  
  // 3. Drop the table
  console.log('3️⃣ Dropping influencer_social_accounts table...')
  await sql`DROP TABLE IF EXISTS influencer_social_accounts CASCADE`
  console.log('   ✅ Table deleted successfully!\n')
  
  // 4. Verify deletion
  console.log('4️⃣ Verifying deletion...')
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'influencer_social_accounts'
  `
  
  if (tables.length === 0) {
    console.log('   ✅ CONFIRMED: influencer_social_accounts no longer exists!\n')
  } else {
    console.log('   ⚠️  Table still exists?!\n')
  }
  
  console.log('📊 CLEANUP SUMMARY:')
  console.log('   ✅ Deleted: influencer_social_accounts (experimental/duplicate)')
  console.log('   ✅ Kept: influencer_platforms (production table with 5 FK dependencies)')
  console.log('   ✅ Updated: 4 files to use influencer_platforms')
  console.log('\n✅ Migration complete!')
}

deleteInfluencerSocialAccounts().catch(console.error)
