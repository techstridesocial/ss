import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
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

    // Enhanced validation
    if (data.first_name.length < 2) {
      return NextResponse.json(
        { error: 'First name must be at least 2 characters long' }, 
        { status: 400 }
      )
    }

    if (data.last_name.length < 2) {
      return NextResponse.json(
        { error: 'Last name must be at least 2 characters long' }, 
        { status: 400 }
      )
    }

    if (data.display_name.length < 3) {
      return NextResponse.json(
        { error: 'Display name must be at least 3 characters long' }, 
        { status: 400 }
      )
    }

    if (data.location.length < 2) {
      return NextResponse.json(
        { error: 'Location must be at least 2 characters long' }, 
        { status: 400 }
      )
    }

    // Validate phone number format if provided
    if (data.phone_number && data.phone_number.trim() !== '') {
      // Check for any letters first
      if (/[a-zA-Z]/.test(data.phone_number)) {
        return NextResponse.json(
          { error: 'Phone number cannot contain letters' }, 
          { status: 400 }
        )
      }
      
      // Clean the phone number (remove spaces, dashes, parentheses, dots)
      const cleanPhone = data.phone_number.replace(/[\s\-\(\)\.]/g, '')
      
      // Strict phone regex: optional +, followed by 7-15 digits only
      const phoneRegex = /^[\+]?[\d]{7,15}$/
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { error: 'Phone number must contain only numbers, spaces, dashes, parentheses, and optionally start with +' }, 
          { status: 400 }
        )
      }
    }

    // Validate website URL format if provided
    if (data.website && !data.website.startsWith('http')) {
      data.website = 'https://' + data.website
    }

    // Get user_id from users table using clerk_id, create if doesn't exist
    let userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    let user_id: string

    if (userResult.length === 0 || !userResult[0]) {
      // User doesn't exist, create one automatically
      console.log('User not found, creating new record for clerk_id:', userId)
      
      try {
        // Get user details from Clerk
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`
        const userRole = clerkUser.publicMetadata?.role as string || 'INFLUENCER_SIGNED'
        
        console.log('Creating user with email:', userEmail, 'role:', userRole)
        
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
        console.log('✅ Created new user with ID:', user_id)
        
      } catch (createUserError: any) {
        console.error('Error creating user:', createUserError)
        // Return a more specific error
        return NextResponse.json(
          { error: 'Database error: ' + (createUserError?.message || 'Could not create user record') }, 
          { status: 500 }
        )
      }
    } else {
      user_id = userResult[0].id
    }

    // Start transaction to create/update influencer and profile records
    const result = await transaction(async (client) => {
      // Check if user profile exists
      const existingProfile = await client.query(
        'SELECT id FROM user_profiles WHERE user_id = $1',
        [user_id]
      )

      if (existingProfile.rows.length > 0) {
        // Update existing profile
        await client.query(`
          UPDATE user_profiles SET 
            first_name = $2,
            last_name = $3,
            avatar_url = $4,
            phone = $5,
            location_country = $6,
            is_onboarded = $7,
            updated_at = NOW()
          WHERE user_id = $1
        `, [
          user_id,
          data.first_name,
          data.last_name,
          data.profile_picture || null,
          data.phone_number || null,
          data.location,
          true
        ])
      } else {
        // Create new profile
        await client.query(`
          INSERT INTO user_profiles (
            user_id, first_name, last_name, avatar_url, phone, location_country, is_onboarded
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          user_id,
          data.first_name,
          data.last_name,
          data.profile_picture || null,
          data.phone_number || null,
          data.location,
          true
        ])
      }

      // Check if influencer record exists
      const existingInfluencer = await client.query(
        'SELECT id FROM influencers WHERE user_id = $1',
        [user_id]
      )

      let influencerId

      if (existingInfluencer.rows.length > 0) {
        // Update existing influencer
        const influencerResult = await client.query(`
          UPDATE influencers SET 
            display_name = $2,
            onboarding_completed = $3,
            updated_at = NOW()
          WHERE user_id = $1
          RETURNING id
        `, [
          user_id,
          data.display_name,
          true
        ])
        influencerId = influencerResult.rows[0].id
      } else {
        // Create new influencer
        const influencerResult = await client.query(`
          INSERT INTO influencers (
            user_id, display_name, onboarding_completed, ready_for_campaigns
          ) VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [
          user_id,
          data.display_name,
          true,
          false // Not ready for campaigns until staff approval
        ])
        influencerId = influencerResult.rows[0].id
      }

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