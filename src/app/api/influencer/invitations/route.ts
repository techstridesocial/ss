import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

// GET - Get campaign invitations for the current influencer
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID and influencer ID from clerk_id
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1 LIMIT 1',
      [userId]
    )
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0]!.id

    // Get influencer record
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1 LIMIT 1',
      [user_id]
    )
    
    if (influencerResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    const influencer_id = influencerResult[0]!.id

    // Get pending invitations with campaign details
    const invitations = await query<{
      id: string
      campaign_id: string
      campaign_name: string
      brand_name: string | null
      brand_logo: string | null
      description: string | null
      budget: number | null
      per_influencer_budget: number | null
      deliverables: string | null
      content_guidelines: string | null
      start_date: Date | null
      end_date: Date | null
      content_deadline: Date | null
      status: string
      sent_at: Date
      response_deadline: Date | null
      message: string | null
    }>(`
      SELECT 
        ci.id,
        ci.campaign_id,
        c.name as campaign_name,
        COALESCE(b.company_name, c.brand) as brand_name,
        b.logo_url as brand_logo,
        c.description,
        c.total_budget as budget,
        c.per_influencer_budget,
        c.deliverables,
        c.content_guidelines,
        c.start_date,
        c.end_date,
        c.content_deadline,
        ci.status,
        ci.sent_at,
        ci.response_deadline,
        ci.message
      FROM campaign_invitations ci
      INNER JOIN campaigns c ON ci.campaign_id = c.id
      LEFT JOIN brands b ON c.brand_id = b.id
      WHERE ci.influencer_id = $1
      ORDER BY 
        CASE WHEN ci.status = 'sent' THEN 0 ELSE 1 END,
        ci.sent_at DESC
    `, [influencer_id])

    // Format the invitations
    const formattedInvitations = invitations.map(inv => ({
      id: inv.id,
      campaignId: inv.campaign_id,
      campaignName: inv.campaign_name,
      brandName: inv.brand_name || 'Unknown Brand',
      brandLogo: inv.brand_logo,
      description: inv.description,
      compensation: inv.per_influencer_budget || inv.budget,
      deliverables: inv.deliverables ? safeParseJSON(inv.deliverables, []) : [],
      contentGuidelines: inv.content_guidelines,
      timeline: {
        startDate: inv.start_date,
        endDate: inv.end_date,
        contentDeadline: inv.content_deadline
      },
      status: inv.status,
      sentAt: inv.sent_at,
      responseDeadline: inv.response_deadline,
      message: inv.message
    }))

    // Separate pending and responded invitations
    const pending = formattedInvitations.filter(inv => inv.status === 'sent')
    const responded = formattedInvitations.filter(inv => inv.status !== 'sent')

    return NextResponse.json({ 
      invitations: formattedInvitations,
      pending,
      responded,
      counts: {
        total: formattedInvitations.length,
        pending: pending.length,
        accepted: formattedInvitations.filter(inv => inv.status === 'accepted').length,
        declined: formattedInvitations.filter(inv => inv.status === 'declined').length
      }
    })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

// Helper function to safely parse JSON
function safeParseJSON(str: string | null, defaultValue: unknown[] | Record<string, unknown> = []) {
  if (!str) return defaultValue
  try {
    const parsed = JSON.parse(str)
    return parsed
  } catch {
    return defaultValue
  }
}
