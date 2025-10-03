const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function checkShortlistTables() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🔍 Checking for duplicate shortlist/saved tables...\n')
  
  // 1. shortlist_influencers structure
  console.log('1️⃣ SHORTLIST_INFLUENCERS TABLE:')
  const shortlistInfluencersSchema = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'shortlist_influencers'
    ORDER BY ordinal_position
  `
  console.table(shortlistInfluencersSchema)
  
  // 2. shortlists structure
  console.log('\n2️⃣ SHORTLISTS TABLE:')
  const shortlistsSchema = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'shortlists'
    ORDER BY ordinal_position
  `
  console.table(shortlistsSchema)
  
  // 3. staff_saved_influencers structure
  console.log('\n3️⃣ STAFF_SAVED_INFLUENCERS TABLE:')
  const staffSavedSchema = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'staff_saved_influencers'
    ORDER BY ordinal_position
  `
  console.table(staffSavedSchema)
  
  // 4. Check data in each table
  console.log('\n4️⃣ DATA COUNT IN EACH TABLE:')
  const shortlistInfluencersCount = await sql`SELECT COUNT(*) as count FROM shortlist_influencers`
  const shortlistsCount = await sql`SELECT COUNT(*) as count FROM shortlists`
  const staffSavedCount = await sql`SELECT COUNT(*) as count FROM staff_saved_influencers`
  
  console.table([
    { table: 'shortlist_influencers', records: shortlistInfluencersCount[0].count },
    { table: 'shortlists', records: shortlistsCount[0].count },
    { table: 'staff_saved_influencers', records: staffSavedCount[0].count }
  ])
  
  // 5. Sample data from each
  console.log('\n5️⃣ SAMPLE DATA - SHORTLIST_INFLUENCERS:')
  const shortlistInfluencersSample = await sql`SELECT * FROM shortlist_influencers LIMIT 3`
  console.table(shortlistInfluencersSample)
  
  console.log('\n6️⃣ SAMPLE DATA - SHORTLISTS:')
  const shortlistsSample = await sql`SELECT * FROM shortlists LIMIT 3`
  console.table(shortlistsSample)
  
  console.log('\n7️⃣ SAMPLE DATA - STAFF_SAVED_INFLUENCERS:')
  const staffSavedSample = await sql`SELECT * FROM staff_saved_influencers LIMIT 3`
  console.table(staffSavedSample)
  
  // 6. Check for foreign key relationships
  console.log('\n8️⃣ FOREIGN KEY RELATIONSHIPS:')
  const relationships = await sql`
    SELECT 
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name IN ('shortlist_influencers', 'shortlists', 'staff_saved_influencers')
  `
  console.table(relationships)
  
  console.log('\n✅ Analysis complete!')
  console.log('\n📋 VERDICT:')
  console.log('   - shortlists: Parent table (stores shortlist metadata)')
  console.log('   - shortlist_influencers: Child table (many-to-many relationship)')
  console.log('   - staff_saved_influencers: Separate feature (staff personal saves)')
}

checkShortlistTables().catch(console.error)
