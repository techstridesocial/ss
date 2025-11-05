import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, queryOne } from '@/lib/db/connection'
import { cacheModashProfile } from '@/lib/services/modash-cache'
import { updateInfluencerAggregatedStats } from '@/lib/db/queries/influencer-stats-aggregator'

// GET - Get all social accounts for the current influencer
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get influencer ID from user
    const userResult = await queryOne(`
      SELECT id FROM users WHERE clerk_id = $1
    `, [userId])

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const influencerResult = await queryOne(`
      SELECT id FROM influencers WHERE user_id = $1
    `, [userResult.id])

    if (!influencerResult) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Get social accounts from influencer_platforms
    const socialAccounts = await query(`
      SELECT 
        id,
        platform,
        username as handle,
        followers,
        engagement_rate,
        0 as avg_likes,
        0 as avg_comments,
        avg_views,
        0 as credibility_score,
        profile_url as profile_picture_url,
        NULL as bio,
        false as verified,
        false as is_private,
        is_connected,
        last_synced as last_sync,
        created_at,
        updated_at
      FROM influencer_platforms
      WHERE influencer_id = $1
      ORDER BY platform
    `, [influencerResult.id])

    return NextResponse.json({
      success: true,
      data: socialAccounts
    })

  } catch (error) {
    console.error('Error fetching social accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social accounts' },
      { status: 500 }
    )
  }
}

// POST - Connect a new social account
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await _request.json()
    const { platform, handle, profileData } = body

    // Convert platform to uppercase to match database enum
    const normalizedPlatform = platform?.toUpperCase()
    console.log('🔗 Connecting social account:', { platform, normalizedPlatform, handle, userId })

    if (!platform || !handle) {
      return NextResponse.json(
        { error: 'Platform and handle are required' },
        { status: 400 }
      )
    }

    // Note: Clerk auth() in Next.js 15 doesn't return user object directly
    // We'll get role from database instead
    console.log('🔑 Getting user role from database')

    // Get influencer ID from user
    console.log('🔍 Looking for user in database with clerk_id:', userId)
    let userResult
    try {
      userResult = await queryOne(`
        SELECT id, email, role FROM users WHERE clerk_id = $1
      `, [userId])
      console.log('👤 User query result:', userResult)
    } catch (dbError) {
      console.error('❌ Database error in user query:', dbError)
      return NextResponse.json({
        error: 'Database connection error',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    if (!userResult) {
      console.error('❌ User not found in database for clerk_id:', userId)
      return NextResponse.json({ 
        error: 'Please complete your onboarding first',
        redirectTo: '/influencer/onboarding',
        message: 'You need to complete your profile setup before connecting social media accounts'
      }, { status: 400 })
    }

    console.log('🔍 Looking for influencer with user_id:', userResult.id)
    let influencerResult
    try {
      influencerResult = await queryOne(`
        SELECT id FROM influencers WHERE user_id = $1
      `, [userResult.id])
      console.log('👤 Influencer query result:', influencerResult)
    } catch (dbError) {
      console.error('❌ Database error in influencer query:', dbError)
      return NextResponse.json({
        error: 'Database connection error',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    if (!influencerResult) {
      console.error('❌ Influencer not found for user_id:', userResult.id)
      return NextResponse.json({ 
        error: 'Please complete your onboarding first',
        redirectTo: '/influencer/onboarding',
        message: 'You need to complete your influencer profile setup before connecting social media accounts'
      }, { status: 400 })
    }

    // Check if account already exists
    const existingAccount = await queryOne(`
      SELECT id FROM influencer_platforms
      WHERE influencer_id = $1 AND platform = $2
    `, [influencerResult.id, normalizedPlatform])

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account already connected for this platform' },
        { status: 400 }
      )
    }

    // Insert new social account into influencer_platforms
    console.log('📝 Inserting social account:', {
      influencerId: influencerResult.id,
      platform: normalizedPlatform,
      handle,
      modashUserId: profileData?.userId,
      profileData
    })

    let newAccount
    try {
      newAccount = await queryOne(`
        INSERT INTO influencer_platforms (
          influencer_id,
          platform,
          username,
          modash_user_id,
          profile_url,
          followers,
          engagement_rate,
          avg_views,
          is_connected,
          last_synced
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *
      `, [
        influencerResult.id,
        normalizedPlatform,
        handle, // Store the actual username (handle) for display
        profileData?.userId || null, // Store Modash user ID for API calls
        profileData?.profileUrl || null,
        profileData?.followers || 0,
        profileData?.engagementRate || 0,
        profileData?.avgViews || 0,
        true
      ])

      console.log('✅ Social account connected successfully:', newAccount)
    } catch (insertError) {
      console.error('❌ Error inserting social account:', insertError)
      console.error('❌ Insert error details:', {
        message: insertError instanceof Error ? insertError.message : 'Unknown error',
        stack: insertError instanceof Error ? insertError.stack : undefined,
        code: insertError instanceof Error ? (insertError as any).code : undefined
      })
      return NextResponse.json({
        error: 'Failed to save social account to database',
        details: insertError instanceof Error ? insertError.message : 'Unknown database error'
      }, { status: 500 })
    }

    // Update aggregated stats in influencers table
    await updateInfluencerAggregatedStats(influencerResult.id)

    // Cache Modash data for rich analytics
    try {
      console.log('🔄 Caching Modash data for new connection...')
      const cacheResult = await cacheModashProfile(
        newAccount.id,
        profileData?.userId || handle, // Use Modash user ID if available, fallback to handle
        normalizedPlatform
      )
      
      if (cacheResult.success) {
        console.log('✅ Modash data cached successfully')
      } else {
        console.warn('⚠️ Failed to cache Modash data:', cacheResult.error)
      }
    } catch (cacheError) {
      console.warn('⚠️ Error caching Modash data:', cacheError)
      // Don't fail the connection if caching fails
    }

    return NextResponse.json({
      success: true,
      data: newAccount,
      message: `${normalizedPlatform.charAt(0).toUpperCase() + normalizedPlatform.slice(1).toLowerCase()} account connected successfully`
    })

  } catch (error) {
    console.error('Error connecting social account:', error)
    return NextResponse.json(
      { error: 'Failed to connect social account' },
      { status: 500 }
    )
  }
}


// DELETE - Disconnect a social account
export async function DELETE(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await _request.json()
    const { accountId } = body

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    // Get influencer ID from user
    const userResult = await queryOne(`
      SELECT id FROM users WHERE clerk_id = $1
    `, [userId])

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const influencerResult = await queryOne(`
      SELECT id FROM influencers WHERE user_id = $1
    `, [userResult.id])

    if (!influencerResult) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Delete social account from influencer_platforms
    const deletedAccount = await queryOne(`
      DELETE FROM influencer_platforms
      WHERE id = $1 AND influencer_id = $2
      RETURNING *
    `, [accountId, influencerResult.id])

    if (!deletedAccount) {
      return NextResponse.json(
        { error: 'Account not found or not owned by user' },
        { status: 404 }
      )
    }

    // Update aggregated stats in influencers table (recalculate after deletion)
    await updateInfluencerAggregatedStats(influencerResult.id)

    // Also clean up any cached Modash data for this platform
    try {
      await query(
        'DELETE FROM modash_profile_cache WHERE influencer_platform_id = $1',
        [accountId]
      )
      console.log('✅ Cleaned up cached Modash data for disconnected platform')
    } catch (cacheError) {
      console.warn('⚠️ Failed to clean up cached data:', cacheError)
      // Don't fail the disconnect if cache cleanup fails
    }

    return NextResponse.json({
      success: true,
      message: 'Social account disconnected successfully'
    })

  } catch (error) {
    console.error('Error disconnecting social account:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect social account' },
      { status: 500 }
    )
  }
}

// PUT - Update username for existing social account
export async function PUT(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await _request.json()
    const { platform, username } = body

    // Convert platform to uppercase to match database enum
    const normalizedPlatform = platform?.toUpperCase()
    console.log('🔄 Updating username:', { platform: normalizedPlatform, username, userId })

    if (!platform || !username) {
      return NextResponse.json(
        { error: 'Platform and username are required' },
        { status: 400 }
      )
    }

    // Get influencer ID from user
    const userResult = await queryOne(`
      SELECT id FROM users WHERE clerk_id = $1
    `, [userId])

    if (!userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const influencerResult = await queryOne(`
      SELECT id FROM influencers WHERE user_id = $1
    `, [userResult.id])

    if (!influencerResult) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Update the username in the database
    const updatedAccount = await queryOne(`
      UPDATE influencer_platforms 
      SET username = $1, updated_at = NOW()
      WHERE influencer_id = $2 AND platform = $3
      RETURNING *
    `, [username, influencerResult.id, normalizedPlatform])

    if (!updatedAccount) {
      return NextResponse.json({ error: 'Social account not found' }, { status: 404 })
    }

    console.log('✅ Username updated successfully:', updatedAccount)

    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: `${normalizedPlatform.charAt(0).toUpperCase() + normalizedPlatform.slice(1).toLowerCase()} username updated successfully`
    })

  } catch (error) {
    console.error('Error updating username:', error)
    return NextResponse.json(
      { error: 'Failed to update username' },
      { status: 500 }
    )
  }
}
