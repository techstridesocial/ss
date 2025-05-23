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
// TEMPORARY MOCK DATA (Remove when DB is ready)
// =============================================

const MOCK_INFLUENCERS: InfluencerWithProfile[] = [
  {
    id: 'inf_1',
    user_id: 'user_3',
    display_name: 'Sarah Creator',
    niches: ['Lifestyle', 'Fashion'],
    total_followers: 125000,
    total_engagement_rate: 3.8,
    total_avg_views: 45000,
    estimated_promotion_views: 38250,
    price_per_post: 850,
    is_active: true,
    first_name: 'Sarah',
    last_name: 'Creator',
    avatar_url: null,
    location_country: 'United Kingdom',
    location_city: 'Birmingham',
    platforms: ['INSTAGRAM', 'TIKTOK'],
    platform_count: 2
  },
  {
    id: 'inf_2',
    user_id: 'user_4',
    display_name: 'Mike Tech',
    niches: ['Tech', 'Gaming'],
    total_followers: 89000,
    total_engagement_rate: 4.2,
    total_avg_views: 32000,
    estimated_promotion_views: 27200,
    price_per_post: 650,
    is_active: true,
    first_name: 'Mike',
    last_name: 'Content',
    avatar_url: null,
    location_country: 'United States',
    location_city: 'New York',
    platforms: ['YOUTUBE', 'TWITCH'],
    platform_count: 2
  },
  {
    id: 'inf_3',
    user_id: 'user_6',
    display_name: 'FitnessFiona',
    niches: ['Fitness', 'Health'],
    total_followers: 156000,
    total_engagement_rate: 5.1,
    total_avg_views: 62000,
    estimated_promotion_views: 52700,
    price_per_post: 920,
    is_active: true,
    first_name: 'Fiona',
    last_name: 'Fit',
    avatar_url: null,
    location_country: 'Australia',
    location_city: 'Sydney',
    platforms: ['INSTAGRAM', 'YOUTUBE'],
    platform_count: 2
  },
  {
    id: 'inf_4',
    user_id: 'user_7',
    display_name: 'BeautyByBella',
    niches: ['Beauty', 'Skincare'],
    total_followers: 234000,
    total_engagement_rate: 3.6,
    total_avg_views: 78000,
    estimated_promotion_views: 66300,
    price_per_post: 1200,
    is_active: true,
    first_name: 'Bella',
    last_name: 'Beauty',
    avatar_url: null,
    location_country: 'United Kingdom',
    location_city: 'London',
    platforms: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
    platform_count: 3
  },
  {
    id: 'inf_5',
    user_id: 'user_8',
    display_name: 'TravelWithTom',
    niches: ['Travel', 'Lifestyle'],
    total_followers: 67000,
    total_engagement_rate: 2.9,
    total_avg_views: 25000,
    estimated_promotion_views: 21250,
    price_per_post: 450,
    is_active: false,
    first_name: 'Tom',
    last_name: 'Explorer',
    avatar_url: null,
    location_country: 'Canada',
    location_city: 'Toronto',
    platforms: ['INSTAGRAM'],
    platform_count: 1
  }
]

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
  
  // TEMPORARY: Use mock data instead of database
  console.log('getInfluencers: Using mock data (database not yet set up)')
  
  let filteredInfluencers = [...MOCK_INFLUENCERS]
  
  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.display_name.toLowerCase().includes(searchLower) ||
      inf.first_name?.toLowerCase().includes(searchLower) ||
      inf.last_name?.toLowerCase().includes(searchLower) ||
      inf.niches.some(niche => niche.toLowerCase().includes(searchLower))
    )
  }
  
  if (filters.niches && filters.niches.length > 0) {
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.niches.some(niche => filters.niches!.includes(niche))
    )
  }
  
  if (filters.platforms && filters.platforms.length > 0) {
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.platforms.some(platform => filters.platforms!.includes(platform as Platform))
    )
  }
  
  if (filters.follower_min !== undefined) {
    filteredInfluencers = filteredInfluencers.filter(inf => inf.total_followers >= filters.follower_min!)
  }
  
  if (filters.follower_max !== undefined) {
    filteredInfluencers = filteredInfluencers.filter(inf => inf.total_followers <= filters.follower_max!)
  }
  
  if (filters.is_active !== undefined) {
    filteredInfluencers = filteredInfluencers.filter(inf => inf.is_active === filters.is_active)
  }
  
  // Apply pagination
  const total = filteredInfluencers.length
  const offset = (page - 1) * limit
  const paginatedInfluencers = filteredInfluencers.slice(offset, offset + limit)
  
  return {
    data: paginatedInfluencers,
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
  
  // TEMPORARY: Use mock data instead of database
  console.log('getInfluencerStats: Using mock data (database not yet set up)')

  const influencersByNiche: Record<string, number> = {
    'Lifestyle': 45,
    'Fashion': 38,
    'Beauty': 32,
    'Fitness': 28,
    'Tech': 15,
    'Gaming': 12
  }

  const influencersByPlatform: Record<Platform, number> = {
    INSTAGRAM: 89,
    TIKTOK: 67,
    YOUTUBE: 43,
    TWITCH: 8,
    TWITTER: 23,
    LINKEDIN: 5
  }

  return {
    totalInfluencers: 189,
    activeInfluencers: 145,
    influencersByNiche,
    influencersByPlatform,
    averageFollowers: 125000,
    averageEngagement: 3.2
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