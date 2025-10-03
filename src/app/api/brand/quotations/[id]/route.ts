import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getBrandIdFromUserId } from '@/lib/db/queries/brand-campaigns'
import { updateQuotation } from '@/lib/db/queries/quotations'
import { query } from '@/lib/db/connection'

// PATCH - Update quotation status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    const quotationId = params.id
    const data = await request.json()

    // Verify quotation belongs to this brand
    const quotationResult = await query(`
      SELECT brand_id FROM quotations WHERE id = $1
    `, [quotationId])

    if (quotationResult.length === 0) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    if (quotationResult[0].brand_id !== brandId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update quotation status
    const updatedQuotation = await updateQuotation(quotationId, {
      status: data.status
    })

    if (!updatedQuotation) {
      return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      quotation: updatedQuotation
    })

  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update quotation' },
      { status: 500 }
    )
  }
}

