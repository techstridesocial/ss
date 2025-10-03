import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  createShortlist, 
  getShortlistsByBrand, 
  updateShortlist, 
  deleteShortlist,
  duplicateShortlist 
} from '@/lib/db/queries/shortlists'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

// Helper function to get brand_id from Clerk userId
async function getBrandIdFromUserId(userId: string): Promise<string> {
  // Get user ID from Clerk userId
  const userResult = await query<{ id: string }>(
    'SELECT id FROM users WHERE clerk_id = $1',
    [userId]
  )

  if (userResult.length === 0) {
    throw new Error('User not found')
  }

  const user_id = userResult[0]?.id

  // Get brand ID from user ID
  const brandResult = await query<{ id: string }>(
    'SELECT id FROM brands WHERE user_id = $1',
    [user_id]
  )

  if (brandResult.length === 0) {
    throw new Error('Brand not found - Please complete onboarding first')
  }

  return brandResult[0]?.id
}

// GET /api/shortlists - Get all shortlists for the authenticated brand
export async function GET() {
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

    // Get brand ID from Clerk userId
    let brand_id: string
    try {
      brand_id = await getBrandIdFromUserId(userId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage === 'User not found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      } else if (errorMessage.includes('Brand not found')) {
        // Brand hasn't completed onboarding - return empty shortlists instead of error
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      throw error
    }

    // Get brand shortlists using brand_id
    const shortlists = await getShortlistsByBrand(brand_id)
    
    return NextResponse.json({
      success: true,
      data: shortlists
    })
  } catch (error) {
    console.error('Error fetching shortlists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shortlists' },
      { status: 500 }
    )
  }
}

// POST /api/shortlists - Create a new shortlist
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description, duplicate_from } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    let shortlist
    
    if (duplicate_from) {
      // Duplicate existing shortlist
      console.log('Duplicating shortlist:', { duplicate_from, name: name.trim(), description: description?.trim() })
      try {
        shortlist = await duplicateShortlist(duplicate_from, name.trim(), description?.trim())
        console.log('Duplicate result:', shortlist)
        if (!shortlist) {
          return NextResponse.json({ error: 'Source shortlist not found' }, { status: 404 })
        }
      } catch (error) {
        console.error('Error in duplicateShortlist:', error)
        return NextResponse.json({ error: 'Failed to duplicate shortlist' }, { status: 500 })
      }
    } else {
      // Get brand ID from Clerk userId
      let brand_id: string
      try {
        brand_id = await getBrandIdFromUserId(userId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        if (errorMessage === 'User not found') {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        } else if (errorMessage.includes('Brand not found')) {
          return NextResponse.json({ error: 'Please complete onboarding first' }, { status: 400 })
        }
        throw error
      }
      
      // Create new shortlist
      shortlist = await createShortlist(brand_id, name.trim(), description?.trim())
      
      // If this is a new shortlist, we need to get it with influencers structure
      shortlist = {
        ...shortlist,
        influencers: []
      }
    }
    
    return NextResponse.json({
      success: true,
      data: shortlist
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating shortlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create shortlist' },
      { status: 500 }
    )
  }
}

// PUT /api/shortlists - Update shortlist
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { id, name, description } = body

    if (!id) {
      return NextResponse.json({ error: 'Shortlist ID is required' }, { status: 400 })
    }

    const updates: { name?: string; description?: string } = {}
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 })
      }
      updates.name = name.trim()
    }
    
    if (description !== undefined) {
      updates.description = typeof description === 'string' ? description.trim() : undefined
    }

    const shortlist = await updateShortlist(id, updates)
    
    if (!shortlist) {
      return NextResponse.json({ error: 'Shortlist not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: shortlist
    })
  } catch (error) {
    console.error('Error updating shortlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update shortlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/shortlists - Delete shortlist
export async function DELETE(request: NextRequest) {
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
    const shortlistId = searchParams.get('id')

    if (!shortlistId) {
      return NextResponse.json({ error: 'Shortlist ID is required' }, { status: 400 })
    }

    const success = await deleteShortlist(shortlistId)
    
    if (!success) {
      return NextResponse.json({ error: 'Shortlist not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Shortlist deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting shortlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete shortlist' },
      { status: 500 }
    )
  }
}
