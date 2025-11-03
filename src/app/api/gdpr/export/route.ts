import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { exportAuditDataForUser } from '@/lib/db/queries/audit'
import { logAuditEvent } from '@/lib/db/queries/audit'

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user data
    const userData = await query(`
      SELECT u.*, up.*
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.clerk_id = $1
    `, [userId])

    if (!userData.length) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userData[0]

    // Get user's brand data (if applicable)
    const brandData = await query(`
      SELECT b.*, bc.*
      FROM brands b
      LEFT JOIN brand_contacts bc ON b.id = bc.brand_id
      WHERE b.user_id = $1
    `, [user.id])

    // Get user's influencer data (if applicable)
    const influencerData = await query(`
      SELECT i.*, ip.*
      FROM influencers i
      LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE i.user_id = $1
    `, [user.id])

    // Get user's campaigns
    const campaignData = await query(`
      SELECT c.*, ci.*
      FROM campaigns c
      JOIN campaign_influencers ci ON c.id = ci.campaign_id
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE i.user_id = $1
    `, [user.id])

    // Get user's shortlists (if brand)
    const shortlistData = await query(`
      SELECT s.*, si.*
      FROM shortlists s
      LEFT JOIN shortlist_influencers si ON s.id = si.shortlist_id
      WHERE s.brand_id = $1
    `, [user.id])

    // Get user's audit trail
    const auditData = await exportAuditDataForUser(user.id)

    // Compile GDPR export data
    const gdprExport = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      clerk_id: user.clerk_id,
      user_data: {
        profile: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        profile_details: {
          display_name: user.display_name,
          location: user.location,
          phone_number: user.phone_number,
          website: user.website,
          bio: user.bio,
          is_onboarded: user.is_onboarded
        }
      },
      brand_data: brandData,
      influencer_data: influencerData,
      campaign_data: campaignData,
      shortlist_data: shortlistData,
      audit_trail: auditData.success ? auditData.data : [],
      data_usage: {
        data_types_collected: [
          'Personal information (name, email, phone)',
          'Profile information (bio, location, website)',
          'Brand information (company details, contacts)',
          'Influencer information (platforms, metrics)',
          'Campaign participation data',
          'Audit logs of user actions'
        ],
        purpose: 'Platform functionality, campaign management, and user experience',
        retention_period: 'Data is retained for the duration of account activity plus 30 days',
        third_parties: [
          'Clerk (authentication)',
          'Neon (database hosting)',
          'Vercel (hosting)'
        ]
      }
    }

    // Log the GDPR export request
    await logAuditEvent({
      user_id: user.id,
      action: 'GDPR_DATA_EXPORT',
      table_name: 'users',
      record_id: user.id,
      metadata: {
        export_date: gdprExport.export_date,
        data_types: Object.keys(gdprExport).filter(key => key !== 'data_usage')
      }
    })

    return NextResponse.json({
      success: true,
      message: 'GDPR data export completed successfully',
      data: gdprExport
    })

  } catch (_error) {
    console.error('GDPR export error:', error)
    return NextResponse.json(
      { error: 'Failed to export GDPR data' },
      { status: 500 }
    )
  }
} 