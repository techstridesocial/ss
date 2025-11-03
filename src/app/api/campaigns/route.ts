import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllCampaigns, createCampaign, addInfluencerToCampaign } from '@/lib/db/queries/campaigns'
import { cache } from '@/lib/cache/redis'
import { cacheKeys } from '@/lib/cache/cache-keys'
import { TTL } from '@/lib/cache/cache-middleware'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.error('❌ Authentication failed - no user ID found')
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'Please sign in to continue',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    // Try to get from cache first
    const cacheKey = cacheKeys.campaign.list()
    const cached = await cache.get<any[]>(cacheKey)
    
    if (cached) {
      return NextResponse.json({ 
        success: true, 
        campaigns: cached,
        cached: true
      }, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${TTL.CAMPAIGN_LIST}, stale-while-revalidate=${TTL.CAMPAIGN_LIST * 2}`,
        }
      })
    }

    const campaigns = await getAllCampaigns()
    
    // Cache the result
    await cache.set(cacheKey, campaigns, TTL.CAMPAIGN_LIST)
    
    return NextResponse.json({ 
      success: true, 
      campaigns,
      cached: false
    }, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': `public, max-age=${TTL.CAMPAIGN_LIST}, stale-while-revalidate=${TTL.CAMPAIGN_LIST * 2}`,
      }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Campaign creation API called')
    const { userId } = await auth()
    console.log('🔐 Auth result:', { userId: userId ? 'Found' : 'Not found' })
    
    if (!userId) {
      console.error('❌ Authentication failed - no user ID found')
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'Please sign in to continue',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    console.log('📝 Parsing request body...')
    const data = await request.json()
    console.log('📋 Request data received:', { 
      name: data.name, 
      brand: data.brand, 
      description: data.description?.substring(0, 50) + '...',
      hasTimeline: !!data.timeline,
      hasBudget: !!data.budget,
      hasRequirements: !!data.requirements,
      selectedInfluencers: data.selectedInfluencers?.length || 0
    })

    // Get user's database ID and details
    const { query } = await import('@/lib/db/connection')
    const userResult = await query<{ id: string; email: string; first_name: string; last_name: string }>(
      'SELECT id, email, first_name, last_name FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ 
        error: 'User not found in database' 
      }, { status: 404 })
    }

    const user = userResult[0]!
    console.log('👤 User database ID:', user.id)
    
    // Validate required fields
    const requiredFields = ['name', 'brand', 'description']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the campaign with default values for missing fields
    const campaignData = {
      name: data.name,
      brand: data.brand,
      status: data.status || 'DRAFT',
      description: data.description,
      goals: data.goals || [],
      timeline: {
        startDate: data.timeline?.startDate || new Date().toISOString(),
        endDate: data.timeline?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: data.timeline?.applicationDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        contentDeadline: data.timeline?.contentDeadline || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      budget: {
        total: data.budget?.total || 0,
        perInfluencer: data.budget?.perInfluencer || 0
      },
      requirements: {
        minFollowers: data.requirements?.minFollowers || 1000,
        maxFollowers: data.requirements?.maxFollowers || 1000000,
        minEngagement: data.requirements?.minEngagement || 2.0,
        platforms: data.requirements?.platforms || [],
        demographics: data.requirements?.demographics || {},
        contentGuidelines: data.requirements?.contentGuidelines || ''
      },
      deliverables: data.deliverables || [],
      createdBy: {
        id: user.id,
        email: user.email || 'unknown@email.com',
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User'
      }
    } as any

    console.log('🗄️ Creating campaign in database...')
    console.log('📊 Campaign data to save:', JSON.stringify(campaignData, null, 2))
    
    const campaign = await createCampaign(campaignData)
    console.log('✅ Campaign created successfully:', { id: campaign.id, name: campaign.name })
    
    // Invalidate campaigns list cache
    await cache.del(cacheKeys.campaign.list())
    
    // Add selected influencers to the campaign if any were selected
    if (data.selectedInfluencers && data.selectedInfluencers.length > 0) {
      console.log('👥 Adding selected influencers to campaign...')
      try {
        for (const influencer of data.selectedInfluencers) {
          // Extract ID from influencer object (could be influencer.id or influencer.influencerId)
          const influencerId = typeof influencer === 'string' 
            ? influencer 
            : (influencer.id || influencer.influencerId)
          
          if (influencerId) {
            // Manually added influencers are automatically accepted
            await addInfluencerToCampaign(campaign.id, influencerId)
          } else {
            console.warn('⚠️ Skipping influencer without valid ID:', influencer)
          }
        }
        console.log(`✅ Added ${data.selectedInfluencers.length} influencers to campaign`)
      } catch (influencerError) {
        console.error('⚠️ Error adding influencers to campaign:', influencerError)
        // Don't fail the campaign creation, just log the error
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      campaign 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 