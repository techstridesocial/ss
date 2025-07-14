import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'

// Mock storage for influencer contact status
// In real implementation, this would be stored in database
let influencerContactStatus: Record<string, Record<string, string>> = {}

// GET - Get contact status for influencers in a quotation
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const quotationId = searchParams.get('quotationId')

    if (!quotationId) {
      return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 })
    }

    const contactStatuses = influencerContactStatus[quotationId] || {}

    return NextResponse.json({
      quotationId,
      contactStatuses
    })
  } catch (error) {
    console.error('Error fetching contact status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update contact status for an influencer
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Only staff members can update contact status' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { quotationId, influencerIndex, status } = body

    if (!quotationId || influencerIndex === undefined || !status) {
      return NextResponse.json({ 
        error: 'quotationId, influencerIndex, and status are required' 
      }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'contacted', 'confirmed', 'declined']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    // Initialize quotation contact status if it doesn't exist
    if (!influencerContactStatus[quotationId]) {
      influencerContactStatus[quotationId] = {}
    }

    // Update the contact status
    influencerContactStatus[quotationId][influencerIndex] = status

    console.log('Updated influencer contact status:', {
      quotationId,
      influencerIndex,
      status,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Contact status updated successfully',
      quotationId,
      influencerIndex,
      status
    })
  } catch (error) {
    console.error('Error updating contact status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Bulk update contact statuses
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ 
        error: 'Only staff members can update contact status' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { quotationId, updates } = body

    if (!quotationId || !updates || !Array.isArray(updates)) {
      return NextResponse.json({ 
        error: 'quotationId and updates array are required' 
      }, { status: 400 })
    }

    // Initialize quotation contact status if it doesn't exist
    if (!influencerContactStatus[quotationId]) {
      influencerContactStatus[quotationId] = {}
    }

    // Apply all updates
    const validStatuses = ['pending', 'contacted', 'confirmed', 'declined']
    for (const update of updates) {
      const { influencerIndex, status } = update
      
      if (influencerIndex === undefined || !status) {
        continue // Skip invalid updates
      }

      if (!validStatuses.includes(status)) {
        continue // Skip invalid statuses
      }

      influencerContactStatus[quotationId][influencerIndex] = status
    }

    console.log('Bulk updated influencer contact statuses:', {
      quotationId,
      updates,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Contact statuses updated successfully',
      quotationId,
      updatedCount: updates.length
    })
  } catch (error) {
    console.error('Error bulk updating contact status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 