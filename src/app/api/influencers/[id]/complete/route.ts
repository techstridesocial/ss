/**
 * GET Complete Influencer Data
 * Returns all influencer data including platforms, for analytics panel
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or admin
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const userRole = clerkUser.publicMetadata?.role as string

    if (!userRole || !['STAFF', 'ADMIN', 'BRAND'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const influencerId = params.id

    // Fetch complete influencer data with platforms
    const result = await query(`
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
        i.labels,
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
        up.website_url,
        u.email,
        u.status as user_status,
        -- Get platform data as JSON array
        COALESCE(
          json_agg(
            json_build_object(
              'id', ip.id,
              'platform', ip.platform,
              'username', ip.username,
              'followers', ip.followers,
              'engagement_rate', ip.engagement_rate,
              'avg_views', ip.avg_views,
              'avg_likes', ip.avg_likes,
              'avg_comments', ip.avg_comments,
              'is_connected', ip.is_connected,
              'is_verified', ip.is_verified,
              'profile_url', ip.profile_url,
              'last_post_date', ip.last_post_date
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
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    const influencer = result[0]

    // Transform platforms array to also include contacts format for the panel
    const contacts = (influencer.platforms || []).map((p: any) => ({
      type: p.platform?.toLowerCase(),
      value: p.profile_url || `https://${p.platform?.toLowerCase()}.com/${p.username}`
    }))

    // Transform to format expected by InfluencerDetailPanel
    const transformedData = {
      ...influencer,
      // Ensure proper types
      niches: influencer.niches || [],
      platforms: influencer.platforms || [],
      is_active: influencer.user_status === 'ACTIVE',
      // Add contacts for social media links
      contacts: contacts,
      // Add handle for display
      handle: influencer.display_name?.toLowerCase().replace(/\s+/g, '') || influencer.id
    }

    return NextResponse.json({
      success: true,
      data: transformedData
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch complete influencer data' },
      { status: 500 }
    )
  }
}

