import { query, queryOne, transaction } from '../connection'
import { 
  Influencer,
  InfluencerWithProfile,
  InfluencerDetailView,
  InfluencerFilters,
  PaginatedResponse,
  DatabaseResponse,
  Platform
} from '../../../types/database'

// =============================================
// Influencer Query Functions
// =============================================

/**
 * Get all influencers with optional filtering and pagination
 */
export async function getInfluencers(
  filters: InfluencerFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<InfluencerWithProfile>> {
  const offset = (page - 1) * limit
  
  let whereConditions: string[] = []
  let params: any[] = []
  let paramIndex = 1

  // Build dynamic WHERE conditions
  if (filters.search) {
    whereConditions.push(`
      (i.display_name ILIKE $${paramIndex} 
       OR up.first_name ILIKE $${paramIndex} 
       OR up.last_name ILIKE $${paramIndex}
       OR u.email ILIKE $${paramIndex})
    `)
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters.niches && filters.niches.length > 0) {
    whereConditions.push(`i.niches && $${paramIndex}`)
    params.push(filters.niches)
    paramIndex++
  }

  if (filters.platforms && filters.platforms.length > 0) {
    whereConditions.push(`
      EXISTS (
        SELECT 1 FROM influencer_platforms ip 
        WHERE ip.influencer_id = i.id 
        AND ip.platform = ANY($${paramIndex})
      )
    `)
    params.push(filters.platforms)
    paramIndex++
  }

  if (filters.follower_min !== undefined) {
    whereConditions.push(`i.total_followers >= $${paramIndex}`)
    params.push(filters.follower_min)
    paramIndex++
  }

  if (filters.follower_max !== undefined) {
    whereConditions.push(`i.total_followers <= $${paramIndex}`)
    params.push(filters.follower_max)
    paramIndex++
  }

  if (filters.engagement_min !== undefined) {
    whereConditions.push(`i.total_engagement_rate >= $${paramIndex}`)
    params.push(filters.engagement_min)
    paramIndex++
  }

  if (filters.engagement_max !== undefined) {
    whereConditions.push(`i.total_engagement_rate <= $${paramIndex}`)
    params.push(filters.engagement_max)
    paramIndex++
  }

  if (filters.location_countries && filters.location_countries.length > 0) {
    whereConditions.push(`up.location_country = ANY($${paramIndex})`)
    params.push(filters.location_countries)
    paramIndex++
  }

  if (filters.is_active !== undefined) {
    whereConditions.push(`i.is_active = $${paramIndex}`)
    params.push(filters.is_active)
    paramIndex++
  }

  if (filters.price_min !== undefined) {
    whereConditions.push(`i.price_per_post >= $${paramIndex}`)
    params.push(filters.price_min)
    paramIndex++
  }

  if (filters.price_max !== undefined) {
    whereConditions.push(`i.price_per_post <= $${paramIndex}`)
    params.push(filters.price_max)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : ''

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT i.id) as total
    FROM influencers i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ${whereClause}
  `
  const countResult = await queryOne<{ total: string }>(countQuery, params)
  const total = parseInt(countResult?.total || '0')

  // Get paginated results
  const dataQuery = `
    SELECT 
      i.id,
      i.user_id,
      i.display_name,
      i.niches,
      i.total_followers,
      i.total_engagement_rate,
      i.total_avg_views,
      i.estimated_promotion_views,
      i.price_per_post,
      i.is_active,
      up.first_name,
      up.last_name,
      up.avatar_url,
      up.location_country,
      up.location_city,
      -- Get platforms as array
      COALESCE(
        (SELECT array_agg(DISTINCT ip.platform) 
         FROM influencer_platforms ip 
         WHERE ip.influencer_id = i.id), 
        ARRAY[]::text[]
      ) as platforms,
      -- Get platform count
      COALESCE(
        (SELECT COUNT(DISTINCT ip.platform) 
         FROM influencer_platforms ip 
         WHERE ip.influencer_id = i.id), 
        0
      ) as platform_count
    FROM influencers i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ${whereClause}
    ORDER BY i.total_followers DESC, i.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `
  params.push(limit, offset)

  const rows = await query<any>(dataQuery, params)
  
  const influencers: InfluencerWithProfile[] = rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    display_name: row.display_name,
    niches: row.niches,
    total_followers: row.total_followers,
    total_engagement_rate: row.total_engagement_rate,
    total_avg_views: row.total_avg_views,
    estimated_promotion_views: row.estimated_promotion_views,
    price_per_post: row.price_per_post,
    is_active: row.is_active,
    first_name: row.first_name,
    last_name: row.last_name,
    avatar_url: row.avatar_url,
    location_country: row.location_country,
    location_city: row.location_city,
    platforms: row.platforms,
    platform_count: row.platform_count
  }))

  return {
    data: influencers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}

/**
 * Get detailed influencer information by ID
 */
export async function getInfluencerById(influencerId: string): Promise<InfluencerDetailView | null> {
  const sql = `
    SELECT 
      i.*,
      up.first_name,
      up.last_name,
      up.avatar_url,
      up.location_country,
      up.location_city,
      -- Get platforms as array
      COALESCE(
        (SELECT array_agg(DISTINCT ip.platform) 
         FROM influencer_platforms ip 
         WHERE ip.influencer_id = i.id), 
        ARRAY[]::text[]
      ) as platforms,
      -- Get platform count
      COALESCE(
        (SELECT COUNT(DISTINCT ip.platform) 
         FROM influencer_platforms ip 
         WHERE ip.influencer_id = i.id), 
        0
      ) as platform_count
    FROM influencers i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE i.id = $1
  `
  
  const row = await queryOne<any>(sql, [influencerId])
  
  if (!row) return null

  // Get platform details
  const platformDetails = await query<any>(
    'SELECT * FROM influencer_platforms WHERE influencer_id = $1 ORDER BY followers DESC',
    [influencerId]
  )

  // Get recent content (from all platforms)
  const recentContent = await query<any>(
    `SELECT ic.*, ip.platform, ip.username
     FROM influencer_content ic
     JOIN influencer_platforms ip ON ic.influencer_platform_id = ip.id
     WHERE ip.influencer_id = $1
     ORDER BY ic.posted_at DESC
     LIMIT 10`,
    [influencerId]
  )

  // Get demographics (aggregated from all platforms)
  const demographics = await queryOne<any>(
    `SELECT 
       AVG(age_13_17) as age_13_17,
       AVG(age_18_24) as age_18_24,
       AVG(age_25_34) as age_25_34,
       AVG(age_35_44) as age_35_44,
       AVG(age_45_54) as age_45_54,
       AVG(age_55_plus) as age_55_plus,
       AVG(gender_male) as gender_male,
       AVG(gender_female) as gender_female,
       AVG(gender_other) as gender_other,
       MAX(updated_at) as updated_at
     FROM audience_demographics ad
     JOIN influencer_platforms ip ON ad.influencer_platform_id = ip.id
     WHERE ip.influencer_id = $1`,
    [influencerId]
  )

  // Get audience locations (top countries)
  const audienceLocations = await query<any>(
    `SELECT 
       country_name,
       country_code,
       AVG(percentage) as percentage
     FROM audience_locations al
     JOIN influencer_platforms ip ON al.influencer_platform_id = ip.id
     WHERE ip.influencer_id = $1
     GROUP BY country_name, country_code
     ORDER BY percentage DESC
     LIMIT 10`,
    [influencerId]
  )

  // Get audience languages
  const audienceLanguages = await query<any>(
    `SELECT 
       language_name,
       language_code,
       AVG(percentage) as percentage
     FROM audience_languages al
     JOIN influencer_platforms ip ON al.influencer_platform_id = ip.id
     WHERE ip.influencer_id = $1
     GROUP BY language_name, language_code
     ORDER BY percentage DESC
     LIMIT 10`,
    [influencerId]
  )

  // Get campaign participation history
  const campaignParticipation = await query<any>(
    `SELECT ci.*, c.name as campaign_name, c.status as campaign_status
     FROM campaign_influencers ci
     JOIN campaigns c ON ci.campaign_id = c.id
     WHERE ci.influencer_id = $1
     ORDER BY ci.created_at DESC`,
    [influencerId]
  )

  return {
    id: row.id,
    user_id: row.user_id,
    display_name: row.display_name,
    niches: row.niches,
    total_followers: row.total_followers,
    total_engagement_rate: row.total_engagement_rate,
    total_avg_views: row.total_avg_views,
    estimated_promotion_views: row.estimated_promotion_views,
    price_per_post: row.price_per_post,
    is_active: row.is_active,
    first_name: row.first_name,
    last_name: row.last_name,
    avatar_url: row.avatar_url,
    location_country: row.location_country,
    location_city: row.location_city,
    platforms: row.platforms,
    platform_count: row.platform_count,
    platform_details: platformDetails,
    recent_content: recentContent,
    demographics: demographics,
    audience_locations: audienceLocations,
    audience_languages: audienceLanguages,
    campaign_participation: campaignParticipation
  }
}

/**
 * Update influencer status (active/inactive)
 */
export async function updateInfluencerStatus(
  influencerId: string,
  isActive: boolean
): Promise<DatabaseResponse<Influencer>> {
  try {
    const sql = `
      UPDATE influencers 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `
    
    const influencer = await queryOne<Influencer>(sql, [isActive, influencerId])
    
    if (!influencer) {
      return {
        success: false,
        error: 'Influencer not found'
      }
    }

    return {
      success: true,
      data: influencer,
      message: `Influencer ${isActive ? 'activated' : 'deactivated'} successfully`
    }
  } catch (error) {
    console.error('Error updating influencer status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update influencer status'
    }
  }
}

/**
 * Update influencer niches
 */
export async function updateInfluencerNiches(
  influencerId: string,
  niches: string[]
): Promise<DatabaseResponse<Influencer>> {
  try {
    const sql = `
      UPDATE influencers 
      SET niches = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `
    
    const influencer = await queryOne<Influencer>(sql, [niches, influencerId])
    
    if (!influencer) {
      return {
        success: false,
        error: 'Influencer not found'
      }
    }

    return {
      success: true,
      data: influencer,
      message: 'Influencer niches updated successfully'
    }
  } catch (error) {
    console.error('Error updating influencer niches:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update influencer niches'
    }
  }
}

/**
 * Get influencer statistics for dashboard
 */
export async function getInfluencerStats(): Promise<{
  totalInfluencers: number;
  activeInfluencers: number;
  influencersByNiche: Record<string, number>;
  influencersByPlatform: Record<Platform, number>;
  averageFollowers: number;
  averageEngagement: number;
}> {
  const totalResult = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM influencers'
  )

  const activeResult = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM influencers WHERE is_active = true'
  )

  const nicheResult = await query<{ niche: string; count: string }>(
    `SELECT 
       unnest(niches) as niche,
       COUNT(*) as count
     FROM influencers 
     WHERE is_active = true
     GROUP BY niche
     ORDER BY count DESC
     LIMIT 10`
  )

  const platformResult = await query<{ platform: Platform; count: string }>(
    `SELECT 
       platform,
       COUNT(DISTINCT influencer_id) as count
     FROM influencer_platforms
     GROUP BY platform`
  )

  const averagesResult = await queryOne<{ avg_followers: string; avg_engagement: string }>(
    `SELECT 
       AVG(total_followers) as avg_followers,
       AVG(total_engagement_rate) as avg_engagement
     FROM influencers 
     WHERE is_active = true`
  )

  const influencersByNiche: Record<string, number> = {}
  for (const row of nicheResult) {
    influencersByNiche[row.niche] = parseInt(row.count)
  }

  const influencersByPlatform: Record<Platform, number> = {
    INSTAGRAM: 0,
    TIKTOK: 0,
    YOUTUBE: 0,
    TWITCH: 0,
    TWITTER: 0,
    LINKEDIN: 0
  }
  for (const row of platformResult) {
    influencersByPlatform[row.platform] = parseInt(row.count)
  }

  return {
    totalInfluencers: parseInt(totalResult?.count || '0'),
    activeInfluencers: parseInt(activeResult?.count || '0'),
    influencersByNiche,
    influencersByPlatform,
    averageFollowers: parseInt(averagesResult?.avg_followers || '0'),
    averageEngagement: parseFloat(averagesResult?.avg_engagement || '0')
  }
}

/**
 * Get platform-specific metrics for an influencer
 */
export async function getInfluencerPlatformMetrics(
  influencerId: string,
  platform: Platform
): Promise<any> {
  const platformData = await queryOne<any>(
    'SELECT * FROM influencer_platforms WHERE influencer_id = $1 AND platform = $2',
    [influencerId, platform]
  )

  if (!platformData) return null

  // Get demographics for this platform
  const demographics = await queryOne<any>(
    'SELECT * FROM audience_demographics WHERE influencer_platform_id = $1',
    [platformData.id]
  )

  // Get recent content for this platform
  const recentContent = await query<any>(
    'SELECT * FROM influencer_content WHERE influencer_platform_id = $1 ORDER BY posted_at DESC LIMIT 5',
    [platformData.id]
  )

  // Get audience locations
  const audienceLocations = await query<any>(
    'SELECT * FROM audience_locations WHERE influencer_platform_id = $1 ORDER BY percentage DESC LIMIT 10',
    [platformData.id]
  )

  // Get audience languages
  const audienceLanguages = await query<any>(
    'SELECT * FROM audience_languages WHERE influencer_platform_id = $1 ORDER BY percentage DESC LIMIT 10',
    [platformData.id]
  )

  return {
    platform: platformData,
    demographics,
    recent_content: recentContent,
    audience_locations: audienceLocations,
    audience_languages: audienceLanguages
  }
} 