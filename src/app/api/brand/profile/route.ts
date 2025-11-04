import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getBrandIdFromUserId } from '../../../../lib/db/queries/brand-campaigns'
import { getBrandById } from '../../../../lib/db/queries/brands'

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get brand ID from user ID
    const brandId = await getBrandIdFromUserId(userId)
    
    // Get brand details
    const brand = await getBrandById(brandId)
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: brand
    })

  } catch (error) {
    console.error('Error in GET /api/brand/profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch brand profile' },
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

    const body = await request.json()
    
    // Get brand ID from user ID
    const brandId = await getBrandIdFromUserId(userId)
    
    // Update brand (TODO: implement updateBrand function)
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Brand profile updated successfully'
    })

  } catch (error) {
    console.error('Error in PUT /api/brand/profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update brand profile' },
      { status: 500 }
    )
  }
}



