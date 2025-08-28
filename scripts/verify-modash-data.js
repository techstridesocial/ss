#!/usr/bin/env node

/**
 * 🔍 VERIFY MODASH DATA SCRIPT
 * Check if the roster influencers have complete modash_data
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

    // Check influencers in roster
    const result = await client.query(`
      SELECT 
        i.id,
        i.display_name,
        i.notes,
        up.avatar_url,
        ip.platform
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
      ORDER BY i.display_name
    `)

    console.log(`\n📊 Found ${result.rows.length} influencer records`)

    if (result.rows.length === 0) {
      console.log('❌ No influencers found in database!')
      return
    }

    for (const row of result.rows) {
      console.log(`\n👤 ${row.display_name}:`)
      console.log(`   🆔 ID: ${row.id}`)
      console.log(`   🖼️  Avatar URL: ${row.avatar_url ? '✅ Present' : '❌ Missing'}`)
      console.log(`   📱 Platform: ${row.platform}`)
      
      if (row.notes) {
        try {
          const notes = JSON.parse(row.notes)
          if (notes.modash_data) {
            const modashData = notes.modash_data
            console.log(`   📊 Modash Data: ✅ Present`)
            console.log(`   🔸 Profile Picture: ${modashData.profilePicture ? '✅' : '❌'}`)
            console.log(`   🔸 Platforms Object: ${modashData.platforms ? '✅' : '❌'}`)
            console.log(`   🔸 Audience Data: ${modashData.audience ? '✅' : '❌'}`)
            console.log(`   🔸 Hashtags: ${modashData.hashtags ? '✅' : '❌'}`)
            console.log(`   🔸 Brand Partnerships: ${modashData.brand_partnerships ? '✅' : '❌'}`)
            
            // Check audience details
            if (modashData.audience) {
              const audience = modashData.audience
              console.log(`   📈 Audience Details:`)
              console.log(`      - Locations: ${audience.locations?.length || 0} countries`)
              console.log(`      - Languages: ${audience.languages?.length || 0} languages`)
              console.log(`      - Gender: ${audience.gender ? 'Present' : 'Missing'}`)
              console.log(`      - Age ranges: ${audience.age_ranges ? 'Present' : 'Missing'}`)
            }
          } else {
            console.log(`   📊 Modash Data: ❌ Missing`)
          }
        } catch (e) {
          console.log(`   📊 Notes parsing error: ${e.message}`)
        }
      } else {
        console.log(`   📊 Notes: ❌ Missing`)
      }
    }

    // Test the roster API endpoint
    console.log(`\n🔧 Testing API endpoint structure...`)
    
    // Check if the API would return the data properly
    const apiQuery = `
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
      LIMIT 1
    `
    
    const apiResult = await client.query(apiQuery)
    if (apiResult.rows.length > 0) {
      const sample = apiResult.rows[0]
      console.log(`\n🧪 Sample API Response:`)
      console.log(`   Display Name: ${sample.display_name}`)
      console.log(`   Avatar URL: ${sample.avatar_url ? '✅ Present' : '❌ Missing'}`)
      console.log(`   Notes Field: ${sample.notes ? '✅ Present' : '❌ Missing'}`)
      
      if (sample.notes) {
        try {
          const notes = JSON.parse(sample.notes)
          console.log(`   Modash Data in Notes: ${notes.modash_data ? '✅ Present' : '❌ Missing'}`)
          if (notes.modash_data) {
            console.log(`   Rich Analytics Available: ✅ YES`)
          }
        } catch (e) {
          console.log(`   Notes Parse Error: ${e.message}`)
        }
      }
    }

    console.log(`\n🎯 VERIFICATION SUMMARY:`)
    console.log(`   📊 Total Influencers: ${result.rows.length}`)
    console.log(`   🖼️  Profile Images: ${result.rows.filter(r => r.avatar_url).length}/${result.rows.length}`)
    
    const withModash = result.rows.filter(r => {
      if (!r.notes) return false
      try {
        const notes = JSON.parse(r.notes)
        return !!notes.modash_data
      } catch {
        return false
      }
    })
    
    console.log(`   📈 With Modash Data: ${withModash.length}/${result.rows.length}`)
    
    if (withModash.length === result.rows.length && result.rows.length > 0) {
      console.log(`\n✅ SUCCESS: All influencers have complete modash data!`)
      console.log(`🔥 The roster popup should now show discovery-level analytics!`)
    } else {
      console.log(`\n❌ ISSUE: Some influencers missing modash data`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
