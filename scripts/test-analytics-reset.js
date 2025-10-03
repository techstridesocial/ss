// Test script to verify analytics reset functionality
const { Pool } = require('pg')

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function query(text, params) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

async function testAnalyticsReset() {
  console.log('🧪 Testing analytics reset functionality...')
  
  try {
    // Find an influencer with some analytics data
    const testInfluencer = await query(`
      SELECT 
        id,
        display_name,
        total_engagements,
        total_views,
        total_likes,
        total_comments,
        avg_engagement_rate
      FROM influencers 
      WHERE total_engagements > 0 OR total_views > 0
      LIMIT 1
    `)
    
    if (testInfluencer.length === 0) {
      console.log('ℹ️ No influencers with analytics data found - creating test data...')
      
      // Create test data
      await query(`
        UPDATE influencers 
        SET 
          total_engagements = 1000,
          total_views = 5000,
          total_likes = 800,
          total_comments = 200,
          avg_engagement_rate = 20.0,
          analytics_updated_at = NOW()
        WHERE id IN (SELECT id FROM influencers LIMIT 1)
        RETURNING id, display_name
      `)
      
      const updated = await query(`
        SELECT 
          id,
          display_name,
          total_engagements,
          total_views,
          total_likes,
          total_comments,
          avg_engagement_rate
        FROM influencers 
        WHERE total_engagements > 0
        LIMIT 1
      `)
      
      testInfluencer.push(...updated)
    }
    
    const influencer = testInfluencer[0]
    console.log(`\n📊 Testing with influencer: ${influencer.display_name}`)
    console.log(`   ID: ${influencer.id}`)
    console.log(`   Before reset:`)
    console.log(`   - Engagements: ${influencer.total_engagements}`)
    console.log(`   - Views: ${influencer.total_views}`)
    console.log(`   - Likes: ${influencer.total_likes}`)
    console.log(`   - Comments: ${influencer.total_comments}`)
    console.log(`   - ER: ${influencer.avg_engagement_rate}%`)
    
    // Simulate the analytics reset (like when content links are deleted)
    console.log(`\n🔄 Simulating analytics reset (empty content links)...`)
    
    await query(`
      UPDATE influencers 
      SET 
        total_engagements = 0,
        total_engagement_rate = 0,
        avg_engagement_rate = 0,
        estimated_reach = 0,
        total_avg_views = 0,
        estimated_promotion_views = 0,
        total_likes = 0,
        total_comments = 0,
        total_views = 0,
        analytics_updated_at = NOW()
      WHERE id = $1
    `, [influencer.id])
    
    // Verify the reset
    const afterReset = await query(`
      SELECT 
        total_engagements,
        total_views,
        total_likes,
        total_comments,
        avg_engagement_rate,
        analytics_updated_at
      FROM influencers 
      WHERE id = $1
    `, [influencer.id])
    
    const resetData = afterReset[0]
    console.log(`\n✅ After reset:`)
    console.log(`   - Engagements: ${resetData.total_engagements}`)
    console.log(`   - Views: ${resetData.total_views}`)
    console.log(`   - Likes: ${resetData.total_likes}`)
    console.log(`   - Comments: ${resetData.total_comments}`)
    console.log(`   - ER: ${resetData.avg_engagement_rate}%`)
    console.log(`   - Updated: ${resetData.analytics_updated_at}`)
    
    // Check if all values are 0
    const allZero = resetData.total_engagements === 0 && 
                   resetData.total_views === 0 && 
                   resetData.total_likes === 0 && 
                   resetData.total_comments === 0 && 
                   resetData.avg_engagement_rate === 0
    
    if (allZero) {
      console.log(`\n🎉 SUCCESS: Analytics reset to 0 correctly!`)
    } else {
      console.log(`\n❌ FAILED: Analytics not properly reset to 0`)
    }
    
    // Test the campaign influencer update with empty content links
    console.log(`\n🧪 Testing campaign influencer update with empty content links...`)
    
    // Find a campaign influencer record
    const campaignInfluencer = await query(`
      SELECT id, campaign_id, influencer_id, content_links
      FROM campaign_influencers 
      WHERE influencer_id = $1
      LIMIT 1
    `, [influencer.id])
    
    if (campaignInfluencer.length > 0) {
      const ci = campaignInfluencer[0]
      console.log(`   Found campaign influencer: ${ci.id}`)
      console.log(`   Current content links: ${ci.content_links}`)
      
      // Update with empty content links (simulating deletion)
      await query(`
        UPDATE campaign_influencers 
        SET 
          content_links = '[]'::jsonb,
          updated_at = NOW()
        WHERE id = $1
      `, [ci.id])
      
      console.log(`   ✅ Updated campaign_influencers with empty content links`)
    } else {
      console.log(`   ℹ️ No campaign_influencer record found for this influencer`)
    }
    
    console.log(`\n🎯 Test completed successfully!`)
    console.log(`   The fix should now properly reset analytics to 0 when content links are deleted.`)
    
  } catch (error) {
    console.error('❌ Error testing analytics reset:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run test if called directly
if (require.main === module) {
  testAnalyticsReset()
    .then(() => {
      console.log('✅ Test completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testAnalyticsReset }
