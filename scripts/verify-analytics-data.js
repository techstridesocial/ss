/**
 * Verify Analytics Panel Data
 * Checks if roster influencers have the required data for analytics panel
 */

const { query } = require('../src/lib/db/connection.ts')

async function verifyAnalyticsData() {
  console.log('🔍 VERIFYING ANALYTICS PANEL DATA\n')
  console.log('=' .repeat(60))
  
  try {
    // Check 1: Do we have influencers?
    console.log('\n📊 CHECK 1: Influencers in Database')
    console.log('-'.repeat(60))
    const influencers = await query(`
      SELECT 
        i.id,
        i.display_name,
        i.influencer_type,
        i.total_followers,
        up.first_name,
        up.last_name
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY i.created_at DESC
      LIMIT 10
    `)
    
    console.log(`Found ${influencers.length} influencers in database`)
    if (influencers.length === 0) {
      console.log('❌ NO INFLUENCERS FOUND - Analytics won\'t work without influencers')
      return
    }
    
    influencers.forEach((inf, i) => {
      console.log(`${i + 1}. ${inf.display_name || 'Unnamed'} (${inf.influencer_type || 'No type'}) - ${inf.total_followers || 0} followers`)
    })

    // Check 2: Do influencers have platform data?
    console.log('\n📱 CHECK 2: Platform Data (CRITICAL for Analytics)')
    console.log('-'.repeat(60))
    const platformData = await query(`
      SELECT 
        i.display_name,
        ip.platform,
        ip.username,
        ip.followers,
        ip.engagement_rate,
        ip.is_connected,
        ip.profile_url
      FROM influencers i
      JOIN influencer_platforms ip ON i.id = ip.influencer_id
      ORDER BY i.created_at DESC
      LIMIT 20
    `)
    
    console.log(`Found ${platformData.length} platform connections`)
    
    if (platformData.length === 0) {
      console.log('❌ NO PLATFORM DATA FOUND!')
      console.log('   Analytics panel WILL NOT WORK')
      console.log('   Influencers need records in influencer_platforms table')
      console.log('\n💡 SOLUTION:')
      console.log('   When adding influencers, also create influencer_platforms records')
      console.log('   Example:')
      console.log('   INSERT INTO influencer_platforms (influencer_id, platform, username, ...)')
      console.log('   VALUES (uuid, \'INSTAGRAM\', \'john_doe\', ...)')
    } else {
      const withUsernames = platformData.filter(p => p.username)
      console.log(`✅ ${withUsernames.length}/${platformData.length} have usernames (can fetch Modash)`)
      console.log(`⚠️  ${platformData.length - withUsernames.length}/${platformData.length} missing usernames (can't fetch Modash)`)
      
      console.log('\nSample platform data:')
      platformData.slice(0, 5).forEach(p => {
        const status = p.username ? '✅' : '❌ NO USERNAME'
        console.log(`  ${status} ${p.display_name} on ${p.platform}: @${p.username || 'NULL'} (${p.followers || 0} followers)`)
      })
    }

    // Check 3: Check for specific influencer to test
    console.log('\n🎯 CHECK 3: Testing First Influencer')
    console.log('-'.repeat(60))
    if (influencers.length > 0) {
      const testInfluencer = influencers[0]
      console.log(`Testing: ${testInfluencer.display_name} (ID: ${testInfluencer.id})`)
      
      const testPlatforms = await query(`
        SELECT * FROM influencer_platforms 
        WHERE influencer_id = $1
      `, [testInfluencer.id])
      
      console.log(`  Platforms: ${testPlatforms.length} found`)
      testPlatforms.forEach(p => {
        console.log(`    - ${p.platform}: @${p.username || 'NO USERNAME'} ${p.username ? '✅' : '❌'}`)
      })
      
      if (testPlatforms.length === 0) {
        console.log('  ❌ No platforms - analytics will fail')
      } else if (!testPlatforms.some(p => p.username)) {
        console.log('  ⚠️  Has platforms but no usernames - can\'t fetch Modash')
      } else {
        console.log('  ✅ Ready for analytics!')
      }
    }

    // Final verdict
    console.log('\n' + '='.repeat(60))
    console.log('📋 FINAL VERDICT:')
    console.log('='.repeat(60))
    
    if (influencers.length === 0) {
      console.log('❌ WILL NOT WORK: No influencers in database')
    } else if (platformData.length === 0) {
      console.log('❌ WILL NOT WORK: No platform data')
      console.log('   Influencers exist but have no platform connections')
    } else if (!platformData.some(p => p.username)) {
      console.log('⚠️  PARTIAL: Platform data exists but no usernames')
      console.log('   Panel will open but show "No username found" error')
    } else {
      const workingCount = platformData.filter(p => p.username).length
      console.log(`✅ WILL WORK: ${workingCount} influencers have complete data`)
      console.log('   Analytics panel will fetch Modash data successfully!')
    }
    
    console.log('\n')

  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    console.log('\n⚠️  Cannot verify - database not accessible')
  }
}

verifyAnalyticsData().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})

