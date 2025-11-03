import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { queryOne as _queryOne } from '@/lib/db/connection'
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/pdf/InvoicePDF'
import React from 'react'

// GET - Generate PDF for invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['INFLUENCER', 'STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const invoiceId = params.id

    // Get invoice details
    const invoice = await queryOne(`
      SELECT 
        ii.*,
        i.display_name as influencer_name,
        c.name as campaign_name
      FROM influencer_invoices ii
      LEFT JOIN influencers i ON ii.influencer_id = i.id
      LEFT JOIN campaigns c ON ii.campaign_id = c.id
      WHERE ii.id = $1
    `, [invoiceId])

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this invoice
    if (userRole === 'INFLUENCER') {
      // Get user ID from Clerk ID
      const userResult = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE clerk_id = $1',
        [userId]
      )

      if (!userResult) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get influencer ID
      const influencerResult = await queryOne<{ id: string }>(
        'SELECT id FROM influencers WHERE user_id = $1',
        [userResult.id]
      )

      if (!influencerResult || influencerResult.id !== invoice.influencer_id) {
        return NextResponse.json(
          { error: 'Access denied to this invoice' },
          { status: 403 }
        )
      }
    }

    // Generate PDF
    const pdfBuffer = await pdf(React.createElement(InvoicePDF, { invoice })).toBuffer()

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
