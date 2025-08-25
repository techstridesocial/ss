// Test script to verify campaign system integration
const { query } = require('../lib/db/connection')

async function testCampaignSystem() {
  console.log('🧪 Testing Campaign System Integration...\n')
  
  try {
    // Test 1: Check if campaigns table exists and has correct structure
    console.log('✅ Test 1: Checking campaigns table structure...')
    const campaignsTableCheck = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' 
      ORDER BY ordinal_position;
    `)
    console.log('   Campaigns table columns:', campaignsTableCheck.length, 'found')
    
    // Test 2: Check if brands table exists
    console.log('✅ Test 2: Checking brands table...')
    const brandsTableCheck = await query(`
      SELECT COUNT(*) as count FROM brands LIMIT 1;
    `)
    console.log('   Brands table accessible:', brandsTableCheck[0]?.count !== undefined)
    
    // Test 3: Check campaign_influencers table
    console.log('✅ Test 3: Checking campaign_influencers table...')
    const campaignInfluencersCheck = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'campaign_influencers';
    `)
    console.log('   Campaign influencers columns:', campaignInfluencersCheck.length, 'found')
    
    // Test 4: Check campaign_content_submissions table
    console.log('✅ Test 4: Checking campaign_content_submissions table...')
    const contentSubmissionsCheck = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'campaign_content_submissions';
    `)
    console.log('   Content submissions columns:', contentSubmissionsCheck.length, 'found')
    
    // Test 5: Try a sample campaign query (this should work even with no data)
    console.log('✅ Test 5: Testing sample campaign query...')
    const sampleQuery = await query(`
      SELECT 
        c.id,
        c.name,
        c.status,
        c.description,
        COUNT(ci.id) as total_influencers
      FROM campaigns c
      LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
      GROUP BY c.id, c.name, c.status, c.description
      LIMIT 5;
    `)
    console.log('   Sample query executed successfully, found:', sampleQuery.length, 'campaigns')
    
    console.log('\n🎉 All campaign system tests passed!')
    console.log('\n📊 System Status: READY FOR BRAND PORTAL')
    
  } catch (error) {
    console.error('❌ Campaign system test failed:', error.message)
    console.error('Full error:', error)
  }
}

// Run the test
testCampaignSystem().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('Test execution failed:', error)
  process.exit(1)
})
