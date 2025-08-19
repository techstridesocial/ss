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

    // Get brand shortlists using Clerk userId
    const shortlists = await getShortlistsByBrand(userId)
    
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
      shortlist = await duplicateShortlist(duplicate_from, name.trim(), description?.trim())
      if (!shortlist) {
        return NextResponse.json({ error: 'Source shortlist not found' }, { status: 404 })
      }
    } else {
      // Create new shortlist
      shortlist = await createShortlist(userId, name.trim(), description?.trim())
      
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
