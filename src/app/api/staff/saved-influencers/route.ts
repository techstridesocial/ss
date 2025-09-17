import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

interface SavedInfluencer {
  id: string
  username: string
  display_name: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  followers: number
  engagement_rate: number
  avg_likes?: number
  avg_views?: number
  avg_comments?: number
  profile_picture?: string
  bio?: string
  location?: string
  niches?: string[]
  profile_url?: string
  modash_user_id?: string
  modash_data?: any
  saved_by: string
  saved_at: string
  added_to_roster: boolean
  added_to_roster_at?: string
}

// GET /api/staff/saved-influencers - Get all staff-saved influencers
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const limit = searchParams.get('limit') || '50'

    let queryText = `
      SELECT 
        ssi.*,
        u.email as saved_by_email,
        u2.email as added_to_roster_by_email
      FROM staff_saved_influencers ssi
      LEFT JOIN users u ON ssi.saved_by = u.id
      LEFT JOIN users u2 ON ssi.added_to_roster_by = u2.id
    `
    const queryParams: any[] = []

    if (platform) {
      queryText += ` WHERE ssi.platform = $1`
      queryParams.push(platform.toUpperCase())
    }

    queryText += ` ORDER BY ssi.saved_at DESC LIMIT $${queryParams.length + 1}`
    queryParams.push(parseInt(limit))

    const result = await query<SavedInfluencer & { saved_by_email: string; added_to_roster_by_email?: string }>(
      queryText, 
      queryParams
    )
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching saved influencers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved influencers' },
      { status: 500 }
    )
  }
}

// POST /api/staff/saved-influencers - Save an influencer
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      username,
      display_name,
      platform,
      followers,
      engagement_rate,
      avg_likes,
      avg_views,
      avg_comments,
      profile_picture,
      bio,
      location,
      niches,
      profile_url,
      modash_user_id,
      modash_data,
      discovered_influencer_id
    } = body

    // Validate required fields
    if (!username || !platform || followers === undefined || engagement_rate === undefined) {
      console.error('❌ Missing required fields in save request:', {
        username: !!username,
        platform: !!platform, 
        followers: followers !== undefined,
        engagement_rate: engagement_rate !== undefined,
        body: body
      })
      return NextResponse.json({ 
        error: 'Missing required fields: username, platform, followers, engagement_rate' 
      }, { status: 400 })
    }

    console.log('✅ Save request validation passed:', {
      username,
      platform,
      followers,
      engagement_rate,
      user_id: userId
    })

    // Get user ID from Clerk userId
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0]?.id

    // Insert or update saved influencer
    console.log('📊 Attempting database insert/update with params:', {
      username,
      display_name,
      platform: platform.toUpperCase(),
      followers,
      engagement_rate,
      user_id,
      hasModashData: !!modash_data
    })

    const result = await query<{ id: string }>(
      `INSERT INTO staff_saved_influencers (
        username, display_name, platform, followers, engagement_rate,
        avg_likes, avg_views, avg_comments, profile_picture, bio, location,
        niches, profile_url, modash_user_id, modash_data, 
        discovered_influencer_id, saved_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      ON CONFLICT (username, platform) 
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        followers = EXCLUDED.followers,
        engagement_rate = EXCLUDED.engagement_rate,
        avg_likes = EXCLUDED.avg_likes,
        avg_views = EXCLUDED.avg_views,
        avg_comments = EXCLUDED.avg_comments,
        profile_picture = EXCLUDED.profile_picture,
        bio = EXCLUDED.bio,
        location = EXCLUDED.location,
        niches = EXCLUDED.niches,
        profile_url = EXCLUDED.profile_url,
        modash_data = EXCLUDED.modash_data,
        last_updated = NOW()
      RETURNING id`,
      [
        username,
        display_name,
        platform.toUpperCase(),
        followers,
        engagement_rate,
        avg_likes,
        avg_views,
        avg_comments,
        profile_picture,
        bio,
        location,
        niches,
        profile_url,
        modash_user_id,
        modash_data,
        discovered_influencer_id,
        user_id
      ]
    )

    console.log('✅ Database operation successful:', {
      id: result[0]?.id,
      rowsAffected: result.length
    })

    return NextResponse.json({
      success: true,
      data: { id: result[0]?.id },
      message: 'Influencer saved successfully'
    })
  } catch (error) {
    console.error('Error saving influencer:', error)
    return NextResponse.json(
      { error: 'Failed to save influencer' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/saved-influencers - Remove saved influencer
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const platform = searchParams.get('platform')

    if (!username || !platform) {
      return NextResponse.json({ 
        error: 'Username and platform are required' 
      }, { status: 400 })
    }

    await query(
      'DELETE FROM staff_saved_influencers WHERE username = $1 AND platform = $2',
      [username, platform.toUpperCase()]
    )

    return NextResponse.json({
      success: true,
      message: 'Influencer removed from saved list'
    })
  } catch (error) {
    console.error('Error removing saved influencer:', error)
    return NextResponse.json(
      { error: 'Failed to remove saved influencer' },
      { status: 500 }
    )
  }
}
