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

    // Update quotation status to APPROVED and automatically create campaign
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/quotations`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        quotationId,
        status: 'APPROVED',
        create_campaign: true  // Automatically create campaign when approved
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to approve quotation')
    }

    // Log for debugging - in real implementation this would be in database
    console.log('Brand approved quotation - automatically saved to quotation table:', {
      quotationId,
      approved_at: new Date().toISOString(),
      status: 'APPROVED'
    })

    return NextResponse.json({
      success: true,
      message: result.campaign 
        ? `Quotation approved and converted directly to campaign \"${result.campaign.name}\"! ${result.campaign.invitations_sent || 0} invitations sent to influencers.`
        : 'Quotation approved',
      quotation: result.quotation,
      ...(result.campaign && { campaign: result.campaign })
    })

  } catch (error) {
    console.error('Error approving quotation:', error)
    return NextResponse.json(
      { error: 'Failed to approve quotation' },
      { status: 500 }
    )
  }
} 