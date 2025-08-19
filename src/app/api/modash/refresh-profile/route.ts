import { NextRequest, NextResponse } from 'next/server'
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

    // Check if user has staff or admin role
    const userRole = await hasRole(userId, ['STAFF', 'ADMIN'])
    if (!userRole) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { influencerPlatformId, platform, modashUserId } = await request.json()

    if (!influencerPlatformId || !platform) {
      return NextResponse.json(
        { error: 'Missing influencerPlatformId or platform' },
        { status: 400 }
      )
    }

    console.log(`🔄 Manual refresh requested for platform ${platform}, ID: ${influencerPlatformId}`)

    // Get the Modash user ID if not provided
    let targetModashUserId = modashUserId
    if (!targetModashUserId) {
      const platformResult = await query(
        'SELECT modash_profile_id, username FROM influencer_platforms WHERE id = $1',
        [influencerPlatformId]
      )
      
      if (platformResult.length > 0) {
        targetModashUserId = platformResult[0].modash_profile_id || platformResult[0].username
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
