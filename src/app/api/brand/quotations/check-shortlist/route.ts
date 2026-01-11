import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getQuotationByShortlistId } from '@/lib/db/queries/quotations'

// GET - Check if a quotation exists for a shortlist
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const shortlistId = searchParams.get('shortlistId')

    if (!shortlistId) {
      return NextResponse.json(
        { success: false, error: 'shortlistId parameter is required' },
        { status: 400 }
      )
    }

    // Check if quotation exists for this shortlist
    const quotation = await getQuotationByShortlistId(shortlistId)
    
    return NextResponse.json({
      success: true,
      exists: !!quotation,
      quotation: quotation ? {
        id: quotation.id,
        status: quotation.status
      } : null
    })
    
  } catch (error) {
    console.error('Error checking quotation for shortlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check quotation' },
      { status: 500 }
    )
  }
}

