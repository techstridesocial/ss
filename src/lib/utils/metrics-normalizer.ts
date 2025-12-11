/**
 * Metrics Normalizer
 * 
 * Normalizes raw Modash API metrics into a consistent, type-safe format.
 * Handles various field name variations and type coercion.
 */

/**
 * Raw metrics from Modash API (can have various field name formats)
 */
export interface RawModashMetrics {
  followers?: number | string | null
  engagementRate?: number | string | null
  engagement_rate?: number | string | null
  avgViews?: number | string | null
  averageViews?: number | string | null
  avg_views?: number | string | null
  avg_reels_views?: number | string | null
  avgLikes?: number | string | null
  avg_likes?: number | string | null
  avgComments?: number | string | null
  avg_comments?: number | string | null
  username?: string | null
  handle?: string | null
  url?: string | null
  profileUrl?: string | null
  picture?: string | null
}

/**
 * Normalized metrics with consistent types and field names
 */
export interface NormalizedMetrics {
  followers: number
  engagementRate: number
  avgViews: number
  avgLikes: number | null
  avgComments: number | null
  username: string
  profileUrl: string | null
  picture: string | null
}

/**
 * Fallback values for normalization
 */
export interface MetricsFallbacks {
  username?: string
  profileUrl?: string | null
  picture?: string | null
  followers?: number
  engagementRate?: number
  avgViews?: number
}

/**
 * Normalize raw Modash metrics into a consistent format
 * 
 * @param raw - Raw metrics from Modash API or request payload
 * @param fallbacks - Optional fallback values if fields are missing
 * @returns Normalized metrics with consistent types
 */
export function normalizeModashMetrics(
  raw: RawModashMetrics | null | undefined,
  fallbacks?: MetricsFallbacks
): NormalizedMetrics {
  if (!raw) {
    return {
      followers: fallbacks?.followers ?? 0,
      engagementRate: fallbacks?.engagementRate ?? 0,
      avgViews: fallbacks?.avgViews ?? 0,
      avgLikes: null,
      avgComments: null,
      username: fallbacks?.username ?? 'unknown',
      profileUrl: fallbacks?.profileUrl ?? null,
      picture: fallbacks?.picture ?? null
    }
  }

  return {
    followers: coerceNumber(
      raw.followers
    ) ?? fallbacks?.followers ?? 0,
    
    engagementRate: coerceNumber(
      raw.engagementRate,
      raw.engagement_rate
    ) ?? fallbacks?.engagementRate ?? 0,
    
    avgViews: coerceNumber(
      raw.avgViews,
      raw.averageViews,
      raw.avg_views,
      raw.avg_reels_views
    ) ?? fallbacks?.avgViews ?? 0,
    
    avgLikes: coerceNumber(
      raw.avgLikes,
      raw.avg_likes
    ),
    
    avgComments: coerceNumber(
      raw.avgComments,
      raw.avg_comments
    ),
    
    username: coerceString(
      raw.username,
      raw.handle
    ) ?? fallbacks?.username ?? 'unknown',
    
    profileUrl: coerceString(
      raw.url,
      raw.profileUrl
    ) ?? fallbacks?.profileUrl ?? null,
    
    picture: coerceString(
      raw.picture
    ) ?? fallbacks?.picture ?? null
  }
}

/**
 * Coerce a value to a number, trying multiple values in order
 * Returns null if no valid number found
 * 
 * @param values - Values to try (in priority order)
 * @returns Number or null
 */
function coerceNumber(...values: any[]): number | null {
  for (const val of values) {
    if (val === null || val === undefined) continue
    
    const num = Number(val)
    if (!isNaN(num) && isFinite(num)) {
      return num
    }
  }
  return null
}

/**
 * Coerce a value to a string, trying multiple values in order
 * Returns null if no valid string found
 * 
 * @param values - Values to try (in priority order)
 * @returns String or null
 */
function coerceString(...values: any[]): string | null {
  for (const val of values) {
    if (val && typeof val === 'string' && val.trim()) {
      return val.trim()
    }
  }
  return null
}
