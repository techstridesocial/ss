import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '../../../../lib/db/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const influencerId = params.id
    if (!influencerId) {
      return NextResponse.json({ success: false, error: 'Influencer ID is required' }, { status: 400 })
    }

    // Fetch influencer details with the same structure as the main influencers API
    const _result = await query(`
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
      WHERE i.id = $1
      GROUP BY i.id, u.id, up.id
    `, [influencerId])

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Influencer not found' }, { status: 404 })
    }

    const influencer = result[0]

    // Transform data to match frontend expectations (same as main influencers API)
    const transformedInfluencer = {
      ...influencer,
      // Ensure platforms is always an array
      platforms: Array.isArray(influencer.platforms) ? influencer.platforms : [],
      // Add platform_count for compatibility
      platform_count: Array.isArray(influencer.platforms) ? influencer.platforms.length : 0,
      // Ensure boolean fields are properly typed
      is_active: influencer.user_status === 'ACTIVE',
      // Add estimated_promotion_views if missing
      estimated_promotion_views: influencer.estimated_promotion_views || Math.floor((influencer.total_avg_views || 0) * 0.85)
    }

    return NextResponse.json({
      success: true,
      data: transformedInfluencer
    })

  } catch (_error) {
    console.error('Error fetching influencer:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
