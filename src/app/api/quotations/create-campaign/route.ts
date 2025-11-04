import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createCampaignFromQuotation } from '@/lib/db/queries/quotations'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quotationId } = await request.json()

    if (!quotationId) {
      return NextResponse.json(
        { error: 'Quotation ID is required' },
        { status: 400 }
      )
    }

    // Create campaign from approved quotation
    const _campaignId = await createCampaignFromQuotation(quotationId)
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Quotation not found or not approved' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully from approved quotation',
      campaignId
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign from quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign from quotation' },
      { status: 500 }
    )
  }
} 