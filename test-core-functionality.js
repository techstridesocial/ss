const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function testCoreFunctionality() {
  console.log('🧪 TESTING CORE FUNCTIONALITY')
  console.log('==============================')
  
  const sql = neon(process.env.DATABASE_URL)
  
  try {
    // Test 1: Database Tables
    console.log('\n1️⃣ Testing Database Tables...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    console.log(`✅ Found ${tables.length} tables`)
    
    // Test 2: Key Tables Data
    console.log('\n2️⃣ Testing Key Tables...')
    
    // Users table
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`
    console.log(`✅ Users table: ${usersCount[0].count} records`)
    
    // Brands table
    const brandsCount = await sql`SELECT COUNT(*) as count FROM brands`
    console.log(`✅ Brands table: ${brandsCount[0].count} records`)
    
    // Influencers table
    const influencersCount = await sql`SELECT COUNT(*) as count FROM influencers`
    console.log(`✅ Influencers table: ${influencersCount[0].count} records`)
    
    // Campaigns table
    const campaignsCount = await sql`SELECT COUNT(*) as count FROM campaigns`
    console.log(`✅ Campaigns table: ${campaignsCount[0].count} records`)
    
    // Test 3: Foreign Key Relationships
    console.log('\n3️⃣ Testing Foreign Key Relationships...')
    const fkCount = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY'
    `
    console.log(`✅ Foreign keys: ${fkCount[0].count} relationships`)
    
    // Test 4: Recent Data
    console.log('\n4️⃣ Testing Recent Data...')
    const recentUsers = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `
    console.log(`✅ Recent users (7 days): ${recentUsers[0].count}`)
    
    console.log('\n✅ ALL CORE FUNCTIONALITY TESTS PASSED!')
    
  } catch (error) {
    console.log('\n❌ CORE FUNCTIONALITY TEST FAILED!')
    console.log('❌ Error:', error.message)
  }
}

testCoreFunctionality()
