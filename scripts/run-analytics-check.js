// Run analytics check using Node.js
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

async function runAnalyticsCheck() {
  console.log('🔍 Running Analytics Check...')
  console.log('=' * 80)
  
  try {
    // 1. Check specific campaign influencers
    console.log('\n📊 CAMPAIGN INFLUENCERS ANALYTICS:')
    console.log('-' * 50)
    
    const influencers = await query(`
      SELECT 
        i.id,
        i.display_name,
        i.total_engagements,
        i.total_engagement_rate,
        i.avg_engagement_rate,
        i.estimated_reach,
        i.total_likes,
        i.total_comments,
        i.total_views,
        i.analytics_updated_at
      FROM influencers i
      WHERE i.display_name IN ('test', 'Kylie Jenner', 'MrBeast', 'Test Creator')
      ORDER BY i.total_engagements DESC
    `)
    
    influencers.forEach((inf, index) => {
      console.log(`\n${index + 1}. ${inf.display_name} (${inf.id}):`)
      console.log(`   Total Engagements: ${inf.total_engagements?.toLocaleString() || 0}`)
      console.log(`   Total Engagement Rate: ${inf.total_engagement_rate || 0}`)
      console.log(`   Avg Engagement Rate: ${inf.avg_engagement_rate || 0}`)
      console.log(`   Estimated Reach: ${inf.estimated_reach?.toLocaleString() || 0}`)
      console.log(`   Total Likes: ${inf.total_likes?.toLocaleString() || 0}`)
      console.log(`   Total Comments: ${inf.total_comments?.toLocaleString() || 0}`)
      console.log(`   Total Views: ${inf.total_views?.toLocaleString() || 0}`)
      console.log(`   Analytics Updated: ${inf.analytics_updated_at || 'Never'}`)
    })
    
    // 2. Calculate frontend totals
    console.log('\n\n🧮 FRONTEND CALCULATION TOTALS:')
    console.log('-' * 50)
    
    const totals = await query(`
      SELECT 
        SUM(i.total_engagements) as total_engagements,
        SUM(i.total_views) as total_views,
        SUM(i.total_likes) as total_likes,
        SUM(i.total_comments) as total_comments,
        SUM(i.estimated_reach) as total_reach,
        AVG(i.avg_engagement_rate) as avg_engagement_rate,
        COUNT(*) as influencer_count
      FROM influencers i
      WHERE i.display_name IN ('test', 'Kylie Jenner', 'MrBeast', 'Test Creator')
    `)
    
    const total = totals[0]
    console.log(`Total Engagements: ${total.total_engagements?.toLocaleString() || 0}`)
    console.log(`Total Views: ${total.total_views?.toLocaleString() || 0}`)
    console.log(`Total Likes: ${total.total_likes?.toLocaleString() || 0}`)
    console.log(`Total Comments: ${total.total_comments?.toLocaleString() || 0}`)
    console.log(`Estimated Reach: ${total.total_reach?.toLocaleString() || 0}`)
    console.log(`Average Engagement Rate: ${((total.avg_engagement_rate || 0) * 100).toFixed(2)}%`)
    console.log(`Influencer Count: ${total.influencer_count}`)
    
    // 3. Check for suspicious values
    console.log('\n\n🚨 SUSPICIOUS VALUES CHECK:')
    console.log('-' * 50)
    
    const suspiciousChecks = await Promise.all([
      query(`SELECT COUNT(*) as count FROM influencers WHERE total_engagements > 1000000`),
      query(`SELECT COUNT(*) as count FROM influencers WHERE total_views > 1000000`),
      query(`SELECT COUNT(*) as count FROM influencers WHERE total_likes > 1000000`),
      query(`SELECT COUNT(*) as count FROM influencers WHERE total_comments > 1000000`)
    ])
    
    console.log(`Influencers with high engagements (>1M): ${suspiciousChecks[0][0].count}`)
    console.log(`Influencers with high views (>1M): ${suspiciousChecks[1][0].count}`)
    console.log(`Influencers with high likes (>1M): ${suspiciousChecks[2][0].count}`)
    console.log(`Influencers with high comments (>1M): ${suspiciousChecks[3][0].count}`)
    
    // 4. Show specific suspicious records
    console.log('\n\n🔍 SPECIFIC SUSPICIOUS RECORDS:')
    console.log('-' * 50)
    
    const suspicious = await query(`
      SELECT 
        id,
        display_name,
        total_engagements,
        total_views,
        total_likes,
        total_comments,
        avg_engagement_rate,
        analytics_updated_at
      FROM influencers 
      WHERE total_engagements > 1000000 
         OR total_views > 1000000 
         OR total_likes > 1000000 
         OR total_comments > 1000000
      ORDER BY total_engagements DESC
    `)
    
    if (suspicious.length > 0) {
      console.log(`Found ${suspicious.length} suspicious records:`)
      suspicious.forEach((inf, index) => {
        console.log(`\n${index + 1}. ${inf.display_name}:`)
        if ((inf.total_engagements || 0) > 1000000) console.log(`   - Total Engagements: ${inf.total_engagements?.toLocaleString()}`)
        if ((inf.total_views || 0) > 1000000) console.log(`   - Total Views: ${inf.total_views?.toLocaleString()}`)
        if ((inf.total_likes || 0) > 1000000) console.log(`   - Total Likes: ${inf.total_likes?.toLocaleString()}`)
        if ((inf.total_comments || 0) > 1000000) console.log(`   - Total Comments: ${inf.total_comments?.toLocaleString()}`)
        console.log(`   - Analytics Updated: ${inf.analytics_updated_at}`)
      })
    } else {
      console.log('✅ No suspicious values found!')
    }
    
    // 5. Check content links
    console.log('\n\n🔗 CONTENT LINKS CHECK:')
    console.log('-' * 50)
    
    const contentLinks = await query(`
      SELECT 
        ci.id as campaign_influencer_id,
        i.display_name,
        ci.content_links,
        jsonb_array_length(ci.content_links) as link_count,
        ci.updated_at
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.campaign_id = '502a8b9e-d676-4278-a675-dba120c80abc'
      ORDER BY i.display_name
    `)
    
    if (contentLinks.length > 0) {
      console.log(`Found ${contentLinks.length} campaign influencer records:`)
      contentLinks.forEach(link => {
        console.log(`\n${link.display_name}:`)
        console.log(`   - Campaign Influencer ID: ${link.campaign_influencer_id}`)
        console.log(`   - Content Links: ${link.link_count} links`)
        console.log(`   - Links: ${JSON.stringify(link.content_links, null, 2)}`)
        console.log(`   - Updated: ${link.updated_at}`)
      })
    } else {
      console.log('❌ No campaign influencer records found!')
    }
    
    // 6. All influencers analytics summary
    console.log('\n\n📈 ALL INFLUENCERS ANALYTICS SUMMARY:')
    console.log('-' * 50)
    
    const summary = await query(`
      SELECT 
        COUNT(*) as total_influencers,
        COUNT(CASE WHEN total_engagements > 0 THEN 1 END) as with_engagements,
        COUNT(CASE WHEN total_views > 0 THEN 1 END) as with_views,
        COUNT(CASE WHEN total_likes > 0 THEN 1 END) as with_likes,
        COUNT(CASE WHEN total_comments > 0 THEN 1 END) as with_comments,
        MAX(total_engagements) as max_engagements,
        MAX(total_views) as max_views,
        MAX(total_likes) as max_likes,
        MAX(total_comments) as max_comments,
        AVG(avg_engagement_rate) as avg_er_rate
      FROM influencers
    `)
    
    const sum = summary[0]
    console.log(`Total Influencers: ${sum.total_influencers}`)
    console.log(`With Engagements: ${sum.with_engagements}`)
    console.log(`With Views: ${sum.with_views}`)
    console.log(`With Likes: ${sum.with_likes}`)
    console.log(`With Comments: ${sum.with_comments}`)
    console.log(`Max Engagements: ${sum.max_engagements?.toLocaleString() || 0}`)
    console.log(`Max Views: ${sum.max_views?.toLocaleString() || 0}`)
    console.log(`Max Likes: ${sum.max_likes?.toLocaleString() || 0}`)
    console.log(`Max Comments: ${sum.max_comments?.toLocaleString() || 0}`)
    console.log(`Average ER Rate: ${((sum.avg_er_rate || 0) * 100).toFixed(2)}%`)
    
    // 7. Recent analytics updates
    console.log('\n\n⏰ RECENT ANALYTICS UPDATES:')
    console.log('-' * 50)
    
    const recent = await query(`
      SELECT 
        display_name,
        total_engagements,
        total_views,
        analytics_updated_at
      FROM influencers 
      WHERE analytics_updated_at >= NOW() - INTERVAL '24 hours'
      ORDER BY analytics_updated_at DESC
    `)
    
    if (recent.length > 0) {
      console.log(`Found ${recent.length} influencers updated in last 24 hours:`)
      recent.forEach(inf => {
        console.log(`   ${inf.display_name}: ${inf.total_engagements?.toLocaleString() || 0} engagements, updated ${inf.analytics_updated_at}`)
      })
    } else {
      console.log('No analytics updates in the last 24 hours')
    }
    
    console.log('\n\n✅ Analytics check completed!')
    
  } catch (error) {
    console.error('❌ Error running analytics check:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run check if called directly
if (require.main === module) {
  runAnalyticsCheck()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { runAnalyticsCheck }
