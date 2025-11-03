import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllQuotations, createQuotation } from '@/lib/db/queries/quotations'

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
      status: 'pending' as const,
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