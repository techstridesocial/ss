// Complete Analytics Reset Script
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

async function resetAllAnalytics() {
  console.log('🔄 COMPLETE ANALYTICS RESET STARTING...')
  console.log('=' * 80)
  console.log('⚠️  This will reset ALL analytics to 0 and clear ALL content links!')
  console.log('=' * 80)
  
  try {
    // 1. Reset all influencer analytics to 0
    console.log('\n📊 Step 1: Resetting all influencer analytics to 0...')
    
    const influencerReset = await query(`
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
      WHERE total_engagements > 0 
         OR total_views > 0 
         OR total_likes > 0 
         OR total_comments > 0
         OR avg_engagement_rate > 0
    `)
    
    const influencerCount = await query(`
      SELECT COUNT(*) as count
      FROM influencers 
      WHERE analytics_updated_at >= NOW() - INTERVAL '1 minute'
    `)
    
    console.log(`✅ Reset analytics for ${influencerCount[0].count} influencers`)
    
    // 2. Reset all platform analytics to 0
    console.log('\n🏷️  Step 2: Resetting all platform analytics to 0...')
    
    const platformReset = await query(`
      UPDATE influencer_platforms 
      SET 
        avg_views = 0,
        engagement_rate = 0,
        last_synced = NOW()
      WHERE avg_views > 0 OR engagement_rate > 0
    `)
    
    const platformCount = await query(`
      SELECT COUNT(*) as count
      FROM influencer_platforms 
      WHERE last_synced >= NOW() - INTERVAL '1 minute'
    `)
    
    console.log(`✅ Reset analytics for ${platformCount[0].count} platform records`)
    
    // 3. Clear all content links from campaign_influencers
    console.log('\n🔗 Step 3: Clearing all content links from campaign_influencers...')
    
    const campaignInfluencerReset = await query(`
      UPDATE campaign_influencers 
      SET 
        content_links = '[]'::jsonb,
        discount_code = NULL,
        updated_at = NOW()
      WHERE content_links IS NOT NULL 
        AND content_links != '[]'::jsonb
    `)
    
    const campaignInfluencerCount = await query(`
      SELECT COUNT(*) as count
      FROM campaign_influencers 
      WHERE updated_at >= NOW() - INTERVAL '1 minute'
    `)
    
    console.log(`✅ Cleared content links for ${campaignInfluencerCount[0].count} campaign influencers`)
    
    // 4. Clear all content links from campaign_content_submissions
    console.log('\n📝 Step 4: Clearing all content links from campaign_content_submissions...')
    
    const submissionReset = await query(`
      UPDATE campaign_content_submissions 
      SET 
        content_url = '',
        views = 0,
        likes = 0,
        comments = 0,
        shares = 0,
        saves = 0,
        updated_at = NOW()
      WHERE content_url != '' 
         OR views > 0 
         OR likes > 0 
         OR comments > 0 
         OR shares > 0 
         OR saves > 0
    `)
    
    const submissionCount = await query(`
      SELECT COUNT(*) as count
      FROM campaign_content_submissions 
      WHERE updated_at >= NOW() - INTERVAL '1 minute'
    `)
    
    console.log(`✅ Cleared content submissions for ${submissionCount[0].count} records`)
    
    // 5. Clear all content links from influencer_content
    console.log('\n🎬 Step 5: Clearing all content links from influencer_content...')
    
    const contentReset = await query(`
      UPDATE influencer_content 
      SET 
        post_url = '',
        views = 0,
        likes = 0,
        comments = 0,
        shares = 0
      WHERE post_url != '' 
         OR views > 0 
         OR likes > 0 
         OR comments > 0 
         OR shares > 0
    `)
    
    const contentCount = await query(`
      SELECT COUNT(*) as count
      FROM influencer_content 
      WHERE post_url = '' AND views = 0 AND likes = 0 AND comments = 0 AND shares = 0
    `)
    
    console.log(`✅ Cleared influencer content for ${contentCount[0].count} records`)
    
    // 6. Verification
    console.log('\n🔍 Step 6: Verifying reset...')
    
    const verification = await Promise.all([
      query(`SELECT COUNT(*) as count FROM influencers WHERE total_engagements > 0`),
      query(`SELECT COUNT(*) as count FROM influencers WHERE total_views > 0`),
      query(`SELECT COUNT(*) as count FROM influencers WHERE total_likes > 0`),
      query(`SELECT COUNT(*) as count FROM campaign_influencers WHERE content_links != '[]'::jsonb`),
      query(`SELECT COUNT(*) as count FROM campaign_content_submissions WHERE content_url != ''`),
      query(`SELECT COUNT(*) as count FROM influencer_content WHERE post_url != ''`)
    ])
    
    const [
      influencersWithEngagements,
      influencersWithViews,
      influencersWithLikes,
      campaignInfluencersWithLinks,
      submissionsWithUrls,
      contentWithUrls
    ] = verification
    
    console.log('\n📋 Verification Results:')
    console.log(`   Influencers with engagements > 0: ${influencersWithEngagements[0].count}`)
    console.log(`   Influencers with views > 0: ${influencersWithViews[0].count}`)
    console.log(`   Influencers with likes > 0: ${influencersWithLikes[0].count}`)
    console.log(`   Campaign influencers with content links: ${campaignInfluencersWithLinks[0].count}`)
    console.log(`   Content submissions with URLs: ${submissionsWithUrls[0].count}`)
    console.log(`   Influencer content with URLs: ${contentWithUrls[0].count}`)
    
    // Check if everything is clean
    const allClean = verification.every(result => result[0].count === 0)
    
    if (allClean) {
      console.log('\n🎉 SUCCESS: All analytics reset to 0 and all content links cleared!')
      console.log('   ✅ No influencers have engagements > 0')
      console.log('   ✅ No influencers have views > 0')
      console.log('   ✅ No influencers have likes > 0')
      console.log('   ✅ No campaign influencers have content links')
      console.log('   ✅ No content submissions have URLs')
      console.log('   ✅ No influencer content has URLs')
    } else {
      console.log('\n⚠️  WARNING: Some data still remains - check the verification results above')
    }
    
    // 7. Final summary
    console.log('\n📊 Final Summary:')
    console.log('=' * 50)
    console.log(`✅ Reset ${influencerCount[0].count} influencer analytics to 0`)
    console.log(`✅ Reset ${platformCount[0].count} platform analytics to 0`)
    console.log(`✅ Cleared content links for ${campaignInfluencerCount[0].count} campaign influencers`)
    console.log(`✅ Cleared content submissions for ${submissionCount[0].count} records`)
    console.log(`✅ Cleared influencer content for ${contentCount[0].count} records`)
    console.log('\n🚀 Analytics system is now completely clean and ready for fresh data!')
    
  } catch (error) {
    console.error('❌ Error during analytics reset:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run reset if called directly
if (require.main === module) {
  resetAllAnalytics()
    .then(() => {
      console.log('\n✅ Analytics reset completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Analytics reset failed:', error)
      process.exit(1)
    })
}

module.exports = { resetAllAnalytics }
