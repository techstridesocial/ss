import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '../../../../lib/auth/roles'
import { getBrandById, updateBrand } from '../../../../lib/db/queries/brands'

// GET - Fetch brand by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({
        error: 'Access denied. Only staff and admin users can view brands'
      }, { status: 403 })
    }

    const brandId = params.id
    const brand = await getBrandById(brandId)

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: brand
    })

  } catch (error) {
    console.error('Error in GET /api/brands/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}

// PATCH - Update brand
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({
        error: 'Access denied. Only staff and admin users can update brands'
      }, { status: 403 })
    }

    const brandId = params.id
    const body = await request.json()
    
    // Update brand
    const updatedBrand = await updateBrand(brandId, body)

    return NextResponse.json({
      success: true,
      data: updatedBrand,
      message: 'Brand updated successfully'
    })

  } catch (error) {
    console.error('Error in PATCH /api/brands/[id]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update brand' },
      { status: 500 }
    )
  }
}



