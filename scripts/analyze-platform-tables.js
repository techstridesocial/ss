const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function analyzePlatformTables() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🔍 ANALYZING: influencer_platforms vs influencer_social_accounts\n')
  
  // 1. Check data counts
  console.log('1️⃣ DATA COUNT:\n')
  const platformsCount = await sql`SELECT COUNT(*) as count FROM influencer_platforms`
  const socialCount = await sql`SELECT COUNT(*) as count FROM influencer_social_accounts`
  
  console.table([
    { table: 'influencer_platforms', records: platformsCount[0].count },
    { table: 'influencer_social_accounts', records: socialCount[0].count }
  ])
  
  // 2. Check schemas
  console.log('\n2️⃣ SCHEMA COMPARISON:\n')
  
  const platformsSchema = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'influencer_platforms'
    ORDER BY ordinal_position
  `
  
  const socialSchema = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'influencer_social_accounts'
    ORDER BY ordinal_position
  `
  
  console.log('influencer_platforms columns:')
  platformsSchema.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`))
  
  console.log('\ninfluencer_social_accounts columns:')
  socialSchema.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`))
  
  // 3. Check foreign key dependencies
  console.log('\n3️⃣ FOREIGN KEY DEPENDENCIES:\n')
  
  const platformsDeps = await sql`
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
      AND ccu.table_name = 'influencer_platforms'
  `
  
  const socialDeps = await sql`
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
  
  console.log('Tables referencing influencer_platforms:')
  if (platformsDeps.length > 0) {
    console.table(platformsDeps)
  } else {
    console.log('   ✅ None')
  }
  
  console.log('\nTables referencing influencer_social_accounts:')
  if (socialDeps.length > 0) {
    console.table(socialDeps)
  } else {
    console.log('   ✅ None')
  }
  
  // 4. Sample data comparison
  console.log('\n4️⃣ SAMPLE DATA:\n')
  
  console.log('Sample from influencer_platforms:')
  const platformsSample = await sql`SELECT * FROM influencer_platforms LIMIT 2`
  if (platformsSample.length > 0) {
    console.table(platformsSample)
  } else {
    console.log('   (empty)\n')
  }
  
  console.log('Sample from influencer_social_accounts:')
  const socialSample = await sql`SELECT * FROM influencer_social_accounts LIMIT 2`
  if (socialSample.length > 0) {
    console.table(socialSample)
  } else {
    console.log('   (empty)\n')
  }
  
  console.log('\n📊 VERDICT:')
  console.log(`   influencer_platforms: ${platformsCount[0].count} records, used in 19 files (73 references)`)
  console.log(`   influencer_social_accounts: ${socialCount[0].count} records, used in 4 files (17 references)`)
  console.log(`   Foreign keys: platforms(${platformsDeps.length}), social(${socialDeps.length})`)
  
  console.log('\n✅ Analysis complete!')
}

analyzePlatformTables().catch(console.error)
