import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
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
  contact_name: string
  contact_role: string
  contact_email: string
  contact_phone?: string
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
      'target_regions', 'contact_name', 'contact_role', 'contact_email'
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

    if (data.description.length < 10) {
      return NextResponse.json(
        { error: 'Company description must be at least 10 characters long' }, 
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.contact_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
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

    // Start transaction to create brand and contact records
    const result = await transaction(async (client) => {
      // Insert brand record
      const brandResult = await client.query(`
        INSERT INTO brands (
          user_id, company_name, industry, website_url, 
          company_size, annual_budget_range, preferred_niches, 
          preferred_regions, description, logo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        data.logo_url || null
      ])

      const brandId = brandResult.rows[0].id

      // Insert primary contact
      await client.query(`
        INSERT INTO brand_contacts (
          brand_id, name, email, phone, role, is_primary, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        brandId,
        data.contact_name,
        data.contact_email,
        data.contact_phone || null,
        data.contact_role,
        true,
        `Company description: ${data.description}`
      ])

      // Update user status to indicate onboarding is complete
      await client.query(`
        UPDATE users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = $1
      `, [user_id])

      // Update or insert user profile
      await client.query(`
        INSERT INTO user_profiles (
          user_id, first_name, last_name, is_onboarded
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          is_onboarded = $4,
          updated_at = NOW()
      `, [
        user_id,
        data.contact_name.split(' ')[0] || '',
        data.contact_name.split(' ').slice(1).join(' ') || '',
        true
      ])

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