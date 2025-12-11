/**
 * Sync Modash userId from notes to influencer_platforms.modash_user_id
 * For influencers added via Flow 1 (Discovery), sync userId to platform table for faster lookups
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

async function syncUserIdFromNotes() {
  let pool

  try {
    console.log('🔄 Syncing Modash userId from notes to influencer_platforms...\n')

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

    // Find influencers with userId in notes but not in influencer_platforms
    const toSync = await query(`
      SELECT 
        i.id as influencer_id,
        i.display_name,
        ip.id as platform_id,
        ip.platform,
        ip.username,
        ip.modash_user_id as current_platform_userid,
        i.notes::jsonb->'modash_data'->'platforms'->ip.platform::text->>'userId' as notes_platform_userid,
        i.notes::jsonb->'modash_data'->>'userId' as notes_legacy_userid,
        i.notes::jsonb->'modash_data'->>'platform' as notes_platform
      FROM influencers i
      JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE ip.username IS NOT NULL
        AND (ip.modash_user_id IS NULL OR ip.modash_user_id = '')
        AND (
          -- Check platform-specific userId
          i.notes::jsonb->'modash_data'->'platforms'->ip.platform::text->>'userId' IS NOT NULL
          OR (
            -- Check legacy userId if platform matches
            i.notes::jsonb->'modash_data'->>'userId' IS NOT NULL
            AND (
              i.notes::jsonb->'modash_data'->>'platform' IS NULL
              OR LOWER(i.notes::jsonb->'modash_data'->>'platform') = LOWER(ip.platform::text)
            )
          )
        )
      ORDER BY i.display_name, ip.platform
    `)

    console.log(`📊 Found ${toSync.length} platform records to sync\n`)

    if (toSync.length === 0) {
      console.log('✅ No records need syncing - database is up to date!')
      process.exit(0)
    }

    let syncedCount = 0
    const synced = []
    const skipped = []

    for (const record of toSync) {
      try {
        // Determine which userId to use (platform-specific takes priority)
        let userIdToSync = record.notes_platform_userid || null
        
        // If no platform-specific, use legacy if platform matches
        if (!userIdToSync && record.notes_legacy_userid) {
          const notesPlatform = (record.notes_platform || '').toLowerCase()
          const platformLower = record.platform.toLowerCase()
          
          if (!notesPlatform || notesPlatform === platformLower) {
            userIdToSync = record.notes_legacy_userid
          }
        }

        // Validate userId (must not be UUID)
        if (!userIdToSync) {
          skipped.push({
            influencer: record.display_name,
            platform: record.platform,
            reason: 'No valid userId found in notes'
          })
          continue
        }

        // Check if it's a UUID (invalid)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (uuidPattern.test(userIdToSync)) {
          skipped.push({
            influencer: record.display_name,
            platform: record.platform,
            reason: `UserId is UUID (invalid): ${userIdToSync}`
          })
          continue
        }

        // Update influencer_platforms.modash_user_id
        await pool.query(`
          UPDATE influencer_platforms
          SET modash_user_id = $1, updated_at = NOW()
          WHERE id = $2
        `, [userIdToSync, record.platform_id])

        syncedCount++
        synced.push({
          influencer: record.display_name,
          platform: record.platform,
          username: record.username,
          userId: userIdToSync
        })

        console.log(`✅ Synced: ${record.display_name} - ${record.platform}`)
        console.log(`   Username: ${record.username} → userId: ${userIdToSync}\n`)

      } catch (err) {
        console.error(`❌ Error syncing ${record.display_name} - ${record.platform}:`, err.message)
        skipped.push({
          influencer: record.display_name,
          platform: record.platform,
          reason: err.message
        })
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 SYNC SUMMARY')
    console.log('='.repeat(60))
    console.log(`   Total records checked: ${toSync.length}`)
    console.log(`   Successfully synced: ${syncedCount}`)
    console.log(`   Skipped: ${skipped.length}`)

    if (synced.length > 0) {
      console.log('\n✅ Synced Records:')
      synced.forEach(item => {
        console.log(`   • ${item.influencer} - ${item.platform}: ${item.userId}`)
      })
    }

    if (skipped.length > 0) {
      console.log('\n⚠️  Skipped Records:')
      skipped.forEach(item => {
        console.log(`   • ${item.influencer} - ${item.platform}: ${item.reason}`)
      })
    }

    if (syncedCount > 0) {
      console.log(`\n✅ Sync complete! ${syncedCount} platform records now have modash_user_id.`)
      console.log('   Analytics will be faster for these influencers! 🚀\n')
    } else {
      console.log('\n⚠️  No records were synced. Check skipped records for details.\n')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error syncing userId:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

syncUserIdFromNotes()

