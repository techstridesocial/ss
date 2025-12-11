/**
 * Admin API: Check Influencer Platform Usernames
 * Analyzes which influencers have social media handles linked
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    console.log('🔍 Checking influencer platform usernames...\n')

    // Get total influencers
    const totalInfluencers = await query(`
      SELECT COUNT(*) as count
      FROM influencers
    `)

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

    // Get platform breakdown
    const platformStats = await query(`
      SELECT 
        ip.platform,
        COUNT(*) as total,
        COUNT(CASE WHEN ip.username IS NOT NULL AND ip.username != '' THEN 1 END) as with_username,
        COUNT(CASE WHEN ip.username IS NULL OR ip.username = '' THEN 1 END) as without_username
      FROM influencer_platforms ip
      GROUP BY ip.platform
      ORDER BY ip.platform
    `)

    // Get influencers missing usernames
    const missingUsernames = influencersWithPlatforms
      .filter(inf => parseInt(inf.platforms_without_username) > 0)
      .map(inf => ({
        id: inf.id,
        display_name: inf.display_name,
        platforms: inf.platforms || [],
        missing_for: inf.platforms_without_username_list || [],
        has_username_for: inf.platforms_with_username_list || []
      }))

    // Calculate totals
    let totalPlatforms = 0
    let totalWithUsernames = 0
    let totalWithoutUsernames = 0

    for (const influencer of influencersWithPlatforms) {
      totalPlatforms += parseInt(influencer.platform_count) || 0
      totalWithUsernames += parseInt(influencer.platforms_with_username) || 0
      totalWithoutUsernames += parseInt(influencer.platforms_without_username) || 0
    }

    // Check for UUIDs stored as userIds in notes
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
    const influencersWithUUIDs: any[] = []

    for (const influencer of influencersWithNotes) {
      try {
        const notes = typeof influencer.notes === 'string' 
          ? JSON.parse(influencer.notes) 
          : influencer.notes

        const modashData = notes?.modash_data
        if (!modashData) continue

        // Check platform-specific userIds
        const platforms = modashData.platforms || {}
        for (const [platform, platformData] of Object.entries(platforms as Record<string, any>)) {
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
        // Skip parsing errors
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_influencers: parseInt(totalInfluencers[0]?.count || '0'),
          influencers_with_platforms: influencersWithPlatforms.length,
          total_platforms: totalPlatforms,
          platforms_with_usernames: totalWithUsernames,
          platforms_without_usernames: totalWithoutUsernames,
          username_coverage_percent: totalPlatforms > 0 
            ? ((totalWithUsernames / totalPlatforms) * 100).toFixed(1) 
            : '0',
          influencers_missing_usernames: missingUsernames.length,
          influencers_with_uuid_userids: influencersWithUUIDs.length
        },
        platform_breakdown: platformStats.map(p => ({
          platform: p.platform,
          total: parseInt(p.total),
          with_username: parseInt(p.with_username),
          without_username: parseInt(p.without_username),
          coverage_percent: ((parseInt(p.with_username) / parseInt(p.total)) * 100).toFixed(1)
        })),
        missing_usernames: missingUsernames.slice(0, 50), // Limit to first 50
        uuid_issues: influencersWithUUIDs.slice(0, 50) // Limit to first 50
      }
    })

  } catch (error) {
    console.error('❌ Error checking platform usernames:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check platform usernames',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
