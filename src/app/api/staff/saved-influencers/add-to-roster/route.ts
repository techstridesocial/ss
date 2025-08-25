import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

// POST /api/staff/saved-influencers/add-to-roster - Add saved influencer to roster
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
    const { saved_influencer_id } = body

    if (!saved_influencer_id) {
      return NextResponse.json({ 
        error: 'saved_influencer_id is required' 
      }, { status: 400 })
    }

    // Get user ID from Clerk userId
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0]?.id

    // Get saved influencer data
    const savedInfluencerResult = await query<{
      id: string
      username: string
      display_name: string
      platform: string
      followers: number
      engagement_rate: number
      profile_picture?: string
      bio?: string
      location?: string
      niches?: string[]
      modash_data?: any
    }>(
      'SELECT * FROM staff_saved_influencers WHERE id = $1',
      [saved_influencer_id]
    )

    if (savedInfluencerResult.length === 0) {
      return NextResponse.json({ error: 'Saved influencer not found' }, { status: 404 })
    }

    const savedInfluencer = savedInfluencerResult[0]

    // Check if already in roster by username
    const existingRosterResult = await query(
      `SELECT i.id FROM influencers i 
       JOIN influencer_platforms ip ON i.id = ip.influencer_id 
       WHERE ip.username = $1 AND ip.platform = $2`,
      [savedInfluencer.username, savedInfluencer.platform]
    )

    if (existingRosterResult.length > 0) {
      return NextResponse.json({ 
        error: 'Influencer already exists in roster' 
      }, { status: 409 })
    }

    // Create user account for the influencer
    const influencerUserResult = await query<{ id: string }>(
      `INSERT INTO users (
        email, clerk_id, role, status
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id`,
      [
        `${savedInfluencer.username}@temp.stride.social`, // Temporary email
        `temp_${savedInfluencer.username}_${Date.now()}`, // Temporary clerk_id
        'INFLUENCER_PARTNERED',
        'PENDING'
      ]
    )

    const influencer_user_id = influencerUserResult[0]?.id

    // Create user profile
    await query(
      `INSERT INTO user_profiles (
        user_id, first_name, last_name, bio, location_city
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        influencer_user_id,
        savedInfluencer.display_name?.split(' ')[0] || savedInfluencer.username,
        savedInfluencer.display_name?.split(' ').slice(1).join(' ') || '',
        savedInfluencer.bio || '',
        savedInfluencer.location || ''
      ]
    )

    // Create influencer record
    const influencerResult = await query<{ id: string }>(
      `INSERT INTO influencers (
        user_id, display_name, niche_primary, niches, 
        total_followers, total_engagement_rate,
        tier, assigned_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        influencer_user_id,
        savedInfluencer.display_name || savedInfluencer.username,
        savedInfluencer.niches?.[0] || 'General',
        savedInfluencer.niches || [],
        savedInfluencer.followers,
        savedInfluencer.engagement_rate,
        'PARTNERED',
        user_id // Assign to the staff member who added them
      ]
    )

    const influencer_id = influencerResult[0]?.id

    // Create platform record
    await query(
      `INSERT INTO influencer_platforms (
        influencer_id, platform, username, followers, 
        engagement_rate, profile_url, is_connected
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        influencer_id,
        savedInfluencer.platform,
        savedInfluencer.username,
        savedInfluencer.followers,
        savedInfluencer.engagement_rate,
        `https://${savedInfluencer.platform.toLowerCase()}.com/${savedInfluencer.username}`,
        false // Not connected initially
      ]
    )

    // Update saved influencer record to mark as added to roster
    await query(
      `UPDATE staff_saved_influencers 
       SET added_to_roster = true, 
           added_to_roster_by = $1, 
           added_to_roster_at = NOW()
       WHERE id = $2`,
      [user_id, saved_influencer_id]
    )

    return NextResponse.json({
      success: true,
      data: { 
        influencer_id,
        message: 'Influencer successfully added to roster'
      }
    })
  } catch (error) {
    console.error('Error adding influencer to roster:', error)
    return NextResponse.json(
      { error: 'Failed to add influencer to roster' },
      { status: 500 }
    )
  }
}
