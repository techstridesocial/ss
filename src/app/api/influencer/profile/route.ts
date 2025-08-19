import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, transaction } from '@/lib/db/connection'
import { cacheModashProfile } from '@/lib/services/modash-cache'

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

// POST - Save selected Modash profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { selectedProfile, platform } = await request.json()

    if (!selectedProfile || !platform) {
      return NextResponse.json(
        { error: 'Missing selectedProfile or platform' },
        { status: 400 }
      )
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

    // Get influencer_id
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1',
      [user_id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json(
        { error: 'Influencer profile not found' },
        { status: 404 }
      )
    }

    const influencer_id = influencerResult[0]?.id

    // Update or insert platform data
    const result = await transaction(async (client) => {
      // Check if platform record exists
      const existing = await client.query(
        'SELECT id FROM influencer_platforms WHERE influencer_id = $1 AND platform = $2',
        [influencer_id, platform.toUpperCase()]
      )

      if (existing.length > 0) {
        // Update existing record
        await client.query(`
          UPDATE influencer_platforms SET
            username = $1,
            followers = $2,
            engagement_rate = $3,
            avg_views = $4,
            is_connected = true,
            last_synced = NOW(),
            modash_profile_id = $5,
            updated_at = NOW()
          WHERE influencer_id = $6 AND platform = $7
        `, [
          selectedProfile.username,
          selectedProfile.followers || 0,
          selectedProfile.engagement_rate || 0,
          selectedProfile.avg_views || 0,
          selectedProfile.profile_id || selectedProfile.id,
          influencer_id,
          platform.toUpperCase()
        ])
      } else {
        // Insert new record
        await client.query(`
          INSERT INTO influencer_platforms (
            influencer_id, platform, username, followers, 
            engagement_rate, avg_views, is_connected, 
            last_synced, modash_profile_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), $7, NOW(), NOW())
        `, [
          influencer_id,
          platform.toUpperCase(),
          selectedProfile.username,
          selectedProfile.followers || 0,
          selectedProfile.engagement_rate || 0,
          selectedProfile.avg_views || 0,
          selectedProfile.profile_id || selectedProfile.id
        ])
      }

      // Update main influencer totals
      const totalQuery = `
        SELECT 
          SUM(followers) as total_followers,
          AVG(engagement_rate) as avg_engagement_rate,
          AVG(avg_views) as avg_views
        FROM influencer_platforms 
        WHERE influencer_id = $1 AND is_connected = true
      `
      
      const totals = await client.query(totalQuery, [influencer_id])
      
      if (totals.length > 0) {
        await client.query(`
          UPDATE influencers SET
            total_followers = $1,
            total_engagement_rate = $2,
            total_avg_views = $3,
            updated_at = NOW()
          WHERE id = $4
        `, [
          totals[0].total_followers || 0,
          totals[0].avg_engagement_rate || 0,
          totals[0].avg_views || 0,
          influencer_id
        ])
      }

      return { success: true }
    })

    // Cache the full Modash profile data ONCE (no auto-updates)
    console.log(`🔄 Caching full Modash profile for ${platform} user ${selectedProfile.username}`)
    const cacheResult = await cacheModashProfile(
      influencer_id,
      selectedProfile.profile_id || selectedProfile.id || selectedProfile.username,
      platform
    )
    
    if (!cacheResult.success) {
      console.warn(`⚠️ Failed to cache Modash profile: ${cacheResult.error}`)
      // Continue anyway - basic profile was saved
    } else {
      console.log(`✅ Successfully cached full Modash profile for ${platform} user ${selectedProfile.username} - NO AUTO-UPDATES`)
    }

    return NextResponse.json({
      success: true,
      message: 'Profile connected successfully',
      cached: cacheResult.success
    })

  } catch (error) {
    console.error('Error saving selected profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
} 