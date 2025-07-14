import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'

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

    const { quotationId } = await request.json()

    if (!quotationId) {
      return NextResponse.json(
        { error: 'Quotation ID is required' },
        { status: 400 }
      )
    }

    // Update quotation status to APPROVED - no automatic campaign creation
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/quotations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        quotationId,
        status: 'APPROVED'
        // No create_campaign flag - staff must manually contact influencers first
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to approve quotation')
    }

    // Log for debugging - in real implementation this would be in database
    console.log('Brand approved quotation - ready for manual influencer contact:', {
      quotationId,
      approved_at: new Date().toISOString(),
      status: 'APPROVED'
    })

    return NextResponse.json({
      success: true,
      message: 'Quotation approved - staff can now manually contact influencers',
      quotation: result.quotation
    })

  } catch (error) {
    console.error('Error approving quotation:', error)
    return NextResponse.json(
      { error: 'Failed to approve quotation' },
      { status: 500 }
    )
  }
} 