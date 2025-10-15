import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, queryOne } from '@/lib/db/connection'

// GET - Get all social accounts for the current influencer
export async function GET(request: NextRequest) {
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
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
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

    // Check user's role in Clerk
    const { user } = await auth()
    const clerkRole = user?.publicMetadata?.role
    console.log('🔑 User role in Clerk publicMetadata:', clerkRole)

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
      profileData
    })

    let newAccount
    try {
      newAccount = await queryOne(`
        INSERT INTO influencer_platforms (
          influencer_id,
          platform,
          username,
          profile_url,
          followers,
          engagement_rate,
          avg_views,
          is_connected,
          last_synced
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `, [
        influencerResult.id,
        normalizedPlatform,
        handle,
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

// PUT - Update social account data
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { accountId, updateData } = body

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

    // Update social account in influencer_platforms
    const updatedAccount = await queryOne(`
      UPDATE influencer_platforms
      SET 
        followers = COALESCE($2, followers),
        engagement_rate = COALESCE($3, engagement_rate),
        avg_views = COALESCE($4, avg_views),
        profile_url = COALESCE($5, profile_url),
        last_synced = NOW()
      WHERE id = $1 AND influencer_id = $6
      RETURNING *
    `, [
      accountId,
      updateData?.followers,
      updateData?.engagementRate,
      updateData?.avgViews,
      updateData?.profilePicture,
      influencerResult.id
    ])

    if (!updatedAccount) {
      return NextResponse.json(
        { error: 'Account not found or not owned by user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Social account updated successfully'
    })

  } catch (error) {
    console.error('Error updating social account:', error)
    return NextResponse.json(
      { error: 'Failed to update social account' },
      { status: 500 }
    )
  }
}

// DELETE - Disconnect a social account
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

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
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
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
