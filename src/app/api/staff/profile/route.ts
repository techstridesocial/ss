import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getUserFromClerkId, updateUserProfile, getUserById } from '@/lib/db/queries/users'
import { query, queryOne } from '@/lib/db/connection'

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES = {
  email_notifications: true,
  in_app_notifications: true,
  quotation_alerts: true,
  campaign_updates: true,
  invoice_alerts: true
}

/**
 * GET /api/staff/profile
 * Get the current staff user's profile with notification preferences
 */
export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const dbUser = await getUserFromClerkId(clerkId)
    
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is staff or admin
    if (!['STAFF', 'ADMIN'].includes(dbUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Staff or Admin role required.' },
        { status: 403 }
      )
    }

    // Get full user profile
    const userWithProfile = await getUserById(dbUser.id)
    
    if (!userWithProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get notification preferences (check if column exists and has data)
    let notificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES
    try {
      const prefResult = await queryOne<{ notification_preferences: object }>(
        `SELECT notification_preferences FROM user_profiles WHERE user_id = $1`,
        [dbUser.id]
      )
      if (prefResult?.notification_preferences) {
        notificationPreferences = prefResult.notification_preferences as typeof DEFAULT_NOTIFICATION_PREFERENCES
      }
    } catch {
      // Column might not exist yet, use defaults
    }

    // Get Clerk user for email (email is managed by Clerk)
    const clerkUser = await currentUser()

    return NextResponse.json({
      success: true,
      data: {
        id: userWithProfile.id,
        email: clerkUser?.emailAddresses[0]?.emailAddress || userWithProfile.email,
        role: userWithProfile.role,
        profile: {
          first_name: userWithProfile.profile?.first_name || '',
          last_name: userWithProfile.profile?.last_name || '',
          phone: userWithProfile.profile?.phone || '',
          avatar_url: userWithProfile.profile?.avatar_url || clerkUser?.imageUrl || '',
          bio: userWithProfile.profile?.bio || '',
          location_country: userWithProfile.profile?.location_country || '',
          location_city: userWithProfile.profile?.location_city || ''
        },
        notification_preferences: notificationPreferences,
        created_at: userWithProfile.created_at
      }
    })
  } catch (error) {
    console.error('Error fetching staff profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/staff/profile
 * Update the current staff user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const dbUser = await getUserFromClerkId(clerkId)
    
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is staff or admin
    if (!['STAFF', 'ADMIN'].includes(dbUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Staff or Admin role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { profile, notification_preferences } = body

    // Update profile fields
    if (profile) {
      const result = await updateUserProfile(dbUser.id, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location_country: profile.location_country,
        location_city: profile.location_city
      })

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        )
      }
    }

    // Update notification preferences
    if (notification_preferences) {
      try {
        // First check if the column exists
        const columnCheck = await query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_name = 'user_profiles' AND column_name = 'notification_preferences'`
        )

        if (columnCheck.length === 0) {
          // Add the column if it doesn't exist
          await query(
            `ALTER TABLE user_profiles 
             ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '${JSON.stringify(DEFAULT_NOTIFICATION_PREFERENCES)}'::jsonb`
          )
        }

        // Update the preferences
        await query(
          `UPDATE user_profiles SET notification_preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
          [JSON.stringify(notification_preferences), dbUser.id]
        )
      } catch (error) {
        console.error('Error updating notification preferences:', error)
        // Continue even if this fails - the profile update is more important
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating staff profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
