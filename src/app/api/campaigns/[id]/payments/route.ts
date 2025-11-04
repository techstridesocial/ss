import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query, queryOne } from '@/lib/db/connection'

// GET - Get payment status for all influencers in a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can view payment information' },
        { status: 403 }
      )
    }

    // Await params in Next.js 15
    const { id } = await params
    const _campaignId = id

    // Get payment status for all influencers in the campaign
    const payments = await query(`
      SELECT 
        ci.influencer_id,
        ci.payment_status,
        ci.payment_date,
        i.display_name as influencer_name,
        up.first_name,
        up.last_name,
        ci.status as campaign_status
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ci.campaign_id = $1
      ORDER BY ci.created_at ASC
    `, [campaignId])

    // Get payment summary
    const summary = await queryOne(`
      SELECT 
        COUNT(*) as total_influencers,
        COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_count,
        COUNT(CASE WHEN payment_status = 'PENDING' THEN 1 END) as pending_count
      FROM campaign_influencers
      WHERE campaign_id = $1
    `, [campaignId])

    return NextResponse.json({
      success: true,
      data: {
        payments: payments.map(payment => ({
          influencerId: payment.influencer_id,
          influencerName: payment.influencer_name || `${payment.first_name} ${payment.last_name}`,
          status: payment.payment_status,
          paymentDate: payment.payment_date,
          campaignStatus: payment.campaign_status
        })),
        summary: {
          totalInfluencers: parseInt(summary?.total_influencers || '0'),
          paidCount: parseInt(summary?.paid_count || '0'),
          pendingCount: parseInt(summary?.pending_count || '0')
        }
      }
    })

  } catch (error) {
    console.error('Error fetching campaign payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment information' },
      { status: 500 }
    )
  }
}

// POST - Mark payment as paid for an influencer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can update payment status' },
        { status: 403 }
      )
    }

    const _campaignId = params.id
    const { influencerId, status } = await request.json()

    if (!influencerId || !status) {
      return NextResponse.json(
        { error: 'Influencer ID and status are required' },
        { status: 400 }
      )
    }

    if (!['PENDING', 'PAID'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING or PAID' },
        { status: 400 }
      )
    }

    // Verify the influencer is assigned to this campaign
    const campaignInfluencer = await queryOne(`
      SELECT id, status as campaign_status
      FROM campaign_influencers
      WHERE campaign_id = $1 AND influencer_id = $2
    `, [campaignId, influencerId])

    if (!campaignInfluencer) {
      return NextResponse.json(
        { error: 'Influencer is not assigned to this campaign' },
        { status: 404 }
      )
    }

    // Update payment status
    const updateResult = await query(`
      UPDATE campaign_influencers 
      SET 
        payment_status = $3,
        payment_date = CASE WHEN $3 = 'PAID' THEN NOW() ELSE NULL END,
        updated_at = NOW()
      WHERE campaign_id = $1 AND influencer_id = $2
      RETURNING *
    `, [campaignId, influencerId, status])

    if (updateResult.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    // Check if all payments are complete and update campaign status
    if (status === 'PAID') {
      const allPaymentsComplete = await queryOne(`
        SELECT COUNT(*) as total,
               COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_count
        FROM campaign_influencers
        WHERE campaign_id = $1
      `, [campaignId])

      if (allPaymentsComplete && 
          parseInt(allPaymentsComplete.total) > 0 && 
          parseInt(allPaymentsComplete.total) === parseInt(allPaymentsComplete.paid_count)) {
        
        // All payments are complete, update campaign status
        await query(`
          UPDATE campaigns 
          SET status = 'COMPLETED', updated_at = NOW()
          WHERE id = $1
        `, [campaignId])
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: {
        influencerId,
        status,
        paymentDate: status === 'PAID' ? new Date().toISOString() : null
      }
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
} 