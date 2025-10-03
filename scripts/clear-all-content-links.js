const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function clearAllContentLinks() {
  const client = await pool.connect()
  
  try {
    console.log('🧹 Starting to clear all content links from database...')
    
    // Step 1: Clear all content_links from campaign_influencers table
    const clearContentLinks = await client.query(`
      UPDATE campaign_influencers 
      SET content_links = '[]'::jsonb
      WHERE content_links IS NOT NULL AND content_links != '[]'::jsonb
    `)
    
    console.log(`✅ Cleared content links from ${clearContentLinks.rowCount} campaign influencers`)
    
    // Step 2: Reset all analytics to 0 for all influencers
    const resetAnalytics = await client.query(`
      UPDATE influencers 
      SET 
        total_engagements = 0,
        avg_engagement_rate = 0,
        estimated_reach = 0,
        total_likes = 0,
        total_comments = 0,
        total_views = 0,
        analytics_updated_at = NOW()
      WHERE 
        total_engagements > 0 
        OR avg_engagement_rate > 0 
        OR estimated_reach > 0 
        OR total_likes > 0 
        OR total_comments > 0 
        OR total_views > 0
    `)
    
    console.log(`✅ Reset analytics to 0 for ${resetAnalytics.rowCount} influencers`)
    
    // Step 3: Verify the cleanup
    const verifyContentLinks = await client.query(`
      SELECT COUNT(*) as count 
      FROM campaign_influencers 
      WHERE content_links != '[]'::jsonb
    `)
    
    const verifyAnalytics = await client.query(`
      SELECT COUNT(*) as count 
      FROM influencers 
      WHERE 
        total_engagements > 0 
        OR avg_engagement_rate > 0 
        OR estimated_reach > 0 
        OR total_likes > 0 
        OR total_comments > 0 
        OR total_views > 0
    `)
    
    console.log('\n📊 Cleanup Summary:')
    console.log(`- Campaign influencers with content links: ${verifyContentLinks.rows[0].count}`)
    console.log(`- Influencers with non-zero analytics: ${verifyAnalytics.rows[0].count}`)
    
    if (verifyContentLinks.rows[0].count === '0' && verifyAnalytics.rows[0].count === '0') {
      console.log('\n🎉 SUCCESS: All content links and analytics have been cleared!')
    } else {
      console.log('\n⚠️  WARNING: Some data may still remain. Check the counts above.')
    }
    
  } catch (error) {
    console.error('❌ Error clearing content links:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the cleanup
clearAllContentLinks()
  .then(() => {
    console.log('\n✅ Content links cleanup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Content links cleanup failed:', error)
    process.exit(1)
  })
