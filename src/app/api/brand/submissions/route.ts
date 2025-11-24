import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getBrandIdFromUserId } from '@/lib/db/queries/brand-campaigns'
import { getBrandSubmissionLists } from '@/lib/db/queries/submissions'

// GET - List submission lists for brand
export async function GET(_request: NextRequest) {
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
        // Brand hasn't completed onboarding - return empty lists
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    // Get submission lists for this brand
    const lists = await getBrandSubmissionLists(brandId)

    return NextResponse.json({
      success: true,
      data: lists
    })
  } catch (error) {
    console.error('Error fetching brand submission lists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission lists' },
      { status: 500 }
    )
  }
}

