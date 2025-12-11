/**
 * Cleanup Invalid UUIDs from Influencer Notes
 * Removes internal UUIDs that were incorrectly stored as Modash userIds
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

async function cleanupUUIDUserIds() {
  let pool
  
  try {
    console.log('🧹 Starting cleanup of invalid UUID userIds from influencer notes...\n')
    
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

    // UUID regex pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    console.log('🔍 Step 1: Finding influencers with UUIDs in notes...\n')

    // Find all influencers with modash_data in notes
    const influencers = await query(`
      SELECT 
        id,
        display_name,
        notes
      FROM influencers
      WHERE notes IS NOT NULL 
        AND notes != '' 
        AND notes != '{}'
        AND notes::text LIKE '%modash_data%'
      ORDER BY display_name
    `)

    console.log(`📊 Found ${influencers.length} influencers with modash_data in notes\n`)

    let cleanedCount = 0
    let platformsCleaned = 0
    let legacyCleaned = 0
    const cleanedInfluencers = []

    for (const influencer of influencers) {
      try {
        const notes = typeof influencer.notes === 'string' 
          ? JSON.parse(influencer.notes) 
          : influencer.notes

        const modashData = notes?.modash_data
        if (!modashData) continue

        let needsUpdate = false
        const updatedNotes = JSON.parse(JSON.stringify(notes)) // Deep copy
        const updatedModashData = updatedNotes.modash_data || {}

        // Check and clean platform-specific userIds
        const platforms = updatedModashData.platforms || {}
        for (const [platform, platformData] of Object.entries(platforms)) {
          if (platformData?.userId && uuidPattern.test(platformData.userId)) {
            console.log(`   ❌ Found UUID in ${platform}: ${platformData.userId}`)
            console.log(`      Influencer: ${influencer.display_name} (${influencer.id})`)
            updatedModashData.platforms[platform].userId = null
            platformsCleaned++
            needsUpdate = true
          }
        }

        // Check and clean legacy userId
        if (updatedModashData.userId && uuidPattern.test(updatedModashData.userId)) {
          console.log(`   ❌ Found UUID in legacy userId: ${updatedModashData.userId}`)
          console.log(`      Influencer: ${influencer.display_name} (${influencer.id})`)
          updatedModashData.userId = null
          legacyCleaned++
          needsUpdate = true
        }

        // Check and clean legacy modash_user_id
        if (updatedModashData.modash_user_id && uuidPattern.test(updatedModashData.modash_user_id)) {
          console.log(`   ❌ Found UUID in legacy modash_user_id: ${updatedModashData.modash_user_id}`)
          console.log(`      Influencer: ${influencer.display_name} (${influencer.id})`)
          updatedModashData.modash_user_id = null
          legacyCleaned++
          needsUpdate = true
        }

        if (needsUpdate) {
          // Update the notes
          updatedNotes.modash_data = updatedModashData
          const notesString = JSON.stringify(updatedNotes)

          // Update in database
          await pool.query(
            'UPDATE influencers SET notes = $1, updated_at = NOW() WHERE id = $2',
            [notesString, influencer.id]
          )

          cleanedCount++
          cleanedInfluencers.push({
            id: influencer.id,
            display_name: influencer.display_name,
            cleaned: {
              platforms: Object.keys(platforms).filter(p => 
                platforms[p]?.userId && uuidPattern.test(platforms[p].userId)
              ),
              legacy: !!(updatedModashData.userId || updatedModashData.modash_user_id)
            }
          })

          console.log(`   ✅ Cleaned: ${influencer.display_name}\n`)
        }

      } catch (err) {
        console.warn(`   ⚠️  Failed to process ${influencer.display_name}:`, err.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 CLEANUP SUMMARY')
    console.log('='.repeat(60))
    console.log(`   Total influencers checked: ${influencers.length}`)
    console.log(`   Influencers cleaned: ${cleanedCount}`)
    console.log(`   Platform-specific userIds removed: ${platformsCleaned}`)
    console.log(`   Legacy userIds removed: ${legacyCleaned}`)
    console.log(`   Total UUIDs removed: ${platformsCleaned + legacyCleaned}`)

    if (cleanedInfluencers.length > 0) {
      console.log('\n📋 Cleaned Influencers:')
      cleanedInfluencers.forEach(inf => {
        console.log(`   • ${inf.display_name} (${inf.id})`)
        if (inf.cleaned.platforms.length > 0) {
          console.log(`     Platforms cleaned: ${inf.cleaned.platforms.join(', ')}`)
        }
        if (inf.cleaned.legacy) {
          console.log(`     Legacy userIds cleaned: Yes`)
        }
      })
    }

    if (cleanedCount === 0) {
      console.log('\n✅ No invalid UUIDs found! Database is clean.')
    } else {
      console.log('\n✅ Cleanup complete! Invalid UUIDs have been removed.')
      console.log('   These influencers will now fall back to username search when fetching analytics.')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

cleanupUUIDUserIds()

