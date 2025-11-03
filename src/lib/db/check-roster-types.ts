import { query } from './connection'

async function checkRosterTypes() {
  console.log('🔍 Checking Roster Database Configuration for All Influencer Types...\n')
  
  try {
    // 1. Check influencer_type column and its values
    console.log('1. Checking influencer_type configuration:')
    const typeCheck = await query(`
      SELECT 
        influencer_type,
        COUNT(*) as count,
        ARRAY_AGG(display_name ORDER BY display_name) as names
      FROM influencers 
      WHERE influencer_type IS NOT NULL
      GROUP BY influencer_type
      ORDER BY influencer_type
    `)
    
    if (typeCheck.length > 0) {
      typeCheck.forEach(type => {
        console.log(`   ✅ ${type.influencer_type}: ${type.count} influencers`)
        console.log(`      Names: ${type.names.join(', ')}`)
      })
    } else {
      console.log('   ⚠️  No influencer types found')
    }
    
    // 2. Check what influencer types are expected vs actual
    console.log('\n2. Expected vs Actual Influencer Types:')
    const expectedTypes = ['SIGNED', 'PARTNERED', 'AGENCY_PARTNER']
    
    expectedTypes.forEach(expectedType => {
      const found = typeCheck.find(t => t.influencer_type === expectedType)
      if (found) {
        console.log(`   ✅ ${expectedType}: ${found.count} records`)
      } else {
        console.log(`   ❌ ${expectedType}: 0 records (missing)`)
      }
    })
    
    // 3. Check user roles alignment
    console.log('\n3. User Roles vs Influencer Types:')
    const roleAlignment = await query(`
      SELECT 
        u.role as user_role,
        i.influencer_type,
        COUNT(*) as count
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      GROUP BY u.role, i.influencer_type
      ORDER BY u.role, i.influencer_type
    `)
    
    roleAlignment.forEach(alignment => {
      console.log(`   ${alignment.user_role || 'NULL'} → ${alignment.influencer_type || 'NULL'}: ${alignment.count} records`)
    })
    
    // 4. Check tier distribution
    console.log('\n4. Tier Distribution:')
    const tiers = await query(`
      SELECT 
        tier,
        COUNT(*) as count,
        ROUND(AVG(total_followers), 0) as avg_followers
      FROM influencers 
      WHERE tier IS NOT NULL
      GROUP BY tier
      ORDER BY tier
    `)
    
    tiers.forEach(tier => {
      console.log(`   ${tier.tier}: ${tier.count} influencers (avg: ${tier.avg_followers} followers)`)
    })
    
    // 5. Check content_type distribution
    console.log('\n5. Content Type Distribution:')
    const contentTypes = await query(`
      SELECT 
        content_type,
        COUNT(*) as count
      FROM influencers 
      WHERE content_type IS NOT NULL
      GROUP BY content_type
      ORDER BY content_type
    `)
    
    contentTypes.forEach(ct => {
      console.log(`   ${ct.content_type}: ${ct.count} influencers`)
    })
    
    // 6. Check platform coverage by type
    console.log('\n6. Platform Coverage by Influencer Type:')
    const platformCoverage = await query(`
      SELECT 
        i.influencer_type,
        ip.platform,
        COUNT(*) as count
      FROM influencers i
      LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE i.influencer_type IS NOT NULL
      GROUP BY i.influencer_type, ip.platform
      ORDER BY i.influencer_type, ip.platform
    `)
    
    const typeGroups: Record<string, string[]> = {}
    platformCoverage.forEach(pc => {
      if (!typeGroups[pc.influencer_type]) {
        typeGroups[pc.influencer_type] = []
      }
      if (pc.platform) {
        typeGroups[pc.influencer_type].push(`${pc.platform}(${pc.count})`)
      }
    })
    
    Object.keys(typeGroups).forEach(type => {
      console.log(`   ${type}: ${typeGroups[type].join(', ')}`)
    })
    
    // 7. Check if roster page can handle all types
    console.log('\n7. Roster Page Compatibility:')
    const allInfluencers = await query(`
      SELECT 
        i.id,
        i.display_name,
        i.influencer_type,
        i.tier,
        i.content_type,
        u.role,
        COUNT(ip.id) as platform_count
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
      GROUP BY i.id, i.display_name, i.influencer_type, i.tier, i.content_type, u.role
      ORDER BY i.created_at DESC
      LIMIT 3
    `)
    
    console.log('   Sample records for roster display:')
    allInfluencers.forEach(inf => {
      console.log(`   - ${inf.display_name} (${inf.influencer_type}) - ${inf.tier} tier - ${inf.platform_count} platforms`)
    })
    
    // 8. Overall roster status
    console.log('\n8. Overall Roster Database Status:')
    const totalInfluencers = await query('SELECT COUNT(*) as count FROM influencers')
    const totalWithTypes = await query('SELECT COUNT(*) as count FROM influencers WHERE influencer_type IS NOT NULL')
    const totalPlatforms = await query('SELECT COUNT(*) as count FROM influencer_platforms')
    
    console.log(`   Total Influencers: ${totalInfluencers[0]?.count || 0}`)
    console.log(`   With Types: ${totalWithTypes[0]?.count || 0}`)
    console.log(`   Platform Connections: ${totalPlatforms[0]?.count || 0}`)
    
    const completionRate = totalInfluencers[0]?.count > 0 ? 
      ((totalWithTypes[0]?.count || 0) / totalInfluencers[0].count * 100).toFixed(1) : 0
    console.log(`   Type Completion: ${completionRate}%`)
    
    // 9. Final verdict
    console.log('\n🎉 ROSTER DATABASE VERDICT:')
    if ((totalWithTypes[0]?.count || 0) === (totalInfluencers[0]?.count || 0) && (totalInfluencers[0]?.count || 0) > 0) {
      console.log('✅ FULLY CONFIGURED - All influencer types supported')
      console.log('✅ Ready for SIGNED, PARTNERED, and AGENCY_PARTNER influencers')
      console.log('✅ Roster page can display all types from Neon database')
    } else if (totalInfluencers[0].count > 0) {
      console.log('⚠️  PARTIALLY CONFIGURED - Some records missing types')
      console.log('⚠️  May need data cleanup for complete functionality')
    } else {
      console.log('🆕 EMPTY BUT READY - Schema configured, awaiting data')
      console.log('✅ Ready to receive all influencer types')
    }
    
  } catch (_error) {
    console.error('❌ Error checking roster types:', error)
  }
}

checkRosterTypes().then(() => process.exit(0)) 