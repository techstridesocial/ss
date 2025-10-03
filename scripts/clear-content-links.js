// Script to clear all content links from campaign_influencers table
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

async function clearContentLinks() {
  console.log('🧹 Clearing all content links from database...')
  
  try {
    // First, let's see what we have
    const beforeCount = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
      FROM campaign_influencers
    `)
    
    console.log('📊 Before cleanup:')
    console.log(`   Total campaign_influencer records: ${beforeCount[0].total_records}`)
    console.log(`   Records with content links: ${beforeCount[0].records_with_content_links}`)
    
    if (beforeCount[0].records_with_content_links === 0) {
      console.log('✅ No content links found to clear!')
      return
    }
    
    // Show what we're about to clear
    const contentLinksToClear = await query(`
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
    `)
    
    console.log('\n🗑️ Content links to be cleared:')
    contentLinksToClear.forEach(ci => {
      console.log(`   ${ci.influencer_name} in ${ci.campaign_name}:`)
      console.log(`     Content Links: ${JSON.stringify(ci.content_links)}`)
      console.log(`     Discount Code: ${ci.discount_code || 'None'}`)
    })
    
    // Clear content links (set to empty array)
    const updateResult = await query(`
      UPDATE campaign_influencers 
      SET 
        content_links = '[]'::jsonb,
        discount_code = NULL,
        updated_at = NOW()
      WHERE content_links IS NOT NULL 
        AND content_links != '[]'::jsonb
        AND content_links != 'null'::jsonb
    `)
    
    console.log(`\n✅ Successfully cleared content links from ${updateResult.length || 0} records`)
    
    // Verify cleanup
    const afterCount = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN content_links IS NOT NULL AND content_links != '[]'::jsonb AND content_links != 'null'::jsonb THEN 1 END) as records_with_content_links
      FROM campaign_influencers
    `)
    
    console.log('\n📊 After cleanup:')
    console.log(`   Total campaign_influencer records: ${afterCount[0].total_records}`)
    console.log(`   Records with content links: ${afterCount[0].records_with_content_links}`)
    
    // Also reset any influencer analytics that might be affected
    console.log('\n🔄 Resetting influencer analytics...')
    
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
        analytics_updated_at = NOW()
      WHERE id IN (
        SELECT DISTINCT influencer_id 
        FROM campaign_influencers 
        WHERE updated_at >= NOW() - INTERVAL '1 minute'
      )
    `)
    
    console.log(`✅ Reset analytics for affected influencers`)
    
    console.log('\n🎉 Content links cleanup completed successfully!')
    console.log('   - All content links cleared from campaign_influencers')
    console.log('   - All discount codes cleared')
    console.log('   - Influencer analytics reset to 0')
    
  } catch (error) {
    console.error('❌ Error clearing content links:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run cleanup if called directly
if (require.main === module) {
  clearContentLinks()
    .then(() => {
      console.log('✅ Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { clearContentLinks }
