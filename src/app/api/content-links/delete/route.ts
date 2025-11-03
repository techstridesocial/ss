import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { ContentLinkDeletionService } from '@/lib/services/content-link-deletion'

// DELETE - Delete a specific content link from all tables
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has staff/admin role
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff/Admin access required' }, { status: 403 })
    }

    const { contentLink, influencerId, campaignId, deleteAll = false } = await request.json()

    if (!contentLink && !deleteAll) {
      return NextResponse.json(
        { error: 'Content link URL is required' },
        { status: 400 }
      )
    }

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    console.log(`🗑️ API: Deleting content link(s) for influencer ${influencerId}`)

    let result
    if (deleteAll) {
      // Delete all content links for the influencer
      result = await ContentLinkDeletionService.deleteAllContentLinksForInfluencer(
        influencerId,
        campaignId
      )
    } else {
      // Delete specific content link
      result = await ContentLinkDeletionService.deleteContentLink(
        contentLink,
        influencerId,
        campaignId
      )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: deleteAll 
          ? 'All content links deleted successfully' 
          : 'Content link deleted successfully',
        result: {
          deletedFrom: result.deletedFrom,
          analyticsReset: result.analyticsReset,
          errors: result.errors
        }
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete content link(s)',
          details: result.errors
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Error in content link deletion API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Get content link statistics for an influencer
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has staff/admin role
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff/Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencerId')

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    console.log(`📊 API: Getting content link stats for influencer ${influencerId}`)

    const stats = await ContentLinkDeletionService.getContentLinkStats(influencerId)

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('❌ Error getting content link stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get content link statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
