import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { cacheModashProfile } from '@/lib/services/modash-cache'
import { hasRole } from '@/lib/auth/roles'

// POST - Manually refresh a specific influencer's cached data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has staff/admin role OR if they're refreshing their own profile
    const userRole = await hasRole(userId, ['STAFF', 'ADMIN'])
    
    if (!userRole) {
      // Allow influencers to refresh their own profiles
      // We'll verify ownership in the query below
      console.log('🔄 User is not staff/admin, checking if they own this profile...')
    }

    const { influencerPlatformId, platform, modashUserId } = await request.json()

    if (!influencerPlatformId || !platform) {
      return NextResponse.json(
        { error: 'Missing influencerPlatformId or platform' },
        { status: 400 }
      )
    }

    console.log(`🔄 Manual refresh requested for platform ${platform}, ID: ${influencerPlatformId}`)

    // Get the Modash user ID and verify ownership if not staff/admin
    let targetModashUserId = modashUserId
    if (!userRole) {
      // Verify this platform belongs to the current user
      const ownershipQuery = `
        SELECT ip.username, i.user_id
        FROM influencer_platforms ip
        JOIN influencers i ON ip.influencer_id = i.id
        JOIN users u ON i.user_id = u.id
        WHERE ip.id = $1 AND u.clerk_id = $2
      `
      const ownershipResult = await query(ownershipQuery, [influencerPlatformId, userId])
      
      if (ownershipResult.length === 0) {
        return NextResponse.json(
          { error: 'You can only refresh your own profiles' },
          { status: 403 }
        )
      }
      
      targetModashUserId = ownershipResult[0].username
    } else {
      // Staff/Admin can refresh any profile
      const platformResult = await query(
        'SELECT username FROM influencer_platforms WHERE id = $1',
        [influencerPlatformId]
      )
      
      if (platformResult.length > 0) {
        targetModashUserId = platformResult[0].username
      }
    }

    if (!targetModashUserId) {
      return NextResponse.json(
        { error: 'Could not determine Modash user ID' },
        { status: 400 }
      )
    }

    // Cache the fresh profile data
    const cacheResult = await cacheModashProfile(
      influencerPlatformId,
      targetModashUserId,
      platform
    )

    if (!cacheResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to refresh profile cache',
          details: cacheResult.error
        },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully refreshed cache for platform ${platform}, ID: ${influencerPlatformId}`)

    return NextResponse.json({
      success: true,
      message: 'Profile cache refreshed successfully',
      refreshedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error refreshing profile cache:', error)
    return NextResponse.json(
      { 
        error: 'Failed to refresh profile cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
