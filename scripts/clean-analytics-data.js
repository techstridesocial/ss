const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

async function cleanAnalyticsData() {
  const sql = neon(process.env.DATABASE_URL)
  
  console.log('🔍 Checking current analytics data...\n')
  
  // 1. Check what's in the influencers table
  console.log('1️⃣ Current influencers analytics:')
  const influencers = await sql`
    SELECT 
      id, 
      display_name,
      total_engagements,
      avg_engagement_rate,
      estimated_reach,
      total_likes,
      total_comments,
      total_views,
      analytics_updated_at
    FROM influencers
    WHERE total_engagements IS NOT NULL 
       OR total_likes IS NOT NULL 
       OR total_comments IS NOT NULL 
       OR total_views IS NOT NULL
    LIMIT 10
  `
  console.table(influencers)
  
  // 2. Check campaign_influencers content_links
  console.log('\n2️⃣ Campaign influencers with content links:')
  const campaignInfluencers = await sql`
    SELECT 
      ci.id,
      ci.campaign_id,
      ci.influencer_id,
      ci.content_links,
      ci.discount_code,
      i.display_name
    FROM campaign_influencers ci
    JOIN influencers i ON ci.influencer_id = i.id
    WHERE ci.content_links IS NOT NULL 
      AND ci.content_links != '[]'
    LIMIT 10
  `
  console.table(campaignInfluencers)
  
  console.log('\n❓ Do you want to:')
  console.log('   A) Reset ALL analytics to 0 (clear all analytics)')
  console.log('   B) Clear only test/bad data (keep real data)')
  console.log('   C) Just show the data (no changes)')
  console.log('\n🔧 Run with argument: node scripts/clean-analytics-data.js [A|B|C]')
  
  const action = process.argv[2]?.toUpperCase()
  
  if (action === 'A') {
    console.log('\n🧹 RESETTING ALL ANALYTICS TO 0...')
    const result = await sql`
      UPDATE influencers
      SET 
        total_engagements = 0,
        avg_engagement_rate = 0,
        estimated_reach = 0,
        total_likes = 0,
        total_comments = 0,
        total_views = 0,
        analytics_updated_at = NULL
      RETURNING id, display_name
    `
    console.log(`✅ Reset ${result.length} influencers' analytics to 0`)
    console.table(result.map(r => ({ id: r.id, name: r.display_name })))
    
    // Also clear content_links
    const contentResult = await sql`
      UPDATE campaign_influencers
      SET content_links = '[]'
      RETURNING id, campaign_id
    `
    console.log(`✅ Cleared ${contentResult.length} content_links`)
    
  } else if (action === 'B') {
    console.log('\n🧹 CLEARING TEST/BAD DATA...')
    console.log('Please specify which influencer IDs or campaign IDs to clean')
    console.log('Modify this script to target specific records')
    
  } else if (action === 'C') {
    console.log('\n👀 Showing data only - no changes made')
  } else {
    console.log('\n⚠️  No action specified. Use A, B, or C as argument.')
  }
  
  console.log('\n✅ Done!')
}

cleanAnalyticsData().catch(console.error)
