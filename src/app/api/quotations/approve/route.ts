import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { approveQuotation } from '@/lib/db/queries/quotations'

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Verify user is a brand (in real implementation)
    if (!userRole || userRole !== 'BRAND') {
      return NextResponse.json(
        { error: 'Only brands can approve quotations' },
        { status: 403 }
      )
    }

    const { quotationId, notes } = await request.json()

    if (!quotationId) {
      return NextResponse.json(
        { error: 'Quotation ID is required' },
        { status: 400 }
      )
    }

    // Get user info for the reviewedBy field
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Approve the quotation
    const approvedQuotation = await approveQuotation(quotationId, userId, notes)
    
    if (!approvedQuotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Quotation approved successfully - ready for manual influencer contact',
      quotation: approvedQuotation
    })
  } catch (_error) {
    console.error('Error approving quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve quotation' },
      { status: 500 }
    )
  }
} 