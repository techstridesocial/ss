import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getBrandIdFromUserId } from '@/lib/db/queries/brand-campaigns'
import {
  getSubmissionListById,
  updateSubmissionList
} from '@/lib/db/queries/submissions'
import { withCache } from '@/lib/cache/cache-middleware'
import { TTL } from '@/lib/cache/cache-middleware'
import { cache } from '@/lib/cache/redis'

// GET - Get submission list details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params

    // Get brand ID
    let brandId: string
    try {
      brandId = await getBrandIdFromUserId(userId)
    } catch (error) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    // Use cached query for performance (5 minute TTL)
    const list = await withCache(
      `submission:brand:${id}:${brandId}`,
      TTL.MEDIUM, // 5 minutes
      async () => {
        const data = await getSubmissionListById(id)
        // Verify ownership before caching
        if (data && data.brandId !== brandId) {
          throw new Error('Forbidden - This list does not belong to your brand')
        }
        return data
      }
    )

    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    // Verify list belongs to this brand
    if (list.brandId !== brandId) {
      return NextResponse.json({ error: 'Forbidden - This list does not belong to your brand' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: list
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching submission list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission list' },
      { status: 500 }
    )
  }
}

// PATCH - Update status (APPROVE/REJECT/REVISION_REQUESTED)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    const data = await request.json()

    // Get brand ID
    let brandId: string
    try {
      brandId = await getBrandIdFromUserId(userId)
    } catch (error) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    // Verify list belongs to this brand
    const list = await getSubmissionListById(id)
    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    if (list.brandId !== brandId) {
      return NextResponse.json({ error: 'Forbidden - This list does not belong to your brand' }, { status: 403 })
    }

    // Validate status
    const validStatuses = ['APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'UNDER_REVIEW']
    if (!data.status || !validStatuses.includes(data.status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Only allow status changes from SUBMITTED or UNDER_REVIEW
    if (list.status !== 'SUBMITTED' && list.status !== 'UNDER_REVIEW') {
      return NextResponse.json(
        { error: `Cannot change status from ${list.status}` },
        { status: 400 }
      )
    }

    // Update status
    const updated = await updateSubmissionList(id, {
      status: data.status
    })

    // Invalidate cache after update
    await cache.delete(`submission:brand:${id}:${brandId}`)
    await cache.deletePattern(`submission:*:${id}*`)

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Submission list ${data.status.toLowerCase()} successfully`
    })
  } catch (error) {
    console.error('Error updating submission list status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update submission list status' },
      { status: 500 }
    )
  }
}

