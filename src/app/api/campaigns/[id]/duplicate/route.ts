import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { duplicateCampaign } from '@/lib/db/queries/campaigns'

// POST - Duplicate campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params in Next.js 15
    const { id } = await params
    const { newName } = await request.json()
    
    if (!newName) {
      return NextResponse.json({ 
        error: 'New campaign name is required' 
      }, { status: 400 })
    }

    const duplicatedCampaign = await duplicateCampaign(id, newName)
    
    if (!duplicatedCampaign) {
      return NextResponse.json({ 
        error: 'Campaign not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Campaign duplicated successfully',
      campaign: duplicatedCampaign 
    }, { status: 201 })
  } catch (error) {
    console.error('Error duplicating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate campaign' },
      { status: 500 }
    )
  }
} 