/**
 * Cleanup Invalid YouTube UserIds
 * Removes YouTube userIds that don't start with 'UC' (channel ID format)
 * These should be treated as usernames instead
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

async function cleanupInvalidYouTubeUserIds() {
  let pool
  
  try {
    console.log('🧹 Cleaning up invalid YouTube userIds from influencer notes...\n')
    
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL not found in environment')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })

    const query = async (text, params) => {
      const result = await pool.query(text, params)
      return result.rows
    }

    // Find influencers with invalid YouTube userIds (doesn't start with UC)
    console.log('🔍 Step 1: Finding influencers with invalid YouTube userIds...\n')

    const influencers = await query(`
      SELECT 
        id,
        display_name,
        notes
      FROM influencers
      WHERE notes IS NOT NULL 
        AND notes != '' 
        AND notes != '{}'
        AND (
          -- Check legacy userId for YouTube
          (notes::jsonb->'modash_data'->>'platform' = 'youtube' 
           AND notes::jsonb->'modash_data'->>'userId' IS NOT NULL
           AND NOT (notes::jsonb->'modash_data'->>'userId' ~ '^UC'))
          OR
          -- Check platform-specific YouTube userId
          (notes::jsonb->'modash_data'->'platforms'->'youtube'->>'userId' IS NOT NULL
           AND NOT (notes::jsonb->'modash_data'->'platforms'->'youtube'->>'userId' ~ '^UC'))
        )
      ORDER BY display_name
    `)

    console.log(`📊 Found ${influencers.length} influencers with invalid YouTube userIds\n`)

    if (influencers.length === 0) {
      console.log('✅ No invalid YouTube userIds found! Database is clean.')
      process.exit(0)
    }

    let cleanedCount = 0
    const cleanedInfluencers = []

    for (const influencer of influencers) {
      try {
        const notes = typeof influencer.notes === 'string' 
          ? JSON.parse(influencer.notes) 
          : influencer.notes

        const modashData = notes?.modash_data
        if (!modashData) continue

        let needsUpdate = false
        const updatedNotes = JSON.parse(JSON.stringify(notes))
        const updatedModashData = updatedNotes.modash_data || {}

        // Check and clean platform-specific YouTube userId
        if (updatedModashData.platforms?.youtube?.userId) {
          const youtubeUserId = updatedModashData.platforms.youtube.userId
          if (!youtubeUserId.startsWith('UC')) {
            console.log(`   ❌ Found invalid YouTube userId: ${youtubeUserId}`)
            console.log(`      Influencer: ${influencer.display_name} (${influencer.id})`)
            
            // Move to username field if not already set
            if (!updatedModashData.platforms.youtube.username) {
              updatedModashData.platforms.youtube.username = youtubeUserId
              console.log(`      ✅ Moved to username field: ${youtubeUserId}`)
            }
            
            // Clear the userId
            updatedModashData.platforms.youtube.userId = null
            needsUpdate = true
          }
        }

        // Check and clean legacy userId if platform is YouTube
        if (updatedModashData.platform === 'youtube' && updatedModashData.userId && !updatedModashData.userId.startsWith('UC')) {
          console.log(`   ❌ Found invalid legacy YouTube userId: ${updatedModashData.userId}`)
          console.log(`      Influencer: ${influencer.display_name} (${influencer.id})`)
          
          // Move to username field if not already set
          if (!updatedModashData.username) {
            updatedModashData.username = updatedModashData.userId
            console.log(`      ✅ Moved to username field: ${updatedModashData.userId}`)
          }
          
          // Clear the userId (but keep modash_user_id if it exists and is valid)
          updatedModashData.userId = null
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
            display_name: influencer.display_name
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

    if (cleanedInfluencers.length > 0) {
      console.log('\n📋 Cleaned Influencers:')
      cleanedInfluencers.forEach(inf => {
        console.log(`   • ${inf.display_name} (${inf.id})`)
      })
    }

    if (cleanedCount === 0) {
      console.log('\n✅ No invalid YouTube userIds found! Database is clean.')
    } else {
      console.log('\n✅ Cleanup complete! Invalid YouTube userIds have been removed.')
      console.log('   These influencers will now use username search for YouTube.')
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

cleanupInvalidYouTubeUserIds()

