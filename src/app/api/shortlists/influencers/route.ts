import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  addInfluencerToShortlist, 
  removeInfluencerFromShortlist,
  addInfluencersToShortlist,
  getInfluencerShortlists,
  isInfluencerInShortlist 
} from '@/lib/db/queries/shortlists'
import { getCurrentUserRole } from '@/lib/auth/roles'

// POST /api/shortlists/influencers - Add influencer(s) to shortlist
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
    const { shortlist_id, influencer_id, influencer_ids } = body

    if (!shortlist_id) {
      return NextResponse.json({ error: 'Shortlist ID is required' }, { status: 400 })
    }

    let success = false

    if (influencer_ids && Array.isArray(influencer_ids)) {
      // Add multiple influencers
      success = await addInfluencersToShortlist(shortlist_id, influencer_ids)
    } else if (influencer_id) {
      // Add single influencer
      success = await addInfluencerToShortlist(shortlist_id, influencer_id)
    } else {
      return NextResponse.json({ error: 'Either influencer_id or influencer_ids is required' }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to add influencer(s) to shortlist' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Influencer(s) added to shortlist successfully'
    })
  } catch (error) {
    console.error('Error adding influencer(s) to shortlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add influencer(s) to shortlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/shortlists/influencers - Remove influencer from shortlist
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
    const shortlistId = searchParams.get('shortlist_id')
    const influencerId = searchParams.get('influencer_id')

    if (!shortlistId || !influencerId) {
      return NextResponse.json({ error: 'Both shortlist_id and influencer_id are required' }, { status: 400 })
    }

    const success = await removeInfluencerFromShortlist(shortlistId, influencerId)
    
    if (!success) {
      return NextResponse.json({ error: 'Influencer not found in shortlist' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Influencer removed from shortlist successfully'
    })
  } catch (error) {
    console.error('Error removing influencer from shortlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove influencer from shortlist' },
      { status: 500 }
    )
  }
}

// GET /api/shortlists/influencers - Get shortlists for an influencer or check if influencer is in shortlist
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
    const influencerId = searchParams.get('influencer_id')
    const shortlistId = searchParams.get('shortlist_id')
    const action = searchParams.get('action')

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 })
    }

    if (action === 'check' && shortlistId) {
      // Check if influencer is in specific shortlist
      const isInShortlist = await isInfluencerInShortlist(shortlistId, influencerId)
      return NextResponse.json({
        success: true,
        data: { is_in_shortlist: isInShortlist }
      })
    } else {
      // Get all shortlists containing this influencer
      const shortlists = await getInfluencerShortlists(userId, influencerId)
      return NextResponse.json({
        success: true,
        data: shortlists
      })
    }
  } catch (error) {
    console.error('Error fetching influencer shortlists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch influencer shortlists' },
      { status: 500 }
    )
  }
}
