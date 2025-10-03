// Manual analytics update script
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

async function manualAnalyticsUpdate() {
  console.log('🔧 Manual Analytics Update...')
  console.log('=' * 50)
  
  try {
    // Find the influencer with content links
    const influencerWithLink = await query(`
      SELECT 
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
    console.log(`\n📋 Found influencer: ${influencer.display_name}`)
    console.log(`   Influencer ID: ${influencer.influencer_id}`)
    console.log(`   Content Links: ${JSON.stringify(influencer.content_links)}`)
    
    // Based on the Modash API response we got:
    // - 104 likes
    // - 9 comments  
    // - 2,932 views/plays
    // - Instagram platform
    
    const totalLikes = 104
    const totalComments = 9
    const totalViews = 2932
    const totalEngagements = totalLikes + totalComments // 113
    const estimatedReach = totalViews // Use views as reach estimate
    const avgEngagementRate = totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0 // 3.85%
    
    console.log('\n📊 Calculated Analytics:')
    console.log(`   Total Engagements: ${totalEngagements}`)
    console.log(`   Total Views: ${totalViews}`)
    console.log(`   Total Likes: ${totalLikes}`)
    console.log(`   Total Comments: ${totalComments}`)
    console.log(`   Estimated Reach: ${estimatedReach}`)
    console.log(`   Engagement Rate: ${avgEngagementRate.toFixed(2)}%`)
    
    // Update the influencer analytics in the database
    console.log('\n💾 Updating database...')
    
    const updateResult = await query(`
      UPDATE influencers 
      SET 
        total_engagements = $2,
        total_views = $3,
        total_likes = $4,
        total_comments = $5,
        estimated_reach = $6,
        avg_engagement_rate = $7,
        analytics_updated_at = NOW()
      WHERE id = $1
    `, [
      influencer.influencer_id,
      totalEngagements,
      totalViews,
      totalLikes,
      totalComments,
      estimatedReach,
      avgEngagementRate / 100 // Convert percentage to decimal
    ])
    
    console.log('✅ Database updated successfully!')
    
    // Verify the update
    const verification = await query(`
      SELECT 
        total_engagements,
        total_views,
        total_likes,
        total_comments,
        estimated_reach,
        avg_engagement_rate,
        analytics_updated_at
      FROM influencers 
      WHERE id = $1
    `, [influencer.influencer_id])
    
    const analytics = verification[0]
    console.log('\n✅ Verification - Updated Analytics:')
    console.log(`   Total Engagements: ${analytics.total_engagements}`)
    console.log(`   Total Views: ${analytics.total_views}`)
    console.log(`   Total Likes: ${analytics.total_likes}`)
    console.log(`   Total Comments: ${analytics.total_comments}`)
    console.log(`   Estimated Reach: ${analytics.estimated_reach}`)
    console.log(`   Avg Engagement Rate: ${(analytics.avg_engagement_rate * 100).toFixed(2)}%`)
    console.log(`   Analytics Updated: ${analytics.analytics_updated_at}`)
    
    console.log('\n🎉 SUCCESS: Analytics manually updated!')
    console.log('   The frontend should now show the correct analytics.')
    
  } catch (error) {
    console.error('❌ Error updating analytics:', error)
  } finally {
    await pool.end()
  }
}

// Run update if called directly
if (require.main === module) {
  manualAnalyticsUpdate()
    .then(() => {
      console.log('\n✅ Manual update completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Manual update failed:', error)
      process.exit(1)
    })
}

module.exports = { manualAnalyticsUpdate }
