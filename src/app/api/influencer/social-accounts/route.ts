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

    // Get social accounts
    const socialAccounts = await query(`
      SELECT 
        id,
        platform,
        handle,
        followers,
        engagement_rate,
        avg_likes,
        avg_comments,
        avg_views,
        credibility_score,
        profile_picture_url,
        bio,
        verified,
        is_private,
        is_connected,
        last_sync,
        created_at,
        updated_at
      FROM influencer_social_accounts
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

    if (!platform || !handle) {
      return NextResponse.json(
        { error: 'Platform and handle are required' },
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

    // Check if account already exists
    const existingAccount = await queryOne(`
      SELECT id FROM influencer_social_accounts
      WHERE influencer_id = $1 AND platform = $2
    `, [influencerResult.id, platform])

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account already connected for this platform' },
        { status: 400 }
      )
    }

    // Insert new social account
    const newAccount = await queryOne(`
      INSERT INTO influencer_social_accounts (
        influencer_id,
        platform,
        handle,
        user_id,
        followers,
        engagement_rate,
        avg_likes,
        avg_comments,
        avg_views,
        credibility_score,
        profile_picture_url,
        bio,
        verified,
        is_private,
        is_connected,
        last_sync
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      RETURNING *
    `, [
      influencerResult.id,
      platform,
      handle,
      profileData?.userId || null,
      profileData?.followers || 0,
      profileData?.engagementRate || 0,
      profileData?.avgLikes || 0,
      profileData?.avgComments || 0,
      profileData?.avgViews || 0,
      profileData?.credibility || 0,
      profileData?.profilePicture || null,
      profileData?.bio || null,
      profileData?.verified || false,
      profileData?.isPrivate || false,
      true
    ])

    return NextResponse.json({
      success: true,
      data: newAccount,
      message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully`
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

    // Update social account
    const updatedAccount = await queryOne(`
      UPDATE influencer_social_accounts
      SET 
        followers = COALESCE($2, followers),
        engagement_rate = COALESCE($3, engagement_rate),
        avg_likes = COALESCE($4, avg_likes),
        avg_comments = COALESCE($5, avg_comments),
        avg_views = COALESCE($6, avg_views),
        credibility_score = COALESCE($7, credibility_score),
        profile_picture_url = COALESCE($8, profile_picture_url),
        bio = COALESCE($9, bio),
        verified = COALESCE($10, verified),
        is_private = COALESCE($11, is_private),
        last_sync = NOW()
      WHERE id = $1 AND influencer_id = $12
      RETURNING *
    `, [
      accountId,
      updateData?.followers,
      updateData?.engagementRate,
      updateData?.avgLikes,
      updateData?.avgComments,
      updateData?.avgViews,
      updateData?.credibility,
      updateData?.profilePicture,
      updateData?.bio,
      updateData?.verified,
      updateData?.isPrivate,
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

    // Delete social account
    const deletedAccount = await queryOne(`
      DELETE FROM influencer_social_accounts
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
