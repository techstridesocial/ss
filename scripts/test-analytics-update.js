// Test script to manually trigger analytics update for a specific influencer
const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

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

async function testAnalyticsUpdate() {
  console.log('🧪 Testing Analytics Update for Content Link...')
  console.log('=' * 60)
  
  try {
    // Find the influencer with the content link
    const influencerWithLink = await query(`
      SELECT 
        ci.id as campaign_influencer_id,
        ci.influencer_id,
        ci.content_links,
        i.display_name
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.content_links IS NOT NULL 
        AND ci.content_links != '[]'::jsonb
        AND jsonb_array_length(ci.content_links) > 0
      LIMIT 1
    `)
    
    if (influencerWithLink.length === 0) {
      console.log('❌ No influencers with content links found!')
      return
    }
    
    const influencer = influencerWithLink[0]
    console.log(`\n📋 Found influencer with content link:`)
    console.log(`   Name: ${influencer.display_name}`)
    console.log(`   Influencer ID: ${influencer.influencer_id}`)
    console.log(`   Content Links: ${JSON.stringify(influencer.content_links)}`)
    
    // Test the Modash API directly first
    console.log('\n🔄 Testing Modash API directly...')
    
    // Test the specific Instagram URL
    const testUrl = influencer.content_links[0]
    console.log(`   Testing URL: ${testUrl}`)
    
    try {
      const response = await fetch(`http://localhost:3000/api/modash/test-raw-media?url=${encodeURIComponent(testUrl)}`)
      const result = await response.json()
      
      console.log('📊 Modash API Response:')
      console.log(`   Success: ${result.success}`)
      if (result.data && result.data.analytics) {
        console.log(`   Analytics:`, result.data.analytics)
      } else if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      
    } catch (apiError) {
      console.error('❌ Modash API test failed:', apiError.message)
    }
    
    // Test the analytics update
    console.log('\n🚀 Testing analytics update...')
    console.log(`   Processing ${influencer.content_links.length} content links for influencer ${influencer.influencer_id}`)
    
    try {
      const result = await updateInfluencerAnalyticsFromContentLinks(
        influencer.influencer_id, 
        influencer.content_links
      )
      
      console.log(`\n✅ Analytics update result: ${result}`)
      
      // Check the updated analytics
      const updatedAnalytics = await query(`
        SELECT 
          total_engagements,
          total_views,
          total_likes,
          total_comments,
          avg_engagement_rate,
          analytics_updated_at
        FROM influencers 
        WHERE id = $1
      `, [influencer.influencer_id])
      
      const analytics = updatedAnalytics[0]
      console.log('\n📊 Updated Analytics:')
      console.log(`   Total Engagements: ${analytics.total_engagements}`)
      console.log(`   Total Views: ${analytics.total_views}`)
      console.log(`   Total Likes: ${analytics.total_likes}`)
      console.log(`   Total Comments: ${analytics.total_comments}`)
      console.log(`   Avg Engagement Rate: ${analytics.avg_engagement_rate}`)
      console.log(`   Analytics Updated: ${analytics.analytics_updated_at}`)
      
      if (analytics.total_engagements > 0 || analytics.total_views > 0) {
        console.log('\n🎉 SUCCESS: Analytics were updated!')
      } else {
        console.log('\n⚠️  WARNING: Analytics are still 0 - something went wrong')
      }
      
    } catch (analyticsError) {
      console.error('\n❌ Analytics update failed:', analyticsError)
      console.error('Error details:', {
        message: analyticsError.message,
        stack: analyticsError.stack
      })
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error)
  } finally {
    await pool.end()
  }
}

// Run test if called directly
if (require.main === module) {
  testAnalyticsUpdate()
    .then(() => {
      console.log('\n✅ Test completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testAnalyticsUpdate }
