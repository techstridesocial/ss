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
  
  try {
    const whereConditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Build WHERE conditions based on filters
    if (filters.search) {
      whereConditions.push(`(
        i.display_name ILIKE $${paramIndex} OR
        up.first_name ILIKE $${paramIndex} OR
        up.last_name ILIKE $${paramIndex} OR
        EXISTS (
          SELECT 1 FROM unnest(i.niches) AS niche
          WHERE niche ILIKE $${paramIndex}
        )
      )`)
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    if (filters.niches && filters.niches.length > 0) {
      const nichePlaceholders = filters.niches.map((_, i) => `$${paramIndex + i}`).join(',')
      whereConditions.push(`EXISTS (
        SELECT 1 FROM unnest(i.niches) AS niche
        WHERE niche IN (${nichePlaceholders})
      )`)
      params.push(...filters.niches)
      paramIndex += filters.niches.length
    }

    if (filters.platforms && filters.platforms.length > 0) {
      const platformPlaceholders = filters.platforms.map((_, i) => `$${paramIndex + i}`).join(',')
      whereConditions.push(`EXISTS (
        SELECT 1 FROM influencer_platforms ip
        WHERE ip.influencer_id = i.id
        AND ip.platform IN (${platformPlaceholders})
      )`)
      params.push(...filters.platforms)
      paramIndex += filters.platforms.length
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

    if (filters.is_active !== undefined) {
      whereConditions.push(`u.status = $${paramIndex}`)
      params.push(filters.is_active ? 'ACTIVE' : 'INACTIVE')
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''

    // Count total matching records
    const countResult = await queryOne<{ count: number }>(`
      SELECT COUNT(*)::int as count
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ${whereClause}
    `, params)
    const total = countResult?.count || 0

    // Calculate pagination
    const offset = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    // Fetch paginated results
    params.push(limit, offset)
    const influencers = await query<any>(`
      SELECT 
        i.id,
        i.user_id,
        i.display_name,
        i.influencer_type,
        i.content_type,
        i.agency_name,
        i.tier,
        i.total_followers,
        i.total_engagement_rate,
        i.total_avg_views,
        i.estimated_promotion_views,
        i.assigned_to,
        i.niches,
        i.created_at,
        i.updated_at,
        up.first_name,
        up.last_name,
        up.bio,
        up.location_country,
        up.location_city,
        up.avatar_url,
        up.phone,
        up.is_onboarded,
        u.email,
        u.status as user_status,
        -- Get platform count
        (
          SELECT COUNT(*)::int 
          FROM influencer_platforms ip_count 
          WHERE ip_count.influencer_id = i.id
        ) as platform_count,
        -- Get platforms as array
        (
          SELECT array_agg(DISTINCT ip_plat.platform ORDER BY ip_plat.platform)
          FROM influencer_platforms ip_plat
          WHERE ip_plat.influencer_id = i.id
        ) as platforms
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params)

    // Transform to match expected type
    const transformedInfluencers: InfluencerWithProfile[] = influencers.map((inf: any) => ({
      id: inf.id,
      user_id: inf.user_id,
      display_name: inf.display_name,
      influencer_type: inf.influencer_type,
      content_type: inf.content_type,
      tier: inf.tier,
      total_followers: inf.total_followers || 0,
      total_engagement_rate: inf.total_engagement_rate || 0,
      total_avg_views: inf.total_avg_views || 0,
      estimated_promotion_views: inf.estimated_promotion_views || Math.floor((inf.total_avg_views || 0) * 0.85),
      price_per_post: null,
      is_active: inf.user_status === 'ACTIVE',
      relationship_status: null,
      assigned_to: inf.assigned_to,
      labels: [],
      notes: inf.notes || null,
      first_name: inf.first_name,
      last_name: inf.last_name,
      avatar_url: inf.avatar_url,
      location_country: inf.location_country,
      location_city: inf.location_city,
      bio: inf.bio,
      website_url: null,
      email: inf.email,
      niches: inf.niches || [],
      platforms: inf.platforms || [],
      platform_count: inf.platform_count || 0
    }))

    return {
      data: transformedInfluencers,
      total,
      page,
      limit,
      totalPages
    }

  } catch (error) {
    console.error('Error in getInfluencers:', error)
    throw error
  }
}

/**
 * Get detailed influencer information by ID
 */
export async function getInfluencerById(influencerId: string): Promise<InfluencerDetailView | null> {
  try {
    // Fetch influencer details from database
    const result = await query<any>(`
      SELECT 
        i.id,
        i.user_id,
        i.display_name,
        i.influencer_type,
        i.content_type,
        i.agency_name,
        i.tier,
        i.total_followers,
        i.total_engagement_rate,
        i.total_avg_views,
        i.estimated_promotion_views,
        i.assigned_to,
        i.notes,
        i.niches,
        i.created_at,
        i.updated_at,
        up.first_name,
        up.last_name,
        up.bio,
        up.location_country,
        up.location_city,
        up.avatar_url,
        up.phone,
        up.is_onboarded,
        up.website_url,
        u.email,
        u.status as user_status,
        u.last_login,
        -- Get platform data as JSON array
        COALESCE(
          json_agg(
            json_build_object(
              'id', ip.id,
              'platform', ip.platform,
              'username', ip.username,
              'followers', ip.followers,
              'following', ip.following,
              'engagement_rate', ip.engagement_rate,
              'avg_views', ip.avg_views,
              'avg_likes', ip.avg_likes,
              'avg_comments', ip.avg_comments,
              'last_post_date', ip.last_post_date,
              'profile_url', ip.profile_url,
              'is_verified', ip.is_verified,
              'is_connected', ip.is_connected,
              'created_at', ip.created_at,
              'updated_at', ip.updated_at
            )
          ) FILTER (WHERE ip.id IS NOT NULL),
          '[]'::json
        ) as platform_details
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE i.id = $1
      GROUP BY i.id, u.id, up.id
    `, [influencerId])

    if (result.length === 0) {
      return null
    }

    const influencer = result[0]

    // Get demographics for each platform
    const platformIds = influencer.platform_details?.map((p: any) => p.id).filter(Boolean) || []
    let demographics = null
    let audienceLocations: any[] = []
    let audienceLanguages: any[] = []
    let recentContent: any[] = []

    if (platformIds.length > 0) {
      // Get demographics for the first platform (primary platform)
      const primaryPlatformId = platformIds[0]
      
      demographics = await queryOne<any>(`
        SELECT * FROM audience_demographics 
        WHERE influencer_platform_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `, [primaryPlatformId])

      // Get audience locations for all platforms
      const locationsResult = await query<any>(`
        SELECT * FROM audience_locations 
        WHERE influencer_platform_id = ANY($1)
        ORDER BY percentage DESC
        LIMIT 10
      `, [platformIds])

      audienceLocations = locationsResult || []

      // Get audience languages for all platforms
      const languagesResult = await query<any>(`
        SELECT * FROM audience_languages 
        WHERE influencer_platform_id = ANY($1)
        ORDER BY percentage DESC
        LIMIT 10
      `, [platformIds])

      audienceLanguages = languagesResult || []

      // Get recent content for all platforms
      const contentResult = await query<any>(`
        SELECT * FROM influencer_content 
        WHERE influencer_platform_id = ANY($1)
        ORDER BY posted_at DESC
        LIMIT 10
      `, [platformIds])

      recentContent = contentResult || []
    }

    // Transform to match InfluencerDetailView type
    const transformedInfluencer: InfluencerDetailView = {
      id: influencer.id,
      user_id: influencer.user_id,
      display_name: influencer.display_name,
      influencer_type: influencer.influencer_type,
      content_type: influencer.content_type,
      tier: influencer.tier,
      total_followers: influencer.total_followers || 0,
      total_engagement_rate: influencer.total_engagement_rate || 0,
      total_avg_views: influencer.total_avg_views || 0,
      estimated_promotion_views: influencer.estimated_promotion_views || Math.floor((influencer.total_avg_views || 0) * 0.85),
      price_per_post: influencer.price_per_post || Math.floor((influencer.total_followers || 0) * 0.01),
      assigned_to: influencer.assigned_to,
      notes: influencer.notes,
      niches: influencer.niches || [],
      first_name: influencer.first_name,
      last_name: influencer.last_name,
      bio: influencer.bio,
      website_url: influencer.website_url,
      email: influencer.email,
      location_country: influencer.location_country,
      location_city: influencer.location_city,
      avatar_url: influencer.avatar_url,
      is_active: influencer.user_status === 'ACTIVE',
      relationship_status: 'ACTIVE' as const,
      labels: [],
      platform_details: Array.isArray(influencer.platform_details) 
        ? influencer.platform_details.filter((p: any) => p.id) 
        : [],
      platforms: Array.isArray(influencer.platform_details) 
        ? influencer.platform_details.map((p: any) => p.platform).filter(Boolean)
        : [],
      platform_count: Array.isArray(influencer.platform_details) 
        ? influencer.platform_details.filter((p: any) => p.id).length
        : 0,
      recent_content: recentContent,
      demographics: demographics,
      audience_locations: audienceLocations,
      audience_languages: audienceLanguages,
      campaign_participation: []
    }

    return transformedInfluencer

  } catch (error) {
    console.error('Error in getInfluencerById:', error)
    throw error
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
  
  try {
    // Get total and active influencer counts
    const countsResult = await queryOne<{ total: number; active: number }>(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM users u WHERE u.id = i.user_id AND u.status = 'ACTIVE'
        ))::int as active
      FROM influencers i
    `)

    const totalInfluencers = countsResult?.total || 0
    const activeInfluencers = countsResult?.active || 0

    // Get influencers by niche (unnest niches array and count)
    const nicheResult = await query<any>(`
      SELECT 
        niche,
        COUNT(DISTINCT influencer_id)::int as count
      FROM influencers i,
      LATERAL unnest(i.niches) AS niche
      GROUP BY niche
      ORDER BY count DESC
    `)

    const influencersByNiche: Record<string, number> = {}
    nicheResult.forEach((row: any) => {
      influencersByNiche[row.niche] = row.count
    })

    // Get influencers by platform
    const platformResult = await query<any>(`
      SELECT 
        ip.platform,
        COUNT(DISTINCT ip.influencer_id)::int as count
      FROM influencer_platforms ip
      GROUP BY ip.platform
      ORDER BY count DESC
    `)

    const influencersByPlatform: Record<Platform, number> = {
      INSTAGRAM: 0,
      TIKTOK: 0,
      YOUTUBE: 0,
      TWITCH: 0,
      TWITTER: 0,
      LINKEDIN: 0
    }
    
    platformResult.forEach((row: any) => {
      if (row.platform in influencersByPlatform) {
        influencersByPlatform[row.platform as Platform] = row.count
      }
    })

    // Get average followers and engagement
    const avgResult = await queryOne<{ avg_followers: number; avg_engagement: number }>(`
      SELECT 
        COALESCE(AVG(i.total_followers), 0)::float as avg_followers,
        COALESCE(AVG(i.total_engagement_rate), 0)::float as avg_engagement
      FROM influencers i
      WHERE EXISTS (
        SELECT 1 FROM users u WHERE u.id = i.user_id AND u.status = 'ACTIVE'
      )
    `)

    return {
      totalInfluencers,
      activeInfluencers,
      influencersByNiche,
      influencersByPlatform,
      averageFollowers: Math.round(avgResult?.avg_followers || 0),
      averageEngagement: parseFloat((avgResult?.avg_engagement || 0).toFixed(2))
    }

  } catch (error) {
    console.error('Error in getInfluencerStats:', error)
    // Return empty stats on error
    return {
      totalInfluencers: 0,
      activeInfluencers: 0,
      influencersByNiche: {},
      influencersByPlatform: {
        INSTAGRAM: 0,
        TIKTOK: 0,
        YOUTUBE: 0,
        TWITCH: 0,
        TWITTER: 0,
        LINKEDIN: 0
      },
      averageFollowers: 0,
      averageEngagement: 0
    }
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

/**
 * Get all influencers currently in the roster (for filtering discovery results)
 * Returns array of platform usernames that should be excluded from discovery
 */
export async function getRosterInfluencerUsernames(): Promise<string[]> {
  try {
    // Fetch all platform usernames from active influencers in roster
    const platforms = await query<{username: string, platform: string}>(`
      SELECT DISTINCT ip.username, ip.platform
      FROM influencer_platforms ip
      JOIN influencers i ON ip.influencer_id = i.id
      JOIN users u ON i.user_id = u.id
      WHERE u.status = 'ACTIVE'
        AND ip.username IS NOT NULL
        AND ip.username != ''
    `)
    
    // Return array of usernames with @ prefix variations
    // Discovery API may search with or without @ prefix
    const usernames: string[] = []
    platforms.forEach(p => {
      const username = p.username.trim()
      if (username) {
        // Add both with and without @ prefix
        usernames.push(username)
        if (!username.startsWith('@')) {
          usernames.push(`@${username}`)
        }
      }
    })
    
    console.log(`Found ${usernames.length} roster usernames to exclude from discovery`)
    return usernames

  } catch (error) {
    console.error('Error in getRosterInfluencerUsernames:', error)
    // Return empty array on error to avoid blocking discovery
    return []
  }
}

/**
 * Create influencer profile during onboarding
 */
export async function createInfluencerProfile(
  user_id: string,
  profileData: {
    display_name: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    location: string;
    website?: string;
    profile_picture?: string;
  }
): Promise<DatabaseResponse<Influencer>> {
  try {
    const result = await transaction(async (client) => {
      // Update or insert user profile
      await client.query(`
        INSERT INTO user_profiles (
          user_id, first_name, last_name, avatar_url, phone, location_country, is_onboarded
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          first_name = $2,
          last_name = $3,
          avatar_url = $4,
          phone = $5,
          location_country = $6,
          is_onboarded = $7,
          updated_at = NOW()
      `, [
        user_id,
        profileData.first_name,
        profileData.last_name,
        profileData.profile_picture || null,
        profileData.phone_number || null,
        profileData.location,
        true
      ])

      // Create or update influencer record
      const influencerResult = await client.query(`
        INSERT INTO influencers (
          user_id, display_name, onboarding_completed, ready_for_campaigns
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET 
          display_name = $2,
          onboarding_completed = $3,
          updated_at = NOW()
        RETURNING *
      `, [
        user_id,
        profileData.display_name,
        true,
        false // Not ready for campaigns until staff approval
      ])

      // Update user status to indicate onboarding is complete
      await client.query(`
        UPDATE users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = $1
      `, [user_id])

      return influencerResult.rows[0]
    })

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('Error in createInfluencerProfile:', error)
    return {
      success: false,
      error: 'Failed to create influencer profile'
    }
  }
} 