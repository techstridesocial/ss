import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'

export async function POST(_request: NextRequest) {
  try {
    // Add is_onboarded field if it doesn't exist
    await query(`
      ALTER TABLE user_profiles 
      ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE
    `)

    // Update existing brand users to show they need onboarding
    const brandUpdateResult = await query(`
      UPDATE user_profiles 
      SET is_onboarded = FALSE 
      WHERE user_id IN (
        SELECT id FROM users WHERE role = 'BRAND'
      )
    `)

    // Update existing influencer users to show they need onboarding
    const influencerUpdateResult = await query(`
      UPDATE user_profiles 
      SET is_onboarded = FALSE 
      WHERE user_id IN (
        SELECT id FROM users WHERE role IN ('INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED')
      )
    `)

    return NextResponse.json({
      success: true,
      message: 'Onboarding field migration completed successfully',
      updated: {
        brands: brandUpdateResult.length,
        influencers: influencerUpdateResult.length
      }
    })

  } catch (_error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed' }, 
      { status: 500 }
    )
  }
} 