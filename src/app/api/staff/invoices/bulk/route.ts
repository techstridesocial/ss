import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db/connection'

export async function PUT(request: NextRequest) {
  try {
    const { invoiceIds, status, staff_notes } = await request.json()

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json({ error: 'Invoice IDs are required' }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const client = await getDatabase().connect()

    try {
      await client.query('BEGIN')

      // Update each invoice
      for (const invoiceId of invoiceIds) {
        // Update the invoice status
        await client.query(
          'UPDATE influencer_invoices SET status = $1, staff_notes = $2, updated_at = NOW() WHERE id = $3',
          [status, staff_notes || null, invoiceId]
        )

        // Add to status history
        await client.query(
          'INSERT INTO invoice_status_history (invoice_id, new_status, changed_by, notes, created_at) VALUES ($1, $2, $3, $4, NOW())',
          [invoiceId, status, 'staff', staff_notes || null]
        )
      }

      await client.query('COMMIT')

      return NextResponse.json({ 
        message: `Successfully updated ${invoiceIds.length} invoices to ${status}`,
        updatedCount: invoiceIds.length
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error updating bulk invoice status:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    )
  }
}
