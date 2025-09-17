import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { query, transaction } from '@/lib/db/connection'

interface OnboardingRequest {
  company_name: string
  website: string
  industry: string
  company_size: string
  description: string // Stored in brands table
  logo_url?: string // Stored in brands table
  annual_budget: string
  preferred_niches: string[]
  target_regions: string[]
  // Brand Contact Information
  brand_contact_name: string
  brand_contact_role: string
  brand_contact_email: string
  brand_contact_phone?: string
  // New Optional Fields
  primary_region?: string
  campaign_objective?: string
  product_service_type?: string
  preferred_contact_method?: string
  proactive_suggestions?: string
  // Team Member Invitations (Optional)
  invite_team_members?: string
  team_member_1_email?: string
  team_member_2_email?: string
  // Stride Social Contact Information
  stride_contact_name?: string
  stride_contact_email?: string
  stride_contact_phone?: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: OnboardingRequest = await request.json()

    // Validate required fields
    const requiredFields: (keyof OnboardingRequest)[] = [
      'company_name', 'website', 'industry', 'company_size', 
      'description', 'annual_budget', 'preferred_niches', 
      'target_regions', 'brand_contact_name', 'brand_contact_role', 'brand_contact_email'
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
    if (data.company_name.length < 2) {
      return NextResponse.json(
        { error: 'Company name must be at least 2 characters long' }, 
        { status: 400 }
      )
    }



    // Validate email format for brand contact
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.brand_contact_email)) {
      return NextResponse.json(
        { error: 'Invalid brand contact email format' }, 
        { status: 400 }
      )
    }

    // Validate optional Stride contact email if provided
    if (data.stride_contact_email && !emailRegex.test(data.stride_contact_email)) {
      return NextResponse.json(
        { error: 'Invalid Stride contact email format' }, 
        { status: 400 }
      )
    }

    // Validate website URL format
    if (data.website && !data.website.startsWith('http')) {
      data.website = 'https://' + data.website
    }

    // Validate arrays
    if (!Array.isArray(data.preferred_niches) || data.preferred_niches.length === 0) {
      return NextResponse.json(
        { error: 'At least one content niche must be selected' }, 
        { status: 400 }
      )
    }

    if (!Array.isArray(data.target_regions) || data.target_regions.length === 0) {
      return NextResponse.json(
        { error: 'At least one target region must be selected' }, 
        { status: 400 }
      )
    }

    // Map budget options to database values
    const budgetMapping: Record<string, string> = {
      'under-10k': '0-10k',
      '10k-25k': '10k-25k',
      '25k-50k': '25k-50k',
      '50k-100k': '50k-100k',
      '100k-250k': '100k-250k',
      '250k-500k': '250k-500k',
      '500k+': '500k+'
    }

    const mappedBudget = budgetMapping[data.annual_budget] || data.annual_budget

    // Get user_id from users table using clerk_id, create if doesn't exist
    let userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    let user_id: string

    if (userResult.length === 0 || !userResult[0]) {
      // User doesn't exist, create one automatically
      console.log('User not found, creating new brand record for clerk_id:', userId)
      
      try {
        // Get user details from Clerk
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`
        const userRole = clerkUser.publicMetadata?.role as string || 'BRAND'
        
        console.log('Creating brand user with email:', userEmail, 'role:', userRole)
        
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
        console.log('✅ Created new brand user with ID:', user_id)
        
      } catch (createUserError: any) {
        console.error('Error creating brand user:', createUserError)
        return NextResponse.json(
          { error: 'Database error: ' + (createUserError?.message || 'Could not create user record') }, 
          { status: 500 }
        )
      }
    } else {
      user_id = userResult[0].id
    }

    // Start transaction to create brand and contact records
    const result = await transaction(async (client) => {
      // Insert brand record with new optional fields
      const brandResult = await client.query(`
        INSERT INTO brands (
          user_id, company_name, industry, website_url, 
          company_size, annual_budget_range, preferred_niches, 
          preferred_regions, description, logo_url,
          primary_region, campaign_objective, product_service_type,
          preferred_contact_method, proactive_suggestions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, [
        user_id,
        data.company_name,
        data.industry,
        data.website,
        data.company_size,
        mappedBudget,
        data.preferred_niches,
        data.target_regions,
        data.description,
        data.logo_url || null,
        data.primary_region || null,
        data.campaign_objective || null,
        data.product_service_type || null,
        data.preferred_contact_method || null,
        data.proactive_suggestions || null
      ])

      const brandId = brandResult.rows[0].id

      // Insert brand primary contact
      await client.query(`
        INSERT INTO brand_contacts (
          brand_id, name, email, phone, role, is_primary, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        brandId,
        data.brand_contact_name,
        data.brand_contact_email,
        data.brand_contact_phone || null,
        data.brand_contact_role,
        true,
        `Brand contact for ${data.company_name}`
      ])

      // Insert Stride Social contact if provided
      if (data.stride_contact_name || data.stride_contact_email || data.stride_contact_phone) {
        await client.query(`
          INSERT INTO brand_contacts (
            brand_id, name, email, phone, role, is_primary, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          brandId,
          data.stride_contact_name || 'Stride Team Member',
          data.stride_contact_email || null,
          data.stride_contact_phone || null,
          'Stride Social Contact',
          false,
          `Stride Social team contact for ${data.company_name}`
        ])
      }

      // Insert team member invitations if provided
      if (data.invite_team_members === 'yes') {
        // Insert team member 1 if email provided
        if (data.team_member_1_email && data.team_member_1_email.trim()) {
          await client.query(`
            INSERT INTO brand_contacts (
              brand_id, name, email, phone, role, is_primary, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            brandId,
            'Team Member', // Default name since we only collect email
            data.team_member_1_email.trim(),
            null, // No phone collected
            'Team Member',
            false, // Not primary contact
            `Team member invited during onboarding for ${data.company_name}`
          ])
        }

        // Insert team member 2 if email provided
        if (data.team_member_2_email && data.team_member_2_email.trim()) {
          await client.query(`
            INSERT INTO brand_contacts (
              brand_id, name, email, phone, role, is_primary, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            brandId,
            'Team Member', // Default name since we only collect email
            data.team_member_2_email.trim(),
            null, // No phone collected
            'Team Member',
            false, // Not primary contact
            `Team member invited during onboarding for ${data.company_name}`
          ])
        }
      }

      // Update user status to indicate onboarding is complete
      await client.query(`
        UPDATE users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = $1
      `, [user_id])

      // Check if user profile exists and update or insert
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
            is_onboarded = $4,
            updated_at = NOW()
          WHERE user_id = $1
        `, [
          user_id,
          data.brand_contact_name.split(' ')[0] || '',
          data.brand_contact_name.split(' ').slice(1).join(' ') || '',
          true
        ])
      } else {
        // Create new profile
        await client.query(`
          INSERT INTO user_profiles (
            user_id, first_name, last_name, is_onboarded
          ) VALUES ($1, $2, $3, $4)
        `, [
          user_id,
          data.brand_contact_name.split(' ')[0] || '',
          data.brand_contact_name.split(' ').slice(1).join(' ') || '',
          true
        ])
      }

      return { brandId }
    })

    return NextResponse.json({
      success: true,
      message: 'Brand onboarding completed successfully',
      brand_id: result.brandId
    })

  } catch (error) {
    console.error('Brand onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 