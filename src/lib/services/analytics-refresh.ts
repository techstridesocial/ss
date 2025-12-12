/**
 * Analytics Refresh Service
 * 
 * Handles the business logic for refreshing influencer analytics from Modash.
 * Separated from route handler for better testability and reusability.
 */

import { query, queryOne, transaction } from '@/lib/db/connection'
import { getProfileReport } from '@/lib/services/modash'
import { updateInfluencerAggregatedStats } from '@/lib/db/queries/influencer-stats-aggregator'
import { resolveModashUserId } from '@/lib/utils/modash-userid-validator'
import { normalizeModashMetrics, type RawModashMetrics } from '@/lib/utils/metrics-normalizer'

/**
 * Options for refreshing analytics
 */
export interface RefreshAnalyticsOptions {
  influencerId: string
  refreshedBy: string
  payload?: {
    platform?: string
    modashUserId?: string
    metrics?: RawModashMetrics
    profile?: any
  }
}

/**
 * Result of analytics refresh
 */
export interface RefreshAnalyticsResult {
  influencerId: string
  platform: string
  modashUserId: string
  metrics: {
    followers: number
    engagementRate: number
    avgViews: number
    avgLikes: number | null
    avgComments: number | null
  }
  totals: {
    total_followers: number
    total_engagement_rate: number
    total_avg_views: number
  } | null
  lastRefreshed: string
}

/**
 * Influencer data needed for refresh
 */
interface InfluencerData {
  id: string
  display_name: string
  notes: string
}

/**
 * Get influencer basic data
 */
async function getInfluencerData(influencerId: string): Promise<InfluencerData> {
  const result = await query<InfluencerData>(
    'SELECT id, display_name, notes FROM influencers WHERE id = $1',
    [influencerId]
  )

  if (result.length === 0) {
    throw new Error('Influencer not found')
  }

  return result[0]!
}

/**
 * Resolve Modash userId from various sources
 */
function resolveUserId(
  payload: RefreshAnalyticsOptions['payload'],
  existingNotes: any,
  normalizedPlatform: string
): string {
  const storedPlatforms = existingNotes.modash_data?.platforms || {}
  const storedPlatformUserId = storedPlatforms[normalizedPlatform]?.userId
  const legacyUserId = existingNotes.modash_data?.userId || existingNotes.modash_data?.modash_user_id
  const payloadModashUserId = payload?.modashUserId

  const resolution = resolveModashUserId([
    { value: payloadModashUserId, name: 'payload' },
    { value: storedPlatformUserId, name: 'platform-specific' },
    {
      value: legacyUserId,
      name: 'legacy',
      platformCheck: () => {
        const legacyPlatform = (existingNotes.modash_data?.platform || '').toLowerCase()
        return !legacyPlatform || legacyPlatform === normalizedPlatform
      }
    }
  ])

  if (!resolution) {
    throw new Error('No valid Modash user ID found - cannot refresh analytics. Please ensure userId is a valid Modash identifier (not an internal UUID).')
  }

  return resolution.userId
}

/**
 * Fetch metrics from Modash API if not provided
 */
async function fetchOrUseMetrics(
  modashUserId: string,
  platform: string,
  providedMetrics: RawModashMetrics | null | undefined
): Promise<{ metrics: RawModashMetrics; profile: any }> {
  if (providedMetrics) {
    return {
      metrics: providedMetrics,
      profile: null
    }
  }

  const freshProfileData = await getProfileReport(modashUserId, platform)

  if (!(freshProfileData as any)?.profile) {
    throw new Error('Failed to fetch fresh analytics from Modash')
  }

  const profile = (freshProfileData as any).profile?.profile || {}

  return {
    metrics: {
      followers: profile.followers,
      engagementRate: profile.engagementRate,
      avgViews: profile.avgViews ?? profile.avgReelsPlays ?? 0,
      avgLikes: profile.avgLikes,
      avgComments: profile.avgComments,
      username: profile.username,
      url: profile.url,
      picture: profile.picture
    },
    profile: {
      userId: modashUserId,
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
}

/**
 * Update influencer data in database
 */
async function updateInfluencerData(
  influencerId: string,
  platform: string,
  platformUpper: string,
  metrics: ReturnType<typeof normalizeModashMetrics>,
  modashUserId: string,
  profilePayload: any,
  existingNotes: any,
  influencer: InfluencerData,
  refreshedBy: string
): Promise<void> {
  const nowIso = new Date().toISOString()
  const existingModashData = (existingNotes.modash_data ?? {}) as Record<string, any>
  const existingPlatformsData = (existingModashData.platforms ?? {}) as Record<string, any>

  const updatedPlatformData = {
    ...(existingPlatformsData[platform] || {}),
    userId: modashUserId,
    username: metrics.username,
    fullname: profilePayload?.fullname || existingPlatformsData[platform]?.fullname || influencer.display_name,
    followers: metrics.followers,
    engagementRate: metrics.engagementRate,
    avgViews: metrics.avgViews,
    avgLikes: metrics.avgLikes,
    avgComments: metrics.avgComments,
    url: metrics.profileUrl,
    picture: metrics.picture,
    last_refreshed: nowIso,
    refreshed_by: refreshedBy,
    cached_payload: profilePayload || existingPlatformsData[platform]?.cached_payload || null
  }

  const platformsData = {
    ...existingPlatformsData,
    [platform]: updatedPlatformData
  }

  const updatedNotes = {
    ...existingNotes,
    modash_data: {
      ...existingModashData,
      platform,
      latest_platform: platform,
      userId: modashUserId,
      modash_user_id: modashUserId,
      username: metrics.username,
      url: metrics.profileUrl,
      picture: metrics.picture,
      followers: metrics.followers,
      engagementRate: metrics.engagementRate,
      avgViews: metrics.avgViews,
      avgLikes: metrics.avgLikes,
      avgComments: metrics.avgComments,
      last_refreshed: nowIso,
      refreshed_by: refreshedBy,
      source: 'roster_panel_refresh',
      profile_snapshot: profilePayload || existingModashData.profile_snapshot || null,
      platforms: platformsData
    }
  }

  const notesString = JSON.stringify(updatedNotes)

  await transaction(async (client) => {
    // UPSERT platform metrics
    await client.query(
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
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW(), NOW())
       ON CONFLICT (influencer_id, platform) 
       DO UPDATE SET
         username = EXCLUDED.username,
         modash_user_id = EXCLUDED.modash_user_id,
         profile_url = EXCLUDED.profile_url,
         followers = EXCLUDED.followers,
         engagement_rate = EXCLUDED.engagement_rate,
         avg_views = EXCLUDED.avg_views,
         is_connected = true,
         last_synced = NOW(),
         updated_at = NOW()`,
      [
        influencerId,
        platformUpper,
        metrics.username,
        modashUserId,
        metrics.profileUrl,
        metrics.followers,
        metrics.engagementRate,
        metrics.avgViews
      ]
    )

    // Update influencer notes
    await client.query(
      'UPDATE influencers SET notes = $1, updated_at = NOW() WHERE id = $2',
      [notesString, influencerId]
    )
  })
}

/**
 * Main service function to refresh influencer analytics
 */
export async function refreshInfluencerAnalytics(
  options: RefreshAnalyticsOptions
): Promise<RefreshAnalyticsResult> {
  const { influencerId, refreshedBy, payload } = options

  // Get influencer data
  const influencer = await getInfluencerData(influencerId)

  // Parse existing notes
  const existingNotes = influencer.notes ? JSON.parse(influencer.notes) : {}

  // Determine platform
  const normalizedPlatform = (payload?.platform || existingNotes.modash_data?.platform || 'instagram').toString().toLowerCase()
  const platformUpper = normalizedPlatform.toUpperCase()

  // Resolve Modash userId
  const modashUserId = resolveUserId(payload, existingNotes, normalizedPlatform)

  console.log('🔄 Refreshing analytics for:', {
    influencerId,
    modashUserId,
    platform: normalizedPlatform
  })

  // Fetch or use provided metrics
  const { metrics: rawMetrics, profile: profilePayload } = await fetchOrUseMetrics(
    modashUserId,
    normalizedPlatform,
    payload?.metrics
  )

  // Normalize metrics
  const metrics = normalizeModashMetrics(
    rawMetrics,
    {
      username: profilePayload?.username || existingNotes.modash_data?.username || influencer.display_name,
      profileUrl: profilePayload?.url || existingNotes.modash_data?.url || null,
      picture: profilePayload?.picture || existingNotes.modash_data?.picture || null
    }
  )

  // Update database
  await updateInfluencerData(
    influencerId,
    normalizedPlatform,
    platformUpper,
    metrics,
    modashUserId,
    profilePayload,
    existingNotes,
    influencer,
    refreshedBy
  )

  // Recalculate aggregate totals (outside transaction - background update)
  await updateInfluencerAggregatedStats(influencerId)

  // Get updated totals
  const updatedTotals = await queryOne<{
    total_followers: number
    total_engagement_rate: number
    total_avg_views: number
  }>(
    'SELECT total_followers, total_engagement_rate, total_avg_views FROM influencers WHERE id = $1',
    [influencerId]
  )

  const nowIso = new Date().toISOString()

  console.log('✅ Successfully refreshed analytics for influencer:', influencerId)

  return {
    influencerId,
    platform: platformUpper,
    modashUserId,
    metrics: {
      followers: metrics.followers,
      engagementRate: metrics.engagementRate,
      avgViews: metrics.avgViews,
      avgLikes: metrics.avgLikes,
      avgComments: metrics.avgComments
    },
    totals: updatedTotals,
    lastRefreshed: nowIso
  }
}

