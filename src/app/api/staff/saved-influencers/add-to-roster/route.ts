import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient as _clerkClient } from '@clerk/nextjs/server'
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
    const { saved_influencer_id, influencer_type = 'PARTNERED', agency_name } = body

    if (!saved_influencer_id) {
      return NextResponse.json({ 
        error: 'saved_influencer_id is required' 
      }, { status: 400 })
    }

    // Validate influencer_type
    const validTypes = ['SIGNED', 'PARTNERED', 'AGENCY_PARTNER']
    if (!validTypes.includes(influencer_type)) {
      return NextResponse.json({ 
        error: 'Invalid influencer_type. Must be one of: SIGNED, PARTNERED, AGENCY_PARTNER' 
      }, { status: 400 })
    }

    // Get user ID from Clerk userId
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    let user_id: string

    if (userResult.length === 0 || !userResult[0]) {
      // User doesn't exist, create one automatically
      console.log('User not found, creating new staff record for clerk_id:', userId)
      
      try {
        // Get user details from Clerk
        const client = await (await _clerkClient())
        const clerkUser = await client.users.getUser(userId)
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`
        const userRole = clerkUser.publicMetadata?.role as string || 'STAFF'
        
        console.log('Creating staff user with email:', userEmail, 'role:', userRole)
        
        const newUserResult = await query<{ id: string }>(
          `INSERT INTO users (clerk_id, email, status, role) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id`,
          [userId, userEmail, 'ACTIVE', userRole]
        )
        
        if (newUserResult.length === 0 || !newUserResult[0]) {
          throw new Error('INSERT returned no results')
        }
        
        user_id = newUserResult[0].id
        console.log('✅ Created new staff user with ID:', user_id)
        
        // Create basic user profile
        await query(
          `INSERT INTO user_profiles (user_id, first_name, last_name, is_onboarded)
           VALUES ($1, $2, $3, $4)`,
          [
            user_id,
            clerkUser.firstName || 'Staff',
            clerkUser.lastName || 'Member',
            true
          ]
        )
        
      } catch (createUserError: any) {
        console.error('Error creating staff user:', createUserError)
        return NextResponse.json(
          { error: 'Database error: ' + (createUserError?.message || 'Could not create user record') }, 
          { status: 500 }
        )
      }
    } else {
      user_id = userResult[0].id
    }

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
    
    if (!savedInfluencer) {
      return NextResponse.json({ error: 'Saved influencer data is invalid' }, { status: 400 })
    }

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

    // Create influencer record with preserved analytics
    const influencerResult = await query<{ id: string }>(
      `INSERT INTO influencers (
        user_id, display_name, niche_primary, niches, 
        total_followers, total_engagement_rate,
        tier, assigned_to, notes, influencer_type, agency_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        influencer_user_id,
        savedInfluencer.display_name || savedInfluencer.username,
        savedInfluencer.niches?.[0] || 'General',
        savedInfluencer.niches || [],
        savedInfluencer.followers,
        savedInfluencer.engagement_rate,
        influencer_type === 'AGENCY_PARTNER' ? null : influencer_type, // Agency partners don't have tiers
        user_id, // Assign to the staff member who added them
        JSON.stringify({
          modash_data: savedInfluencer.modash_data, // Preserve complete analytics
          added_from_saved: true,
          saved_date: new Date().toISOString(),
          influencer_type: influencer_type
        }),
        influencer_type,
        influencer_type === 'AGENCY_PARTNER' ? agency_name : null
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
