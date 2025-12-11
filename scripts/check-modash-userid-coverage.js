/**
 * Check Modash UserId Coverage
 * Analyzes which influencers have modash_user_id vs just username
 */

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('pg')

async function checkModashUserIdCoverage() {
  let pool

  try {
    console.log('🔍 Checking Modash userId coverage in database...\n')

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

    // Get statistics
    const stats = await query(`
      SELECT 
        COUNT(*) as total_platforms,
        COUNT(CASE WHEN modash_user_id IS NOT NULL AND modash_user_id != '' THEN 1 END) as with_modash_id,
        COUNT(CASE WHEN modash_user_id IS NULL OR modash_user_id = '' THEN 1 END) as without_modash_id,
        COUNT(CASE WHEN username IS NOT NULL AND username != '' THEN 1 END) as with_username
      FROM influencer_platforms
      WHERE username IS NOT NULL
    `)

    console.log('📊 OVERALL STATISTICS')
    console.log('='.repeat(60))
    const stat = stats[0]
    console.log(`   Total platform records: ${stat.total_platforms}`)
    console.log(`   With modash_user_id: ${stat.with_modash_id} (${((stat.with_modash_id / stat.total_platforms) * 100).toFixed(1)}%)`)
    console.log(`   Without modash_user_id: ${stat.without_modash_id} (${((stat.without_modash_id / stat.total_platforms) * 100).toFixed(1)}%)`)
    console.log(`   With username: ${stat.with_username} (${((stat.with_username / stat.total_platforms) * 100).toFixed(1)}%)\n`)

    // Check influencers that have modash_user_id in notes but not in influencer_platforms
    const withNotesUserId = await query(`
      SELECT 
        i.id,
        i.display_name,
        ip.platform,
        ip.username,
        ip.modash_user_id as platform_modash_id,
        i.notes::jsonb->'modash_data'->'platforms'->ip.platform::text->>'userId' as notes_userid,
        i.notes::jsonb->'modash_data'->>'userId' as notes_legacy_userid
      FROM influencers i
      JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE ip.username IS NOT NULL
        AND (
          i.notes::jsonb->'modash_data'->'platforms'->ip.platform::text->>'userId' IS NOT NULL
          OR i.notes::jsonb->'modash_data'->>'userId' IS NOT NULL
        )
        AND (ip.modash_user_id IS NULL OR ip.modash_user_id = '')
      ORDER BY i.display_name, ip.platform
    `)

    if (withNotesUserId.length > 0) {
      console.log('⚠️  INFLUENCERS WITH userId IN NOTES BUT NOT IN influencer_platforms:')
      console.log(`   Found ${withNotesUserId.length} platform records\n`)
      console.log('   These could be synced from notes to influencer_platforms:\n')
      
      withNotesUserId.slice(0, 10).forEach(row => {
        const userId = row.notes_userid || row.notes_legacy_userid
        console.log(`   • ${row.display_name} - ${row.platform}`)
        console.log(`     Username: ${row.username}`)
        console.log(`     Notes userId: ${userId}`)
        console.log(`     Platform modash_user_id: ${row.platform_modash_id || 'NULL'}\n`)
      })
      
      if (withNotesUserId.length > 10) {
        console.log(`   ... and ${withNotesUserId.length - 10} more\n`)
      }
    } else {
      console.log('✅ No influencers found with userId in notes but missing in influencer_platforms\n')
    }

    // Check influencers without modash_user_id (potential candidates for backfill)
    const withoutModashId = await query(`
      SELECT 
        i.id,
        i.display_name,
        ip.platform,
        ip.username,
        ip.modash_user_id,
        CASE 
          WHEN i.notes::jsonb->'modash_data'->'platforms'->ip.platform::text->>'userId' IS NOT NULL THEN 'YES'
          WHEN i.notes::jsonb->'modash_data'->>'userId' IS NOT NULL THEN 'YES (legacy)'
          ELSE 'NO'
        END as has_notes_userid
      FROM influencers i
      JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE ip.username IS NOT NULL
        AND (ip.modash_user_id IS NULL OR ip.modash_user_id = '')
        AND (
          i.notes::jsonb->'modash_data'->'platforms'->ip.platform::text->>'userId' IS NULL
          AND i.notes::jsonb->'modash_data'->>'userId' IS NULL
        )
      ORDER BY i.display_name, ip.platform
      LIMIT 10
    `)

    console.log('\n📋 SAMPLE INFLUENCERS WITHOUT modash_user_id (need username lookup):')
    console.log('='.repeat(60))
    if (withoutModashId.length === 0) {
      console.log('   ✅ All influencers have modash_user_id!\n')
    } else {
      withoutModashId.forEach(row => {
        console.log(`   • ${row.display_name} - ${row.platform}`)
        console.log(`     Username: ${row.username}`)
        console.log(`     Has notes userId: ${row.has_notes_userid}`)
        console.log(`     Will use: Username lookup (slower but works)\n`)
      })
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY & RECOMMENDATIONS')
    console.log('='.repeat(60))
    console.log(`   ✅ ${stat.with_modash_id} platforms have modash_user_id (fast path)`)
    console.log(`   ⚠️  ${stat.without_modash_id} platforms need username lookup (works but slower)`)
    
    if (withNotesUserId.length > 0) {
      console.log(`\n   💡 RECOMMENDATION:`)
      console.log(`      Sync userId from notes to influencer_platforms.modash_user_id`)
      console.log(`      This would speed up ${withNotesUserId.length} platform lookups!`)
      console.log(`      Run: node scripts/sync-userid-from-notes-to-platforms.js`)
    } else {
      console.log(`\n   ✅ No action needed - current setup is optimal!`)
      console.log(`      Username fallback will work for all influencers`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error checking coverage:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

checkModashUserIdCoverage()

