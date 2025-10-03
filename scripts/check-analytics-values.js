// Script to check actual analytics values in the database
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

async function checkAnalyticsValues() {
  console.log('🔍 Checking analytics values in the database...')
  
  try {
    // Check the specific influencers mentioned in the logs
    const influencers = await query(`
      SELECT 
        id,
        display_name,
        total_engagements,
        total_engagement_rate,
        avg_engagement_rate,
        estimated_reach,
        total_likes,
        total_comments,
        total_views,
        analytics_updated_at
      FROM influencers 
      WHERE display_name IN ('test', 'Kylie Jenner', 'MrBeast', 'Test Creator')
      ORDER BY total_engagements DESC
    `)
    
    console.log('\n📊 Analytics values for campaign influencers:')
    console.log('=' * 80)
    
    influencers.forEach((inf, index) => {
      console.log(`\n${index + 1}. ${inf.display_name} (${inf.id}):`)
      console.log(`   Total Engagements: ${inf.total_engagements}`)
      console.log(`   Total Engagement Rate: ${inf.total_engagement_rate}`)
      console.log(`   Avg Engagement Rate: ${inf.avg_engagement_rate}`)
      console.log(`   Estimated Reach: ${inf.estimated_reach}`)
      console.log(`   Total Likes: ${inf.total_likes}`)
      console.log(`   Total Comments: ${inf.total_comments}`)
      console.log(`   Total Views: ${inf.total_views}`)
      console.log(`   Analytics Updated: ${inf.analytics_updated_at}`)
    })
    
    // Calculate what the frontend would show
    console.log('\n🧮 Frontend Analytics Calculation:')
    console.log('=' * 80)
    
    const totalEngagements = influencers.reduce((sum, inf) => sum + (inf.total_engagements || 0), 0)
    const totalViews = influencers.reduce((sum, inf) => sum + (inf.total_views || 0), 0)
    const totalLikes = influencers.reduce((sum, inf) => sum + (inf.total_likes || 0), 0)
    const totalComments = influencers.reduce((sum, inf) => sum + (inf.total_comments || 0), 0)
    const totalReach = influencers.reduce((sum, inf) => sum + (inf.estimated_reach || 0), 0)
    
    // Average engagement rate (simple average)
    const avgEngagementRate = influencers.length > 0 
      ? influencers.reduce((sum, inf) => sum + (inf.avg_engagement_rate || 0), 0) / influencers.length
      : 0
    
    console.log(`Total Engagements: ${totalEngagements.toLocaleString()}`)
    console.log(`Total Views: ${totalViews.toLocaleString()}`)
    console.log(`Total Likes: ${totalLikes.toLocaleString()}`)
    console.log(`Total Comments: ${totalComments.toLocaleString()}`)
    console.log(`Estimated Reach: ${totalReach.toLocaleString()}`)
    console.log(`Average Engagement Rate: ${(avgEngagementRate * 100).toFixed(2)}%`)
    
    // Check for suspicious values
    console.log('\n🚨 Suspicious Values Check:')
    console.log('=' * 80)
    
    const suspicious = influencers.filter(inf => 
      (inf.total_engagements || 0) > 1000000 || 
      (inf.total_views || 0) > 1000000 || 
      (inf.total_likes || 0) > 1000000 ||
      (inf.total_comments || 0) > 1000000
    )
    
    if (suspicious.length > 0) {
      console.log(`❌ Found ${suspicious.length} influencers with suspiciously high values:`)
      suspicious.forEach(inf => {
        console.log(`   ${inf.display_name}:`)
        if ((inf.total_engagements || 0) > 1000000) console.log(`     - Total Engagements: ${inf.total_engagements}`)
        if ((inf.total_views || 0) > 1000000) console.log(`     - Total Views: ${inf.total_views}`)
        if ((inf.total_likes || 0) > 1000000) console.log(`     - Total Likes: ${inf.total_likes}`)
        if ((inf.total_comments || 0) > 1000000) console.log(`     - Total Comments: ${inf.total_comments}`)
      })
    } else {
      console.log('✅ No suspicious values found - all analytics look reasonable')
    }
    
    // Check content links
    console.log('\n🔗 Content Links Check:')
    console.log('=' * 80)
    
    const contentLinks = await query(`
      SELECT 
        ci.id as campaign_influencer_id,
        i.display_name,
        ci.content_links,
        jsonb_array_length(ci.content_links) as link_count
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.campaign_id = '502a8b9e-d676-4278-a675-dba120c80abc'
        AND ci.content_links IS NOT NULL 
        AND ci.content_links != '[]'::jsonb
    `)
    
    if (contentLinks.length > 0) {
      console.log(`📋 Found ${contentLinks.length} influencers with content links:`)
      contentLinks.forEach(link => {
        console.log(`   ${link.display_name}: ${link.link_count} links`)
        console.log(`     Links: ${JSON.stringify(link.content_links, null, 2)}`)
      })
    } else {
      console.log('📋 No content links found for this campaign')
    }
    
  } catch (error) {
    console.error('❌ Error checking analytics values:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run check if called directly
if (require.main === module) {
  checkAnalyticsValues()
    .then(() => {
      console.log('\n✅ Analytics check completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Analytics check failed:', error)
      process.exit(1)
    })
}

module.exports = { checkAnalyticsValues }
