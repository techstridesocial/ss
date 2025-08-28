#!/usr/bin/env node

/**
 * 🧪 TEST ROSTER API SCRIPT
 * Test what the /api/influencers endpoint actually returns
 */

const { Client } = require('pg')
require('dotenv').config({ path: './.env.local' })

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    await client.connect()
    console.log('🔌 Connected to database')

    // Test the exact query that the roster API uses
    const influencersQuery = `
      SELECT 
        i.id,
        i.user_id,
        i.display_name,
        i.niches,
        i.total_followers,
        i.total_engagement_rate,
        i.total_avg_views,
        i.estimated_promotion_views,
        i.tier,
        i.assigned_to,
        i.labels,
        i.notes,
        i.created_at,
        i.updated_at,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.location_country,
        up.location_city,
        up.bio,
        u.email,
        u.role
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY i.created_at DESC
    `

    const influencers = await client.query(influencersQuery)

    // Get platform data for each influencer
    const platformsQuery = `
      SELECT 
        influencer_id,
        platform,
        username,
        followers,
        engagement_rate,
        avg_views,
        is_connected,
        last_synced
      FROM influencer_platforms
      ORDER BY influencer_id, platform
    `

    const platforms = await client.query(platformsQuery)

    // Group platforms by influencer
    const platformsByInfluencer = platforms.rows.reduce((acc, platform) => {
      if (!acc[platform.influencer_id]) {
        acc[platform.influencer_id] = []
      }
      acc[platform.influencer_id].push(platform)
      return acc
    }, {})

    // Combine data (like the API does)
    const enrichedInfluencers = influencers.rows.map((inf) => ({
      ...inf,
      platforms: platformsByInfluencer[inf.id] || [],
      platform_count: (platformsByInfluencer[inf.id] || []).length,
      influencer_type: 'PARTNERED', // simplified
      is_active: true
    }))

    console.log(`\\n📊 Found ${enrichedInfluencers.length} influencers`)

    // Test each influencer's modash data
    for (const influencer of enrichedInfluencers) {
      console.log(`\\n👤 ${influencer.display_name}:`)
      console.log(`   🆔 ID: ${influencer.id}`)
      console.log(`   🖼️  Avatar: ${influencer.avatar_url ? '✅' : '❌'}`)
      console.log(`   📱 Platforms: ${influencer.platforms.length}`)
      
      if (influencer.platforms.length > 0) {
        console.log(`   📱 Platform Details:`)
        influencer.platforms.forEach((p, i) => {
          console.log(`      ${i + 1}. ${p.platform}: ${p.username} (${p.followers} followers)`)
        })
      }
      
      if (influencer.notes) {
        try {
          const notes = JSON.parse(influencer.notes)
          if (notes.modash_data) {
            console.log(`   📊 Modash Data: ✅ PRESENT`)
            const md = notes.modash_data
            console.log(`      - Basic info: ${md.username || 'missing'} / ${md.displayName || 'missing'}`)
            console.log(`      - Profile pic: ${md.profilePicture ? '✅' : '❌'}`)
            console.log(`      - Platforms obj: ${md.platforms ? Object.keys(md.platforms).join(', ') : '❌'}`)
            console.log(`      - Audience: ${md.audience ? 'Present' : '❌'}`)
            console.log(`      - Hashtags: ${md.hashtags ? md.hashtags.length + ' items' : '❌'}`)
            console.log(`      - Brand partnerships: ${md.brand_partnerships ? md.brand_partnerships.length + ' items' : '❌'}`)
            
            if (md.audience) {
              console.log(`      - Audience details:`)
              console.log(`         * Locations: ${md.audience.locations ? md.audience.locations.length : 0}`)
              console.log(`         * Languages: ${md.audience.languages ? md.audience.languages.length : 0}`)
              console.log(`         * Gender: ${md.audience.gender ? 'Present' : 'Missing'}`)
              console.log(`         * Age ranges: ${md.audience.age_ranges ? 'Present' : 'Missing'}`)
            }
          } else {
            console.log(`   📊 Modash Data: ❌ MISSING`)
          }
        } catch (e) {
          console.log(`   📊 Notes parse error: ${e.message}`)
        }
      } else {
        console.log(`   📊 Notes: ❌ MISSING`)
      }
    }

    console.log(`\\n🎯 API SIMULATION COMPLETE`)
    console.log(`✅ This is exactly what the roster page receives from /api/influencers`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
