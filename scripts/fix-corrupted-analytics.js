// Script to fix corrupted analytics data
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

async function fixCorruptedAnalytics() {
  console.log('🔧 Fixing corrupted analytics data...')
  
  try {
    // First, let's see what we're dealing with
    console.log('\n📊 Current analytics state:')
    
    const analyticsCheck = await query(`
      SELECT 
        id,
        display_name,
        total_engagements,
        total_engagement_rate,
        total_views,
        total_likes,
        total_comments,
        avg_engagement_rate,
        estimated_reach,
        analytics_updated_at
      FROM influencers 
      WHERE total_engagements > 1000000 OR total_views > 1000000 OR total_likes > 1000000
      ORDER BY total_engagements DESC
      LIMIT 10
    `)
    
    console.log('🚨 Influencers with suspiciously high analytics:')
    analyticsCheck.forEach(inf => {
      console.log(`  ${inf.display_name}:`)
      console.log(`    Engagements: ${inf.total_engagements}`)
      console.log(`    Views: ${inf.total_views}`)
      console.log(`    Likes: ${inf.total_likes}`)
      console.log(`    Comments: ${inf.total_comments}`)
      console.log(`    ER: ${inf.total_engagement_rate}%`)
    })
    
    if (analyticsCheck.length === 0) {
      console.log('✅ No corrupted analytics found!')
      return
    }
    
    console.log(`\n🗑️ Found ${analyticsCheck.length} influencers with corrupted analytics`)
    
    // Reset all corrupted analytics to 0
    console.log('\n🔄 Resetting corrupted analytics to 0...')
    
    const resetResult = await query(`
      UPDATE influencers 
      SET 
        total_engagements = 0,
        total_engagement_rate = 0,
        avg_engagement_rate = 0,
        estimated_reach = 0,
        total_likes = 0,
        total_comments = 0,
        total_views = 0,
        total_avg_views = 0,
        estimated_promotion_views = 0,
        analytics_updated_at = NOW()
      WHERE total_engagements > 1000000 OR total_views > 1000000 OR total_likes > 1000000
    `)
    
    console.log(`✅ Reset analytics for ${resetResult.length || 0} influencers`)
    
    // Also reset platform-specific analytics
    await query(`
      UPDATE influencer_platforms 
      SET 
        avg_views = 0,
        engagement_rate = 0,
        last_synced = NOW()
      WHERE influencer_id IN (
        SELECT id FROM influencers 
        WHERE analytics_updated_at >= NOW() - INTERVAL '1 minute'
      )
    `)
    
    // Clear any corrupted content links data
    console.log('\n🧹 Clearing potentially corrupted content links...')
    
    await query(`
      UPDATE campaign_influencers 
      SET 
        content_links = '[]'::jsonb,
        updated_at = NOW()
      WHERE content_links IS NOT NULL 
        AND content_links != '[]'::jsonb
    `)
    
    await query(`
      UPDATE campaign_content_submissions 
      SET 
        content_url = '',
        views = 0,
        likes = 0,
        comments = 0,
        shares = 0,
        saves = 0,
        updated_at = NOW()
      WHERE views > 1000000 OR likes > 1000000 OR comments > 1000000
    `)
    
    await query(`
      UPDATE influencer_content 
      SET 
        post_url = '',
        views = 0,
        likes = 0,
        comments = 0,
        shares = 0,
        updated_at = NOW()
      WHERE views > 1000000 OR likes > 1000000 OR comments > 1000000
    `)
    
    // Verify the fix
    console.log('\n✅ Verification:')
    
    const verificationCheck = await query(`
      SELECT 
        COUNT(*) as total_influencers,
        COUNT(CASE WHEN total_engagements > 0 THEN 1 END) as with_engagements,
        COUNT(CASE WHEN total_views > 0 THEN 1 END) as with_views,
        COUNT(CASE WHEN total_likes > 0 THEN 1 END) as with_likes
      FROM influencers
    `)
    
    console.log('📊 After cleanup:')
    console.log(`  Total influencers: ${verificationCheck[0].total_influencers}`)
    console.log(`  With engagements: ${verificationCheck[0].with_engagements}`)
    console.log(`  With views: ${verificationCheck[0].with_views}`)
    console.log(`  With likes: ${verificationCheck[0].with_likes}`)
    
    console.log('\n🎉 Analytics corruption fix completed!')
    console.log('   - All corrupted analytics reset to 0')
    console.log('   - Content links cleared')
    console.log('   - Platform analytics reset')
    console.log('   - Database is now clean and ready for fresh data')
    
  } catch (error) {
    console.error('❌ Error fixing corrupted analytics:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run fix if called directly
if (require.main === module) {
  fixCorruptedAnalytics()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { fixCorruptedAnalytics }
