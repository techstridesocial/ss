import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getBrandIdFromUserId } from '@/lib/db/queries/brand-campaigns'
import { getBrandQuotations, createQuotationRequest } from '@/lib/db/queries/quotations'
import { notifyQuoteSubmitted } from '@/lib/services/notifications'

// GET - Fetch all quotations for the brand
export async function GET(_request: _NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a brand
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'BRAND') {
      return NextResponse.json({ error: 'Forbidden - Brand access required' }, { status: 403 })
    }

    // Get brand ID for this user
    let brandId: string
    try {
      brandId = await getBrandIdFromUserId(userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Brand not found')) {
        // Brand hasn't completed onboarding - return empty quotations
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    // Get quotations for this brand
    const quotations = await getBrandQuotations(brandId)
    
    return NextResponse.json({
      success: true,
      data: quotations
    })
    
  } catch (error) {
    console.error('Error fetching brand quotations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

// POST - Create a new quotation request
export async function POST(_request: _NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a brand
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'BRAND') {
      return NextResponse.json({ error: 'Forbidden - Brand access required' }, { status: 403 })
    }

    // Get brand ID for this user
    let brandId: string
    let brandName: string
    try {
      brandId = await getBrandIdFromUserId(userId)
      
      // Also get brand name
      const { query } = await import('@/lib/db/connection')
      const brandResult = await query(`
        SELECT company_name FROM brands WHERE id = $1
      `, [brandId])
      
      brandName = brandResult[0]?.company_name || 'Unknown Brand'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Brand not found')) {
        return NextResponse.json({ error: 'Please complete brand onboarding first' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    const data = await _request.json()
    
    // Validate required fields
    const requiredFields = ['campaign_name', 'description', 'influencer_count']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Handle staff assignment
    let assignedStaffId = data.assigned_staff_id || null
    
    // If no staff assigned, try to auto-assign based on brand's assigned staff
    if (!assignedStaffId) {
      try {
        const { query: dbQuery } = await import('@/lib/db/connection')
        const brandStaffResult = await dbQuery(`
          SELECT assigned_staff_id FROM brands WHERE id = $1 AND assigned_staff_id IS NOT NULL
        `, [brandId])
        
        if (brandStaffResult.length > 0) {
          assignedStaffId = brandStaffResult[0].assigned_staff_id
          console.log('🎯 Auto-assigned quote to brand manager:', assignedStaffId)
        }
      } catch (error) {
        console.log('⚠️ Could not auto-assign staff, will remain unassigned')
      }
    }

    // Create the quotation request
    const quotationData = {
      brand_id: brandId,
      brand_name: brandName,
      campaign_name: data.campaign_name,
      description: data.description,
      influencer_count: parseInt(data.influencer_count),
      budget_range: data.budget_range || '',
      campaign_duration: data.campaign_duration || '',
      deliverables: data.deliverables || [],
      target_demographics: data.target_demographics || '',
      selected_influencers: data.selected_influencers || [], // Array of influencer IDs
      assigned_staff_id: assignedStaffId
    }

    const quotation = await createQuotationRequest(quotationData)
    
    // Send notification to assigned staff member
    if (assignedStaffId) {
      try {
        await notifyQuoteSubmitted(
          assignedStaffId,
          brandName,
          data.campaign_name,
          quotation.id
        )
        console.log(`📬 Notification sent to staff ${assignedStaffId} for new quote`)
      } catch (error) {
        console.error('Failed to send notification:', error)
        // Don't fail the request if notification fails
      }
    }
    
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

