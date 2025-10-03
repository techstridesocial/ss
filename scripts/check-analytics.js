const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function checkAnalytics() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Checking current analytics in database...')
    
    const result = await client.query(`
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
      ORDER BY updated_at DESC 
      LIMIT 5
    `)
    
    console.log(`Found ${result.rows.length} influencers:`)
    result.rows.forEach(row => {
      console.log(`\n👤 Influencer ${row.id} (${row.display_name}):`)
      console.log(`  - total_engagements: ${row.total_engagements}`)
      console.log(`  - avg_engagement_rate: ${row.avg_engagement_rate}`)
      console.log(`  - estimated_reach: ${row.estimated_reach}`)
      console.log(`  - total_likes: ${row.total_likes}`)
      console.log(`  - total_comments: ${row.total_comments}`)
      console.log(`  - total_views: ${row.total_views}`)
      console.log(`  - analytics_updated_at: ${row.analytics_updated_at}`)
    })
    
    // Also check campaign_influencers content_links
    const contentLinksResult = await client.query(`
      SELECT 
        ci.id,
        ci.influencer_id,
        ci.content_links,
        i.display_name
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.content_links != '[]'::jsonb
      ORDER BY ci.updated_at DESC
      LIMIT 5
    `)
    
    console.log(`\n📋 Found ${contentLinksResult.rows.length} campaign influencers with content links:`)
    contentLinksResult.rows.forEach(row => {
      console.log(`\n🔗 Campaign Influencer ${row.id} (${row.display_name}):`)
      console.log(`  - content_links: ${JSON.stringify(row.content_links)}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking analytics:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

checkAnalytics()
