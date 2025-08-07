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

const MOCK_INFLUENCERS: any[] = [
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
    // @ts-ignore - Temporary mock data type bypass
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.display_name.toLowerCase().includes(searchLower) ||
      inf.first_name?.toLowerCase().includes(searchLower) ||
      inf.last_name?.toLowerCase().includes(searchLower) ||
      inf.niches.some((niche: any) => niche.toLowerCase().includes(searchLower))
    )
  }
  
  if (filters.niches && filters.niches.length > 0) {
    // @ts-ignore - Temporary mock data type bypass
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.niches.some((niche: any) => filters.niches!.includes(niche))
    )
  }
  
  if (filters.platforms && filters.platforms.length > 0) {
    // @ts-ignore - Temporary mock data type bypass
    filteredInfluencers = filteredInfluencers.filter(inf => 
      inf.platforms.some((platform: any) => filters.platforms!.includes(platform as Platform))
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
  // TEMPORARY: Use mock data instead of database
  console.log('getInfluencerById: Using mock data (database not yet set up)')
  
  // Find the basic influencer data
  const basicInfluencer = MOCK_INFLUENCERS.find(inf => inf.id === influencerId)
  if (!basicInfluencer) return null
  
  // Generate detailed mock data
  const mockDetailedInfluencer: InfluencerDetailView = {
    ...basicInfluencer,
    price_per_post: basicInfluencer.price_per_post || Math.floor(basicInfluencer.total_followers * 0.01),
    
    // Add missing profile properties
    bio: basicInfluencer.bio || `${basicInfluencer.display_name} is a passionate content creator specializing in ${basicInfluencer.niches.join(', ').toLowerCase()}. Creating authentic content and building meaningful connections with followers.`,
    website_url: basicInfluencer.website_url || `https://${basicInfluencer.display_name.toLowerCase().replace(' ', '')}.com`,
    email: `contact@${basicInfluencer.display_name.toLowerCase().replace(' ', '')}.com`,
    
    // CRM fields
    relationship_status: 'ACTIVE',
    assigned_to: null,
    labels: [],
    notes: null,
    priority_score: 7.5,
    last_contacted: null,
    
    // Generate platform details
    platform_details: basicInfluencer.platforms.map((platform: any, index: number) => ({
      id: `platform_${basicInfluencer.id}_${index}`,
      influencer_id: basicInfluencer.id,
      platform,
      username: `${basicInfluencer.display_name.toLowerCase().replace(' ', '')}${index > 0 ? index + 1 : ''}`,
      followers: Math.floor(basicInfluencer.total_followers / basicInfluencer.platform_count),
      following: Math.floor(Math.random() * 2000) + 500,
      engagement_rate: basicInfluencer.total_engagement_rate + (Math.random() - 0.5),
      avg_views: Math.floor(basicInfluencer.total_avg_views / basicInfluencer.platform_count),
      avg_likes: Math.floor(basicInfluencer.total_avg_views * 0.1),
      avg_comments: Math.floor(basicInfluencer.total_avg_views * 0.02),
      last_post_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      profile_url: `https://${platform.toLowerCase()}.com/${basicInfluencer.display_name.toLowerCase().replace(' ', '')}`,
      is_verified: Math.random() > 0.7,
      is_connected: true,
      created_at: new Date(),
      updated_at: new Date()
    })),
    
    // Mock recent content
    recent_content: [
      {
        id: 'content_1',
        influencer_platform_id: 'plat_1',
        post_url: 'https://instagram.com/p/abc123',
        thumbnail_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
        caption: 'Beautiful sunset at the beach! 🌅 #lifestyle #travel',
        views: 45000,
        likes: 4200,
        comments: 156,
        shares: 23,
        posted_at: new Date('2024-01-15'),
        created_at: new Date()
      },
      {
        id: 'content_2',
        influencer_platform_id: 'plat_1',
        post_url: 'https://instagram.com/p/def456',
        thumbnail_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop',
        caption: 'New outfit inspiration for spring! 🌸 #fashion #ootd',
        views: 38000,
        likes: 3800,
        comments: 142,
        shares: 31,
        posted_at: new Date('2024-01-12'),
        created_at: new Date()
      }
    ],
    
    // Mock demographics
    demographics: {
      id: 'demo_1',
      influencer_platform_id: 'plat_1',
      age_13_17: 5.2,
      age_18_24: 32.1,
      age_25_34: 28.7,
      age_35_44: 18.4,
      age_45_54: 12.1,
      age_55_plus: 3.5,
      gender_male: 45.3,
      gender_female: 52.2,
      gender_other: 2.5,
      updated_at: new Date()
    },
    
    // Mock audience locations
    audience_locations: [
      {
        id: 'loc_1',
        influencer_platform_id: 'plat_1',
        country_name: 'United Kingdom',
        country_code: 'GB',
        percentage: 65.2
      },
      {
        id: 'loc_2',
        influencer_platform_id: 'plat_1',
        country_name: 'United States',
        country_code: 'US',
        percentage: 18.7
      },
      {
        id: 'loc_3',
        influencer_platform_id: 'plat_1',
        country_name: 'Canada',
        country_code: 'CA',
        percentage: 8.1
      }
    ],
    
    // Mock audience languages
    audience_languages: [
      {
        id: 'lang_1',
        influencer_platform_id: 'plat_1',
        language_name: 'English',
        language_code: 'en',
        percentage: 85.4
      },
      {
        id: 'lang_2',
        influencer_platform_id: 'plat_1',
        language_name: 'Spanish',
        language_code: 'es',
        percentage: 8.2
      },
      {
        id: 'lang_3',
        influencer_platform_id: 'plat_1',
        language_name: 'French',
        language_code: 'fr',
        percentage: 6.4
      }
    ],
    
    // Mock campaign participation
    campaign_participation: []
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return mockDetailedInfluencer

  /* 
  // Real database implementation (use when DB is set up):
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
  */
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

/**
 * Get all influencers currently in the roster (for filtering discovery results)
 * Returns array of platform usernames that should be excluded from discovery
 */
export async function getRosterInfluencerUsernames(): Promise<string[]> {
  // TEMPORARY: Use mock data instead of database
  console.log('getRosterInfluencerUsernames: Using mock data (database not yet set up)')
  
  // Extract platform usernames from mock data
  const rosterUsernames: string[] = []
  
  MOCK_INFLUENCERS.forEach(influencer => {
    // For mock data, generate platform usernames based on display name
    const baseUsername = influencer.display_name.toLowerCase().replace(/\s+/g, '_')
    
    // Add different username variations for different platforms
    if (influencer.platforms.includes('INSTAGRAM')) {
      rosterUsernames.push(`@${baseUsername}`)
      rosterUsernames.push(baseUsername)
    }
    if (influencer.platforms.includes('TIKTOK')) {
      rosterUsernames.push(`@${baseUsername}_tiktok`)
      rosterUsernames.push(`${baseUsername}_tiktok`)
    }
    if (influencer.platforms.includes('YOUTUBE')) {
      rosterUsernames.push(`@${baseUsername}_yt`)
      rosterUsernames.push(`${baseUsername}_yt`)
    }
  })
  
  console.log(`Found ${rosterUsernames.length} roster usernames to exclude from discovery`)
  return rosterUsernames

  /*
  // Real database implementation (use when DB is set up):
  const sql = `
    SELECT DISTINCT ip.username, ip.platform
    FROM influencer_platforms ip
    JOIN influencers i ON ip.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    WHERE u.role IN ('INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED')
    AND ip.username IS NOT NULL
    AND i.is_active = true
  `
  
  const platforms = await query<{username: string, platform: string}>(sql)
  
  // Return array of usernames with @ prefix variations
  const usernames: string[] = []
  platforms.forEach(p => {
    usernames.push(p.username)
    usernames.push(`@${p.username}`)
  })
  
  return usernames
  */
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