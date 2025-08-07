import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, transaction } from '@/lib/db/connection'

// GET - Fetch influencer profile data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get influencer profile data
    const profileQuery = `
      SELECT 
        i.id as influencer_id,
        i.user_id,
        i.display_name,
        i.niches,
        i.total_followers,
        i.total_engagement_rate,
        i.total_avg_views,
        i.estimated_promotion_views,
        i.tier,
        i.assigned_to,
        i.labels,
        i.notes,
        i.created_at,
        i.updated_at,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.location_country,
        up.location_city,
        up.bio,
        up.phone,
        up.is_onboarded,
        u.email,
        u.role,
        u.status
      FROM influencers i
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.clerk_id = $1
    `

    const profileResult = await query(profileQuery, [userId])

    if (profileResult.length === 0) {
      return NextResponse.json(
        { error: 'Influencer profile not found' },
        { status: 404 }
      )
    }

    const profile = profileResult[0]

    // Get platform data for this influencer
    const platformsQuery = `
      SELECT 
        platform,
        username,
        followers,
        engagement_rate,
        avg_views,
        is_connected,
        last_synced
      FROM influencer_platforms
      WHERE influencer_id = $1
      ORDER BY platform
    `

    const platforms = await query(platformsQuery, [profile.influencer_id])

    // Format the response
    const response = {
      success: true,
      data: {
        ...profile,
        platforms: platforms.map(p => ({
          platform: p.platform.toLowerCase(),
          username: p.username,
          followers: p.followers || 0,
          engagement_rate: p.engagement_rate || 0,
          avg_views: p.avg_views || 0,
          is_connected: p.is_connected || false,
          last_sync: p.last_synced
        })),
        connected_accounts: platforms.map(p => ({
          platform: p.platform.toLowerCase(),
          username: p.username,
          followers: p.followers || 0,
          is_connected: p.is_connected || false,
          last_sync: p.last_synced
        }))
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching influencer profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT - Update influencer profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'display_name']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Get user_id from users table using clerk_id
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user_id = userResult[0]?.id

    // Update profile in transaction
    const result = await transaction(async (client) => {
      // Update user profile
      await client.query(`
        UPDATE user_profiles SET
          first_name = $1,
          last_name = $2,
          bio = $3,
          phone = $4,
          location_country = $5,
          location_city = $6,
          updated_at = NOW()
        WHERE user_id = $7
      `, [
        data.first_name,
        data.last_name,
        data.bio || null,
        data.phone || null,
        data.location_country || null,
        data.location_city || null,
        user_id
      ])

      // Update influencer record
      await client.query(`
        UPDATE influencers SET
          display_name = $1,
          niches = $2,
          updated_at = NOW()
        WHERE user_id = $3
      `, [
        data.display_name,
        data.niches || [],
        user_id
      ])

      return { success: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating influencer profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 