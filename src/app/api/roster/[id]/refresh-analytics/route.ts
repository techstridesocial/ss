import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query, queryOne } from '@/lib/db/connection'
import { getProfileReport } from '@/lib/services/modash'
import { updateInfluencerAggregatedStats } from '@/lib/db/queries/influencer-stats-aggregator'

// POST /api/roster/[id]/refresh-analytics - Refresh analytics for roster influencer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    // Await params in Next.js 15
    const { id } = await params

    // Optional payload coming from client (contains freshly fetched Modash data)
    let requestPayload: any = null
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      requestPayload = await request.json().catch(() => null)
    }

    // Get current influencer data
    const influencerResult = await query<{
      id: string
      display_name: string
      notes: string
    }>(
      'SELECT id, display_name, notes FROM influencers WHERE id = $1',
      [id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    const influencer = influencerResult[0]
    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }
    
    // Parse existing notes to get modash data
    const existingNotes = influencer.notes ? JSON.parse(influencer.notes) : {}
    
    // Get userId from platform-specific structure first, then legacy
    const normalizedPlatform = (requestPayload?.platform || existingNotes.modash_data?.platform || 'instagram').toString().toLowerCase()
    const storedPlatforms = existingNotes.modash_data?.platforms || {}
    const storedPlatformUserId = storedPlatforms[normalizedPlatform]?.userId
    const legacyUserId = existingNotes.modash_data?.userId || existingNotes.modash_data?.modash_user_id

    const payloadModashUserId = requestPayload?.modashUserId || requestPayload?.metrics?.modashUserId
    
    // Validate userId format - reject UUIDs and invalid formats
    const { validateModashUserId, isUUID } = await import('@/lib/utils/modash-userid-validator')
    
    let modashUserId: string | null = null
    
    // Priority 1: Use payload userId (if valid)
    if (payloadModashUserId) {
      const validated = validateModashUserId(payloadModashUserId)
      if (validated) {
        modashUserId = validated
      } else {
        console.warn(`⚠️ Invalid payload userId format: ${payloadModashUserId}${isUUID(payloadModashUserId) ? ' (detected as UUID)' : ''}`)
      }
    }
    
    // Priority 2: Use platform-specific userId (if valid)
    if (!modashUserId && storedPlatformUserId) {
      const validated = validateModashUserId(storedPlatformUserId)
      if (validated) {
        modashUserId = validated
      } else {
        console.warn(`⚠️ Invalid platform-specific userId format for ${normalizedPlatform}: ${storedPlatformUserId}${isUUID(storedPlatformUserId) ? ' (detected as UUID)' : ''}`)
      }
    }
    
    // Priority 3: Use legacy userId (if valid and platform matches)
    if (!modashUserId && legacyUserId) {
      const validated = validateModashUserId(legacyUserId)
      if (validated) {
        const legacyPlatform = (existingNotes.modash_data?.platform || '').toLowerCase()
        if (!legacyPlatform || legacyPlatform === normalizedPlatform) {
          modashUserId = validated
        } else {
          console.warn(`⚠️ Legacy userId platform mismatch (${legacyPlatform} vs ${normalizedPlatform})`)
        }
      } else {
        console.warn(`⚠️ Invalid legacy userId format: ${legacyUserId}${isUUID(legacyUserId) ? ' (detected as UUID)' : ''}`)
      }
    }

    if (!modashUserId) {
      return NextResponse.json({ 
        error: 'No valid Modash user ID found - cannot refresh analytics. Please ensure userId is a valid Modash identifier (not an internal UUID).' 
      }, { status: 400 })
    }

    // Determine platform (payload overrides notes)
    const platform = (requestPayload?.platform || existingNotes.modash_data?.platform || 'instagram').toString().toLowerCase()
    const platformUpper = platform.toUpperCase()

    console.log('🔄 Refreshing analytics for:', {
      influencerId: id,
      modashUserId,
      platform
    })

    let metricsPayload = requestPayload?.metrics || null
    let profilePayload = requestPayload?.profile || null

    // Fetch fresh analytics from Modash if metrics not supplied
    if (!metricsPayload) {
      const freshProfileData = await getProfileReport(modashUserId, platform)
      
      if (!(freshProfileData as any)?.profile) {
        throw new Error('Failed to fetch fresh analytics from Modash')
      }

      const profile = (freshProfileData as any).profile?.profile || {}
      metricsPayload = {
        followers: profile.followers,
        engagementRate: profile.engagementRate,
        avgViews: profile.avgViews ?? profile.avgReelsPlays ?? 0,
        avgLikes: profile.avgLikes,
        avgComments: profile.avgComments,
        username: profile.username,
        url: profile.url,
        picture: profile.picture
      }

      profilePayload = {
          userId: finalValidatedUserId,
        username: profile.username,
        fullname: profile.fullname,
        followers: profile.followers,
        engagementRate: profile.engagementRate,
        avgLikes: profile.avgLikes,
        avgComments: profile.avgComments,
        averageViews: profile.avgViews ?? profile.avgReelsPlays ?? 0,
        url: profile.url,
        picture: profile.picture
      }
    }

    const followers = Number(metricsPayload?.followers ?? 0) || 0
    const engagementRate = Number(metricsPayload?.engagementRate ?? metricsPayload?.engagement_rate ?? 0) || 0
    const avgViews = Number(
      metricsPayload?.avgViews ??
      metricsPayload?.averageViews ??
      metricsPayload?.avg_views ??
      metricsPayload?.avg_reels_views ??
      0
    ) || 0
    const avgLikes = metricsPayload?.avgLikes ?? metricsPayload?.avg_likes ?? null
    const avgComments = metricsPayload?.avgComments ?? metricsPayload?.avg_comments ?? null
    const username = metricsPayload?.username || metricsPayload?.handle || profilePayload?.username || existingNotes.modash_data?.username || influencer.display_name
    const profileUrl = metricsPayload?.profileUrl || metricsPayload?.url || profilePayload?.url || existingNotes.modash_data?.url || null
    const picture = metricsPayload?.picture || profilePayload?.picture || existingNotes.modash_data?.picture || null

    const nowIso = new Date().toISOString()

    const existingModashData = (existingNotes.modash_data ?? {}) as Record<string, any>
    const existingPlatformsData = (existingModashData.platforms ?? {}) as Record<string, any>

    // CRITICAL: Double-check userId is valid before saving (should already be validated above)
    // This ensures we never save UUIDs or invalid formats to the database
    const finalValidatedUserId = validateModashUserId(modashUserId)
    if (!finalValidatedUserId) {
      console.error(`❌ Attempted to save invalid userId to notes: ${modashUserId}`)
      return NextResponse.json({
        error: 'Invalid Modash userId - cannot save to database'
      }, { status: 400 })
    }

    const updatedPlatformData = {
      ...(existingPlatformsData[platform] || {}),
      userId: finalValidatedUserId, // Always use validated userId
      username,
      fullname: profilePayload?.fullname || existingPlatformsData[platform]?.fullname || influencer.display_name,
      followers,
      engagementRate,
      avgViews,
      avgLikes,
      avgComments,
      url: profileUrl,
      picture,
      last_refreshed: nowIso,
      refreshed_by: userId,
      cached_payload: profilePayload || existingPlatformsData[platform]?.cached_payload || null
    }

    const platformsData = {
      ...existingPlatformsData,
      [platform]: updatedPlatformData
    }

    // Upsert platform metrics in influencer_platforms
    const existingPlatform = await queryOne<{ id: string }>(
      `SELECT id FROM influencer_platforms WHERE influencer_id = $1 AND platform = $2`,
      [id, platformUpper]
    )

    if (existingPlatform) {
      await query(
        `UPDATE influencer_platforms
         SET username = $1,
             modash_user_id = $2,
             profile_url = $3,
             followers = $4,
             engagement_rate = $5,
             avg_views = $6,
             is_connected = true,
             last_synced = NOW(),
             updated_at = NOW()
         WHERE influencer_id = $7 AND platform = $8`,
        [
          username,
          finalValidatedUserId, // Use validated userId
          profileUrl,
          followers,
          engagementRate,
          avgViews,
          id,
          platformUpper
        ]
      )
    } else {
      await query(
        `INSERT INTO influencer_platforms (
           influencer_id,
           platform,
           username,
           modash_user_id,
           profile_url,
           followers,
           engagement_rate,
           avg_views,
           is_connected,
           last_synced,
           created_at,
           updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW(), NOW())`,
        [
          id,
          platformUpper,
          username,
          finalValidatedUserId, // Use validated userId
          profileUrl,
          followers,
          engagementRate,
          avgViews
        ]
      )
    }

    // Update influencer notes with latest Modash snapshot
    // CRITICAL: Use validated userId, and clean up any invalid legacy userIds
    const updatedNotes = {
      ...existingNotes,
      modash_data: {
        ...existingModashData,
        platform,
        latest_platform: platform,
        // Only set top-level userId if it's valid (for backwards compatibility during migration)
        // Prefer platform-specific structure going forward
        userId: validatedUserId,
        modash_user_id: validatedUserId,
        username,
        url: profileUrl,
        picture,
        followers,
        engagementRate,
        avgViews,
        avgLikes,
        avgComments,
        last_refreshed: nowIso,
        refreshed_by: userId,
        source: 'roster_panel_refresh',
        profile_snapshot: profilePayload || existingModashData.profile_snapshot || null,
        platforms: platformsData
      }
    }

    const notesString = JSON.stringify(updatedNotes)

    await query(
      'UPDATE influencers SET notes = $1, updated_at = NOW() WHERE id = $2',
      [notesString, id]
    )

    // Recalculate aggregate totals
    await updateInfluencerAggregatedStats(id)

    const updatedTotals = await queryOne<{ total_followers: number; total_engagement_rate: number; total_avg_views: number }>(
      'SELECT total_followers, total_engagement_rate, total_avg_views FROM influencers WHERE id = $1',
      [id]
    )

    console.log('✅ Successfully refreshed analytics for influencer:', id)

    return NextResponse.json({
      success: true,
      message: 'Analytics refreshed successfully',
      data: {
        influencer_id: id,
        platform: platformUpper,
        totals: updatedTotals,
        metrics: {
          followers,
          engagementRate,
          avgViews,
          avgLikes,
          avgComments
        },
        last_refreshed: nowIso,
        notes: notesString
      }
    })

  } catch (error) {
    console.error('❌ Error refreshing analytics:', error)
    return NextResponse.json(
      { error: 'Failed to refresh analytics' },
      { status: 500 }
    )
  }
}
