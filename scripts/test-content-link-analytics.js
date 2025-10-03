// Test script to verify content link analytics integration
const { Pool } = require('pg')
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

async function testContentLinkAnalytics() {
  console.log('🧪 Testing Content Link Analytics Integration...')
  
  try {
    // Check if we have any campaign influencers with content links
    const campaignInfluencers = await query(`
      SELECT 
        ci.id,
        ci.influencer_id,
        ci.content_links,
        ci.discount_code,
        c.name as campaign_name,
        i.display_name as influencer_name
      FROM campaign_influencers ci
      JOIN campaigns c ON ci.campaign_id = c.id
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.content_links IS NOT NULL 
        AND ci.content_links != '[]'::jsonb
        AND ci.content_links != 'null'::jsonb
      LIMIT 5
    `)
    
    console.log(`📋 Found ${campaignInfluencers.length} campaign influencers with content links`)
    
    if (campaignInfluencers.length === 0) {
      console.log('ℹ️ No campaign influencers with content links found. Creating a test record...')
      
      // Get a random influencer and campaign to test with
      const testInfluencer = await query(`
        SELECT id, display_name FROM influencers LIMIT 1
      `)
      
      const testCampaign = await query(`
        SELECT id, name FROM campaigns LIMIT 1
      `)
      
      if (testInfluencer.length === 0 || testCampaign.length === 0) {
        console.log('❌ No test data available (need at least one influencer and one campaign)')
        return
      }
      
      console.log(`✅ Using test data: ${testInfluencer[0].display_name} in ${testCampaign[0].name}`)
      
      // Add test content links
      const testContentLinks = [
        'https://www.instagram.com/p/test1/',
        'https://www.tiktok.com/@test/video/123456789'
      ]
      
      await query(`
        INSERT INTO campaign_influencers (campaign_id, influencer_id, content_links, status)
        VALUES ($1, $2, $3::jsonb, 'INVITED')
        ON CONFLICT (campaign_id, influencer_id) 
        DO UPDATE SET content_links = $3::jsonb
      `, [
        testCampaign[0].id,
        testInfluencer[0].id,
        JSON.stringify(testContentLinks)
      ])
      
      console.log('✅ Test content links added')
    }
    
    // Show current analytics for influencers with content links
    for (const ci of campaignInfluencers) {
      console.log(`\n📊 Analytics for ${ci.influencer_name} in ${ci.campaign_name}:`)
      console.log(`   Content Links: ${JSON.stringify(ci.content_links)}`)
      console.log(`   Discount Code: ${ci.discount_code || 'None'}`)
      
      // Get current influencer analytics
      const analytics = await query(`
        SELECT 
          total_views,
          total_likes,
          total_comments,
          total_engagement_rate,
          analytics_updated_at
        FROM influencers 
        WHERE id = $1
      `, [ci.influencer_id])
      
      if (analytics.length > 0) {
        const stats = analytics[0]
        console.log(`   Current Analytics:`)
        console.log(`     Views: ${stats.total_views || 0}`)
        console.log(`     Likes: ${stats.total_likes || 0}`)
        console.log(`     Comments: ${stats.total_comments || 0}`)
        console.log(`     Engagement Rate: ${stats.total_engagement_rate || 0}%`)
        console.log(`     Last Updated: ${stats.analytics_updated_at || 'Never'}`)
      }
    }
    
    console.log('\n✅ Content link analytics test completed')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run test if called directly
if (require.main === module) {
  testContentLinkAnalytics()
}

module.exports = { testContentLinkAnalytics }
