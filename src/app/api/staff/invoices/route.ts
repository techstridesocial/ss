import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query, queryOne } from '@/lib/db/connection'

// GET - Get all invoices for staff management
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can view invoices' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const influencerId = searchParams.get('influencer_id')
    const _campaignId = searchParams.get('campaign_id')

    // Build query with filters
    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    if (status) {
      paramCount++
      whereClause += ` AND ii.status = $${paramCount}`
      queryParams.push(status)
    }

    if (influencerId) {
      paramCount++
      whereClause += ` AND ii.influencer_id = $${paramCount}`
      queryParams.push(influencerId)
    }

    if (campaignId) {
      paramCount++
      whereClause += ` AND ii.campaign_id = $${paramCount}`
      queryParams.push(campaignId)
    }

    // Get all invoices with related data
    const invoices = await query(`
      SELECT 
        ii.*,
        i.display_name as influencer_name,
        up.first_name,
        up.last_name,
        c.name as campaign_name,
        c.status as campaign_status,
        cb.email as created_by_email,
        vb.email as verified_by_email
      FROM influencer_invoices ii
      LEFT JOIN influencers i ON ii.influencer_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN campaigns c ON ii.campaign_id = c.id
      LEFT JOIN users cb ON ii.created_by = cb.id
      LEFT JOIN users vb ON ii.verified_by = vb.id
      ${whereClause}
      ORDER BY ii.created_at DESC
    `, queryParams)

    // Get summary statistics
    const summary = await queryOne(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'VERIFIED' THEN 1 END) as verified_count,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'DELAYED' THEN 1 END) as delayed_count,
        SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status IN ('SENT', 'VERIFIED', 'DELAYED') THEN total_amount ELSE 0 END) as pending_amount
      FROM influencer_invoices
    `)

    return NextResponse.json({ 
      invoices,
      summary 
    })
  } catch (_error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}
