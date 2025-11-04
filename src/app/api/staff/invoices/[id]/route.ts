import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query, queryOne } from '@/lib/db/connection'

// GET - Get specific invoice details
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
        { error: 'Only staff members can view invoice details' },
        { status: 403 }
      )
    }

    // Await params in Next.js 15
    const { id } = await params
    const invoiceId = id

    // Get invoice with all related data
    const invoice = await queryOne(`
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
      WHERE ii.id = $1
    `, [invoiceId])

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Get invoice line items
    const lineItems = await query(`
      SELECT * FROM invoice_line_items 
      WHERE invoice_id = $1 
      ORDER BY created_at ASC
    `, [invoiceId])

    // Get status history
    const statusHistory = await query(`
      SELECT 
        ish.*,
        u.email as changed_by_email
      FROM invoice_status_history ish
      LEFT JOIN users u ON ish.changed_by = u.id
      WHERE ish.invoice_id = $1
      ORDER BY ish.created_at DESC
    `, [invoiceId])

    return NextResponse.json({ 
      invoice,
      lineItems,
      statusHistory 
    })
  } catch (error) {
    console.error('Error fetching invoice details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice details' },
      { status: 500 }
    )
  }
}

// PUT - Update invoice status
export async function PUT(
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
        { error: 'Only staff members can update invoice status' },
        { status: 403 }
      )
    }

    const { id: invoiceId } = await params
    const { status, staff_notes } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    if (!['SENT', 'VERIFIED', 'DELAYED', 'PAID', 'VOIDED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get user ID from Clerk ID
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0]?.id

    // Update invoice status
    const updateResult = await queryOne(`
      UPDATE influencer_invoices 
      SET 
        status = $2,
        staff_notes = $3,
        verified_by = $4,
        verified_at = CASE WHEN $2 = 'VERIFIED' THEN NOW() ELSE verified_at END,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [invoiceId, status, staff_notes, user_id])

    if (!updateResult) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Invoice status updated successfully',
      invoice: updateResult 
    })
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    )
  }
}
