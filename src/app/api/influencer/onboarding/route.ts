import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, transaction } from '@/lib/db/connection'

interface InfluencerOnboardingRequest {
  first_name: string
  last_name: string
  display_name: string
  phone_number?: string
  location: string
  website?: string
  profile_picture?: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: InfluencerOnboardingRequest = await request.json()

    // Validate required fields
    const requiredFields: (keyof InfluencerOnboardingRequest)[] = [
      'first_name', 'last_name', 'display_name', 'location'
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` }, 
          { status: 400 }
        )
      }
    }

    // Validate email format if website provided
    if (data.website && !data.website.startsWith('http')) {
      data.website = 'https://' + data.website
    }

    // Get user_id from users table using clerk_id
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0]) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    const user_id = userResult[0].id

    // Start transaction to create/update influencer and profile records
    const result = await transaction(async (client) => {
      // Update or insert user profile
      await client.query(`
        INSERT INTO user_profiles (
          user_id, first_name, last_name, avatar_url, phone, location_country, is_onboarded
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          first_name = $2,
          last_name = $3,
          avatar_url = $4,
          phone = $5,
          location_country = $6,
          is_onboarded = $7,
          updated_at = NOW()
      `, [
        user_id,
        data.first_name,
        data.last_name,
        data.profile_picture || null,
        data.phone_number || null,
        data.location,
        true
      ])

      // Create or update influencer record
      const influencerResult = await client.query(`
        INSERT INTO influencers (
          user_id, display_name, onboarding_completed, ready_for_campaigns
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET 
          display_name = $2,
          onboarding_completed = $3,
          updated_at = NOW()
        RETURNING id
      `, [
        user_id,
        data.display_name,
        true,
        false // Not ready for campaigns until staff approval
      ])

      const influencerId = influencerResult.rows[0].id

      // Update user status to indicate onboarding is complete
      await client.query(`
        UPDATE users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = $1
      `, [user_id])

      return { influencerId }
    })

    return NextResponse.json({
      success: true,
      message: 'Influencer onboarding completed successfully',
      influencer_id: result.influencerId
    })

  } catch (error) {
    console.error('Influencer onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 