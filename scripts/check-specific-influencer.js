/**
 * Check Specific Influencer
 * Check a specific influencer ID for platform usernames
 */

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

async function checkSpecificInfluencer() {
  let pool
  
  try {
    const influencerId = process.argv[2] || '02f68bd0-b120-4da8-ace1-4dbeb5af2aee'
    
    console.log(`🔍 Checking influencer: ${influencerId}\n`)
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    // Get influencer basic info
    const influencer = await pool.query(`
      SELECT 
        i.id,
        i.display_name,
        i.influencer_type,
        i.notes,
        up.first_name,
        up.last_name
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE i.id = $1
    `, [influencerId])

    if (influencer.rows.length === 0) {
      console.log(`❌ Influencer not found: ${influencerId}`)
      process.exit(1)
    }

    const inf = influencer.rows[0]
    console.log(`📋 Influencer: ${inf.display_name}`)
    console.log(`   ID: ${inf.id}`)
    console.log(`   Type: ${inf.influencer_type || 'N/A'}`)
    console.log(`   Name: ${inf.first_name || ''} ${inf.last_name || ''}`)

    // Get platforms
    const platforms = await pool.query(`
      SELECT 
        id,
        platform,
        username,
        modash_user_id,
        followers,
        engagement_rate,
        is_connected,
        profile_url,
        last_synced
      FROM influencer_platforms
      WHERE influencer_id = $1
      ORDER BY platform
    `, [influencerId])

    console.log(`\n📱 Platforms (${platforms.rows.length}):`)
    if (platforms.rows.length === 0) {
      console.log(`   ❌ NO PLATFORMS FOUND`)
      console.log(`   This influencer has no records in influencer_platforms table`)
      console.log(`   This is why username lookup fails!`)
    } else {
      platforms.rows.forEach(p => {
        console.log(`\n   ${p.platform}:`)
        console.log(`     Username: ${p.username || '❌ NULL/EMPTY'}`)
        console.log(`     Modash User ID: ${p.modash_user_id || '❌ NULL'}`)
        console.log(`     Is Connected: ${p.is_connected ? '✅ Yes' : '❌ No'}`)
        console.log(`     Followers: ${p.followers || 0}`)
        console.log(`     Engagement: ${p.engagement_rate || 0}`)
        console.log(`     Profile URL: ${p.profile_url || 'N/A'}`)
      })
    }

    // Check notes for modash_data
    if (inf.notes) {
      try {
        const notes = typeof inf.notes === 'string' ? JSON.parse(inf.notes) : inf.notes
        const modashData = notes?.modash_data
        
        if (modashData) {
          console.log(`\n📝 Modash Data in Notes:`)
          console.log(`   Platform: ${modashData.platform || 'N/A'}`)
          console.log(`   User ID: ${modashData.userId || modashData.modash_user_id || 'N/A'}`)
          
          if (modashData.platforms) {
            console.log(`   Platform-Specific Data:`)
            for (const [platform, data] of Object.entries(modashData.platforms)) {
              const platformData = data || {}
              console.log(`     ${platform}:`)
              console.log(`       User ID: ${platformData.userId || 'N/A'}`)
              console.log(`       Username: ${platformData.username || 'N/A'}`)
              console.log(`       Last Refreshed: ${platformData.last_refreshed || 'N/A'}`)
            }
          }
        } else {
          console.log(`\n📝 Notes: Has notes but no modash_data`)
        }
      } catch (err) {
        console.log(`\n📝 Notes: Failed to parse (${err.message})`)
      }
    } else {
      console.log(`\n📝 Notes: No notes stored`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

checkSpecificInfluencer()
