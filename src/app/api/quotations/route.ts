import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllQuotations, createQuotation, updateQuotation } from '@/lib/db/queries/quotations'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quotations = await getAllQuotations()
    
    return NextResponse.json({ 
      success: true, 
      quotations 
    })
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['brandName', 'brandEmail', 'campaignDescription']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the quotation with default values for missing fields
    const quotationData = {
      brandName: data.brandName,
      brandEmail: data.brandEmail,
      industry: data.industry || '',
      campaignDescription: data.campaignDescription,
      targetAudience: data.targetAudience || '',
      budget: data.budget || 0,
      timeline: data.timeline || '',
      deliverables: data.deliverables || [],
      platforms: data.platforms || [],
      status: 'PENDING_REVIEW' as const,
      submittedAt: new Date(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      notes: data.notes || ''
    }

    const quotation = await createQuotation(quotationData)
    
    return NextResponse.json({ 
      success: true, 
      quotation 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { quotationId, status, final_price, notes } = data

    // Validate required fields
    if (!quotationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: quotationId' },
        { status: 400 }
      )
    }

    // Map frontend status to database status (handle lowercase/uppercase)
    const normalizedStatus = status 
      ? (status.toUpperCase() as 'PENDING_REVIEW' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED')
      : undefined

    // Prepare update object
    const updates: any = {}
    if (normalizedStatus) {
      updates.status = normalizedStatus
    }
    if (final_price !== undefined) {
      updates.budget = typeof final_price === 'number' ? final_price : parseFloat(final_price)
    }
    if (notes !== undefined) {
      updates.notes = notes
    }

    // Update the quotation
    const quotation = await updateQuotation(quotationId, updates)
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      quotation 
    })
  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update quotation' },
      { status: 500 }
    )
  }
} 