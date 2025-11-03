import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, transaction } from '@/lib/db/connection'
import { getCurrentUserRole } from '@/lib/auth/roles'

interface CreateInfluencerRequest {
  display_name: string
  first_name: string
  last_name: string
  email?: string
  bio?: string
  location_country?: string
  location_city?: string
  website_url?: string
  niches: string[]
  influencer_type: 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER'
  content_type?: 'STANDARD' | 'UGC' | 'SEEDING'
  tier?: 'GOLD' | 'SILVER'
  average_views?: number
  estimated_followers?: number
  agency_name?: string
  // Platform usernames
  instagram_username?: string
  tiktok_username?: string
  youtube_username?: string
  // From discovery data
  discovered_platform?: 'instagram' | 'tiktok' | 'youtube'
  discovered_engagement_rate?: number
}

// Mock data removed - using real database queries only

// GET - Fetch influencers (for roster page)
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN', 'BRAND'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Access denied. Only staff, admin, and brand users can view influencers' 
      }, { status: 403 })
    }

    // Fetch real influencers from database
    console.log('📋 Fetching real influencers from database')
    
    const influencers = await query(`
      SELECT 
        i.id,
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
        u.last_login,
        -- Get platform data
        COALESCE(
          json_agg(
            json_build_object(
              'platform', ip.platform,
              'username', ip.username,
              'followers', ip.followers,
              'engagement_rate', ip.engagement_rate,
              'avg_views', ip.avg_views,
              'is_connected', ip.is_connected,
              'profile_url', ip.profile_url
            )
          ) FILTER (WHERE ip.id IS NOT NULL),
          '[]'::json
        ) as platforms
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
      GROUP BY i.id, u.id, up.id
      ORDER BY i.created_at DESC
    `)

    console.log(`✅ Loaded ${influencers.length} real influencers from database`)
    
    // Transform data to match frontend expectations
    const transformedInfluencers = influencers.map(inf => ({
      ...inf,
      // Ensure platforms is always an array
      platforms: Array.isArray(inf.platforms) ? inf.platforms : [],
      // Add platform_count for compatibility
      platform_count: Array.isArray(inf.platforms) ? inf.platforms.length : 0,
      // Ensure boolean fields are properly typed
      is_active: inf.user_status === 'ACTIVE',
      // Add estimated_promotion_views if missing
      estimated_promotion_views: inf.estimated_promotion_views || Math.floor((inf.total_avg_views || 0) * 0.85)
    }))
    
    return NextResponse.json({
      success: true,
      data: transformedInfluencers,
      count: transformedInfluencers.length
    })

  } catch (error) {
    console.error('❌ Error fetching influencers:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch influencers'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        errorMessage = 'Database connection failed. Please try again.'
        statusCode = 503
      } else if (error.message.includes('permission')) {
        errorMessage = 'Database permission error. Please contact support.'
        statusCode = 500
      } else {
        errorMessage = `Database error: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: statusCode }
    )
  }
}

// POST - Create new influencer
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Only staff can add influencers' 
      }, { status: 403 })
    }

    const data: CreateInfluencerRequest = await request.json()

    // Validation
    if (!data.display_name || !data.first_name || !data.influencer_type) {
      return NextResponse.json(
        { error: 'Missing required fields: display_name, first_name, influencer_type' },
        { status: 400 }
      )
    }

    const _result = await transaction(async (client) => {
      // 1. Create user account
      const userRole = mapInfluencerTypeToRole(data.influencer_type)
      const insertUserQuery = `
        INSERT INTO users (email, clerk_id, role, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `
      const userResult = await client.query(insertUserQuery, [
        data.email || `temp_${Date.now()}@temp.com`,
        `temp_clerk_${Date.now()}`, // Temporary clerk ID
        userRole,
        'PENDING'
      ])
      const userId = userResult.rows[0].id

      // 2. Create user profile
      const insertProfileQuery = `
        INSERT INTO user_profiles (
          user_id, first_name, last_name, bio, 
          location_country, location_city
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `
      await client.query(insertProfileQuery, [
        userId,
        data.first_name,
        data.last_name,
        data.bio || null,
        data.location_country || null,
        data.location_city || null
      ])

      // 3. Create influencer record
      const insertInfluencerQuery = `
        INSERT INTO influencers (
          user_id, display_name, niches, total_followers, 
          total_engagement_rate, total_avg_views, estimated_promotion_views,
          tier, assigned_to, influencer_type, content_type, agency_name, website_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `
      const influencerResult = await client.query(insertInfluencerQuery, [
        userId,
        data.display_name,
        data.niches || [],
        data.estimated_followers || 0,
        data.discovered_engagement_rate || 0,
        data.average_views || 0,
        Math.floor((data.average_views || 0) * 0.85), // 15% reduction for promotion views
        data.tier || 'SILVER',
        null, // No assignment initially
        data.influencer_type,
        data.content_type || 'STANDARD',
        data.agency_name || null,
        data.website_url || null
      ])
      const influencerId = influencerResult.rows[0].id

      // 4. Create platform records for provided usernames
      const platforms = []
      if (data.instagram_username) {
        platforms.push(['INSTAGRAM', data.instagram_username])
      }
      if (data.tiktok_username) {
        platforms.push(['TIKTOK', data.tiktok_username])
      }
      if (data.youtube_username) {
        platforms.push(['YOUTUBE', data.youtube_username])
      }

      for (const [platform, username] of platforms) {
        const insertPlatformQuery = `
          INSERT INTO influencer_platforms (
            influencer_id, platform, username, followers, 
            engagement_rate, avg_views, is_connected, profile_url
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `
        await client.query(insertPlatformQuery, [
          influencerId,
          platform,
          username,
          data.estimated_followers || 0,
          data.discovered_engagement_rate || 0,
          data.average_views || 0,
          false, // Not connected initially
          `https://${platform?.toLowerCase()}.com/${username}`
        ])
      }

      return {
        influencerId,
        userId,
        display_name: data.display_name,
        influencer_type: data.influencer_type
      }
    })

    console.log('✅ Successfully created influencer:', {
      influencerId: result.influencerId,
      display_name: result.display_name,
      type: result.influencer_type
    })

    return NextResponse.json({
      success: true,
      message: `Influencer ${result.display_name} added successfully to ${result.influencer_type} roster`,
      data: {
        id: result.influencerId,
        user_id: result.userId,
        display_name: result.display_name,
        influencer_type: result.influencer_type
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating influencer:', error)
    return NextResponse.json(
      { error: 'Failed to create influencer' },
      { status: 500 }
    )
  }
}

// Helper functions
function mapInfluencerTypeToRole(type: string) {
  switch (type) {
    case 'SIGNED':
      return 'INFLUENCER_SIGNED'
    case 'PARTNERED':
      return 'INFLUENCER_PARTNERED'
    case 'AGENCY_PARTNER':
      return 'INFLUENCER_PARTNERED' // Map to partnered for now
    default:
      return 'INFLUENCER_PARTNERED'
  }
}

function mapRoleToInfluencerType(role: string) {
  switch (role) {
    case 'INFLUENCER_SIGNED':
      return 'SIGNED'
    case 'INFLUENCER_PARTNERED':
      return 'PARTNERED'
    default:
      return 'PARTNERED'
  }
} 