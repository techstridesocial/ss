import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getBrandIdFromUserId, getBrandCampaignDetail, getBrandCampaignAnalytics } from '@/lib/db/queries/brand-campaigns'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const campaignId = params.id
    
    // Get brand ID for this user
    let brandId: string
    try {
      brandId = await getBrandIdFromUserId(userId)
    } catch (error) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
    }

    // Get query parameter for what data to fetch
    const { searchParams } = new URL(request.url)
    const include = searchParams.get('include')

    if (include === 'analytics') {
      // Get campaign analytics
      const analytics = await getBrandCampaignAnalytics(brandId, campaignId)
      return NextResponse.json({
        success: true,
        data: analytics
      })
    } else {
      // Get full campaign details
      const campaignDetail = await getBrandCampaignDetail(brandId, campaignId)
      return NextResponse.json({
        success: true,
        data: campaignDetail
      })
    }
    
  } catch (error) {
    console.error('Error fetching campaign detail:', error)
    
    if (error instanceof Error && error.message === 'Campaign not found or access denied') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign details' },
      { status: 500 }
    )
  }
}
