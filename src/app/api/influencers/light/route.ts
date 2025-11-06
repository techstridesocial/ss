import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { getCurrentUserRole } from '@/lib/auth/roles'

/**
 * OPTIMIZED INFLUENCERS ENDPOINT - FOR ROSTER LIST VIEW
 * 
 * This endpoint is optimized for fast initial page load:
 * - No expensive JOINs
 * - No JSON aggregation
 * - Only essential fields for table display
 * - Platforms fetched separately only when needed
 */

// GET - Fetch influencers (optimized for roster table view)
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

    console.log('📋 [OPTIMIZED] Fetching influencers with minimal data')
    
    // OPTIMIZED QUERY: Single table + minimal joins
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
        i.niches,
        i.created_at,
        i.updated_at,
        -- Only essential user profile fields (single join)
        up.first_name,
        up.last_name,
        up.location_country,
        up.location_city,
        up.avatar_url,
        up.is_onboarded,
        -- Only essential user fields (single join)
        u.email,
        u.status as user_status,
        -- Get platform count (no aggregation, just count)
        (
          SELECT COUNT(*)::int 
          FROM influencer_platforms ip_count 
          WHERE ip_count.influencer_id = i.id
        ) as platform_count,
        -- Get primary platforms as simple array (no JSON objects)
        (
          SELECT array_agg(DISTINCT ip_plat.platform ORDER BY ip_plat.platform)
          FROM influencer_platforms ip_plat
          WHERE ip_plat.influencer_id = i.id
        ) as platforms
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY i.created_at DESC
    `)

    console.log(`✅ [OPTIMIZED] Loaded ${influencers.length} influencers`)
    
    // Helper function to parse Postgres array strings into JavaScript arrays
    const parsePostgresArray = (value: any): string[] => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        // Handle Postgres array format: "{INSTAGRAM,TIKTOK}" or "{NULL}"
        const trimmed = value.trim()
        if (trimmed === '{NULL}' || trimmed === '{}' || trimmed === 'null') return []
        // Remove curly braces and split by comma
        const cleaned = trimmed.replace(/^{|}$/g, '')
        if (!cleaned) return []
        return cleaned.split(',').map(item => item.trim()).filter(Boolean)
      }
      return []
    }
    
    // Minimal transformation - properly parse Postgres arrays
    const transformedInfluencers = influencers.map(inf => ({
      ...inf,
      platforms: parsePostgresArray(inf.platforms),
      niches: Array.isArray(inf.niches) ? inf.niches : (inf.niches || []),
      platform_count: inf.platform_count || 0,
      is_active: inf.user_status === 'ACTIVE',
      estimated_promotion_views: inf.estimated_promotion_views || Math.floor((inf.total_avg_views || 0) * 0.85)
    }))
    
    return NextResponse.json({
      success: true,
      data: transformedInfluencers,
      count: transformedInfluencers.length
    })

  } catch (error) {
    console.error('❌ [OPTIMIZED] Error fetching influencers:', error)
    
    let errorMessage = 'Failed to fetch influencers'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        errorMessage = 'Database connection failed. Please try again.'
        statusCode = 503
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

