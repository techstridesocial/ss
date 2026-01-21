import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { 
  getInvoiceById, 
  updateInvoiceStatus, 
  approveInvoice, 
  rejectInvoice,
  markInvoiceAsPaid,
  delayInvoice,
  InvoiceStatus 
} from '@/lib/db/queries/invoices'
import { query } from '@/lib/db/connection'
import { sanitizeString } from '@/lib/security/sanitize'

// GET - Get single invoice
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const invoice = await getInvoiceById(id)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, notes } = body

    // Get staff user ID for audit
    const staffResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )
    const staffId = staffResult[0]?.id

    if (!staffId) {
      return NextResponse.json({ error: 'Staff user not found' }, { status: 404 })
    }

    // Sanitize notes
    const sanitizedNotes = notes ? sanitizeString(notes) : undefined

    let invoice
    switch (action) {
      case 'approve':
        invoice = await approveInvoice(id, staffId, sanitizedNotes)
        break
      case 'reject':
        if (!sanitizedNotes) {
          return NextResponse.json(
            { error: 'Rejection reason is required' },
            { status: 400 }
          )
        }
        invoice = await rejectInvoice(id, staffId, sanitizedNotes)
        break
      case 'pay':
        invoice = await markInvoiceAsPaid(id, staffId, sanitizedNotes)
        break
      case 'delay':
        if (!sanitizedNotes) {
          return NextResponse.json(
            { error: 'Delay reason is required' },
            { status: 400 }
          )
        }
        invoice = await delayInvoice(id, staffId, sanitizedNotes)
        break
      case 'update':
        const status = body.status as InvoiceStatus
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required for update action' },
            { status: 400 }
          )
        }
        invoice = await updateInvoiceStatus(id, status, staffId, sanitizedNotes)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      invoice,
      message: `Invoice ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'pay' ? 'marked as paid' : 'updated'} successfully`
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}
