/**
 * Check Influencer Platform Usernames
 * Analyzes which influencers have social media handles linked
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

async function checkPlatformUsernames() {
  let pool
  
  try {
    console.log('🔍 Checking influencer platform usernames...\n')
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found in environment')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    // Helper function to query
    const query = async (text, params) => {
      const result = await pool.query(text, params)
      return result.rows
    }

    // Get total influencers

    // Get total influencers
    const totalInfluencers = await query(`
      SELECT COUNT(*) as count
      FROM influencers
    `)
    console.log(`📊 Total Influencers: ${totalInfluencers[0].count}`)

    // Get influencers with platforms
    const influencersWithPlatforms = await query(`
      SELECT 
        i.id,
        i.display_name,
        COUNT(ip.id) as platform_count,
        COUNT(CASE WHEN ip.username IS NOT NULL AND ip.username != '' THEN 1 END) as platforms_with_username,
        COUNT(CASE WHEN ip.username IS NULL OR ip.username = '' THEN 1 END) as platforms_without_username,
        array_agg(DISTINCT ip.platform) FILTER (WHERE ip.platform IS NOT NULL) as platforms,
        array_agg(DISTINCT ip.platform) FILTER (WHERE ip.username IS NOT NULL AND ip.username != '') as platforms_with_username_list,
        array_agg(DISTINCT ip.platform) FILTER (WHERE ip.username IS NULL OR ip.username = '') as platforms_without_username_list
      FROM influencers i
      LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
      GROUP BY i.id, i.display_name
      HAVING COUNT(ip.id) > 0
      ORDER BY i.display_name
    `)

    console.log(`\n📱 Influencers with Platforms: ${influencersWithPlatforms.length}`)

    // Detailed breakdown
    let totalPlatforms = 0
    let totalWithUsernames = 0
    let totalWithoutUsernames = 0
    const platformBreakdown = {
      INSTAGRAM: { total: 0, with_username: 0, without_username: 0 },
      TIKTOK: { total: 0, with_username: 0, without_username: 0 },
      YOUTUBE: { total: 0, with_username: 0, without_username: 0 }
    }

    const missingUsernames = []

    for (const influencer of influencersWithPlatforms) {
      totalPlatforms += parseInt(influencer.platform_count) || 0
      totalWithUsernames += parseInt(influencer.platforms_with_username) || 0
      totalWithoutUsernames += parseInt(influencer.platforms_without_username) || 0

      // Track platforms without usernames
      if (influencer.platforms_without_username > 0) {
        missingUsernames.push({
          id: influencer.id,
          display_name: influencer.display_name,
          platforms: influencer.platforms,
          missing_for: influencer.platforms_without_username_list || [],
          has_username_for: influencer.platforms_with_username_list || []
        })
      }

      // Count by platform type
      // PostgreSQL arrays come as strings or arrays, normalize them
      const parseArray = (arr) => {
        if (!arr) return []
        if (Array.isArray(arr)) return arr
        if (typeof arr === 'string') {
          // Handle PostgreSQL array format: "{INSTAGRAM,TIKTOK}" or "{}"
          const cleaned = arr.replace(/^{|}$/g, '')
          return cleaned ? cleaned.split(',').map(s => s.trim()) : []
        }
        return []
      }

      const platforms = parseArray(influencer.platforms)
      const withUsernames = parseArray(influencer.platforms_with_username_list)
      const withoutUsernames = parseArray(influencer.platforms_without_username_list)

      platforms.forEach(platform => {
        if (platformBreakdown[platform]) {
          platformBreakdown[platform].total++
          if (withUsernames.includes(platform)) {
            platformBreakdown[platform].with_username++
          }
          if (withoutUsernames.includes(platform)) {
            platformBreakdown[platform].without_username++
          }
        }
      })
    }

    console.log(`\n📊 Platform Statistics:`)
    console.log(`   Total Platforms: ${totalPlatforms}`)
    console.log(`   With Usernames: ${totalWithUsernames} (${((totalWithUsernames / totalPlatforms) * 100).toFixed(1)}%)`)
    console.log(`   Without Usernames: ${totalWithoutUsernames} (${((totalWithoutUsernames / totalPlatforms) * 100).toFixed(1)}%)`)

    console.log(`\n📱 Breakdown by Platform:`)
    for (const [platform, stats] of Object.entries(platformBreakdown)) {
      if (stats.total > 0) {
        console.log(`\n   ${platform}:`)
        console.log(`     Total: ${stats.total}`)
        console.log(`     With Username: ${stats.with_username} (${((stats.with_username / stats.total) * 100).toFixed(1)}%)`)
        console.log(`     Without Username: ${stats.without_username} (${((stats.without_username / stats.total) * 100).toFixed(1)}%)`)
      }
    }

    // Show influencers missing usernames
    if (missingUsernames.length > 0) {
      console.log(`\n⚠️  Influencers Missing Usernames: ${missingUsernames.length}`)
      console.log(`\n📋 Details:\n`)
      
      missingUsernames.slice(0, 20).forEach(inf => {
        console.log(`   • ${inf.display_name} (${inf.id})`)
        console.log(`     Platforms: ${(inf.platforms || []).join(', ') || 'None'}`)
        console.log(`     ✅ Has username for: ${(inf.has_username_for || []).join(', ') || 'None'}`)
        console.log(`     ❌ Missing username for: ${(inf.missing_for || []).join(', ') || 'None'}`)
        console.log('')
      })

      if (missingUsernames.length > 20) {
        console.log(`   ... and ${missingUsernames.length - 20} more`)
      }
    } else {
      console.log(`\n✅ All influencers with platforms have usernames!`)
    }

    // Check for invalid userIds (UUIDs) stored in notes
    console.log(`\n🔍 Checking for Invalid UserIds (UUIDs) in Notes...\n`)
    
    const influencersWithNotes = await query(`
      SELECT 
        i.id,
        i.display_name,
        i.notes
      FROM influencers i
      WHERE i.notes IS NOT NULL 
        AND i.notes != '' 
        AND i.notes != '{}'
        AND i.notes::text LIKE '%modash_data%'
      ORDER BY i.display_name
    `)

    const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    const influencersWithUUIDs = []

    for (const influencer of influencersWithNotes) {
      try {
        const notes = typeof influencer.notes === 'string' 
          ? JSON.parse(influencer.notes) 
          : influencer.notes

        const modashData = notes?.modash_data
        if (!modashData) continue

        // Check platform-specific userIds
        const platforms = modashData.platforms || {}
        for (const [platform, platformData] of Object.entries(platforms)) {
          if (platformData?.userId && uuidPattern.test(platformData.userId)) {
            influencersWithUUIDs.push({
              id: influencer.id,
              display_name: influencer.display_name,
              platform,
              invalid_userId: platformData.userId,
              type: 'platform-specific'
            })
          }
        }

        // Check legacy userId
        if (modashData.userId && uuidPattern.test(modashData.userId)) {
          influencersWithUUIDs.push({
            id: influencer.id,
            display_name: influencer.display_name,
            platform: modashData.platform || 'unknown',
            invalid_userId: modashData.userId,
            type: 'legacy'
          })
        }

        if (modashData.modash_user_id && uuidPattern.test(modashData.modash_user_id)) {
          influencersWithUUIDs.push({
            id: influencer.id,
            display_name: influencer.display_name,
            platform: modashData.platform || 'unknown',
            invalid_userId: modashData.modash_user_id,
            type: 'legacy-modash_user_id'
          })
        }
      } catch (err) {
        console.warn(`⚠️  Failed to parse notes for ${influencer.display_name}:`, err.message)
      }
    }

    if (influencersWithUUIDs.length > 0) {
      console.log(`❌ Found ${influencersWithUUIDs.length} influencers with UUIDs stored as Modash userIds:\n`)
      influencersWithUUIDs.slice(0, 10).forEach(inf => {
        console.log(`   • ${inf.display_name} (${inf.id})`)
        console.log(`     Platform: ${inf.platform}`)
        console.log(`     Type: ${inf.type}`)
        console.log(`     Invalid userId: ${inf.invalid_userId}`)
        console.log('')
      })

      if (influencersWithUUIDs.length > 10) {
        console.log(`   ... and ${influencersWithUUIDs.length - 10} more`)
      }

      console.log(`\n💡 These will be automatically fixed when analytics are fetched (will fallback to username search)`)
    } else {
      console.log(`✅ No UUIDs found stored as Modash userIds`)
    }

    // Summary
    console.log(`\n\n📊 SUMMARY:`)
    console.log(`   Total Influencers: ${totalInfluencers[0].count}`)
    console.log(`   Influencers with Platforms: ${influencersWithPlatforms.length}`)
    console.log(`   Total Platforms: ${totalPlatforms}`)
    console.log(`   Platforms with Usernames: ${totalWithUsernames} (${((totalWithUsernames / totalPlatforms) * 100).toFixed(1)}%)`)
    console.log(`   Platforms without Usernames: ${totalWithoutUsernames} (${((totalWithoutUsernames / totalPlatforms) * 100).toFixed(1)}%)`)
    console.log(`   Influencers Missing Usernames: ${missingUsernames.length}`)
    console.log(`   Influencers with Invalid UUID userIds: ${influencersWithUUIDs.length}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error checking platform usernames:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

checkPlatformUsernames().catch(err => {
  console.error(err)
  process.exit(1)
})
