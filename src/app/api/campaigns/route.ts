import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllCampaigns, createCampaign, addInfluencerToCampaign } from '@/lib/db/queries/campaigns'
import { createQuotationRequest } from '@/lib/db/queries/quotations'
import { getBrandIdFromUserId } from '@/lib/db/queries/brand-campaigns'
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

    // Get user's database ID and details (with profile data)
    const { query } = await import('@/lib/db/connection')
    const userResult = await query<{ id: string; email: string; first_name: string | null; last_name: string | null }>(
      `SELECT 
        u.id, 
        u.email, 
        up.first_name, 
        up.last_name 
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.clerk_id = $1`,
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
        // Convert date strings (YYYY-MM-DD) to ISO format if needed
        startDate: data.timeline?.startDate 
          ? (data.timeline.startDate.includes('T') ? data.timeline.startDate : new Date(data.timeline.startDate).toISOString())
          : new Date().toISOString(),
        endDate: data.timeline?.endDate 
          ? (data.timeline.endDate.includes('T') ? data.timeline.endDate : new Date(data.timeline.endDate).toISOString())
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: data.timeline?.applicationDeadline 
          ? (data.timeline.applicationDeadline.includes('T') ? data.timeline.applicationDeadline : new Date(data.timeline.applicationDeadline).toISOString())
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        contentDeadline: data.timeline?.contentDeadline 
          ? (data.timeline.contentDeadline.includes('T') ? data.timeline.contentDeadline : new Date(data.timeline.contentDeadline).toISOString())
          : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
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
        name: (() => {
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
          if (fullName) return fullName
          // Fallback to email prefix if no name available
          if (user.email) return user.email.split('@')[0]
          return 'Unknown User'
        })()
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
    
    // If campaign is created from shortlists, also create a quotation for tracking
    if (data.createdFromShortlists && data.selectedInfluencers && data.selectedInfluencers.length > 0) {
      try {
        console.log('📋 Creating quotation record for tracking...')
        
        // Get brand ID
        let brandId: string | undefined
        try {
          brandId = await getBrandIdFromUserId(userId)
        } catch (brandError) {
          console.warn('⚠️ Could not get brand ID for quotation creation:', brandError)
          // Continue without creating quotation if brand not found
          brandId = undefined
        }
        
        if (brandId) {
          // Get brand name
          const brandResult = await query<{ company_name: string }>(
            'SELECT company_name FROM brands WHERE id = $1',
            [brandId]
          )
          const brandName = brandResult[0]?.company_name || data.brand || 'Unknown Brand'
          
          // Create quotation with APPROVED status since campaign is created directly
          const quotation = await createQuotationRequest({
            brand_id: brandId,
            brand_name: brandName,
            campaign_name: campaign.name,
            description: campaign.description || '',
            influencer_count: data.selectedInfluencers.length,
            budget_range: campaign.budget?.total ? `$${campaign.budget.total.toLocaleString()}` : undefined,
            campaign_duration: campaign.timeline?.endDate 
              ? `${Math.ceil((new Date(campaign.timeline.endDate).getTime() - new Date(campaign.timeline.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
              : undefined,
            deliverables: campaign.deliverables || [],
            target_demographics: campaign.requirements?.demographics 
              ? JSON.stringify(campaign.requirements.demographics)
              : undefined,
            selected_influencers: data.selectedInfluencers.map((inf: any) => 
              typeof inf === 'string' ? inf : (inf.id || inf.influencerId)
            ).filter(Boolean)
          })
          
          // Update quotation status to APPROVED since it's created from a direct campaign
          await query(
            'UPDATE quotations SET status = $1, approved_at = NOW(), total_quote = $2 WHERE id = $3',
            ['APPROVED', campaign.budget?.total || 0, quotation.id]
          )
          
          console.log('✅ Quotation created and approved:', quotation.id)
        }
      } catch (quotationError) {
        console.error('⚠️ Error creating quotation (non-blocking):', quotationError)
        // Don't fail campaign creation if quotation creation fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      campaign 
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating campaign:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    
    console.error('❌ Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    
    // #region agent log
    const errorDetails = {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
      type: error instanceof Error ? error.constructor.name : typeof error
    }
    fetch('http://127.0.0.1:7242/ingest/de3a372f-100d-40c3-826e-bd025afd226e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/campaigns/route.ts:186',message:'Campaign creation error in API',data:errorDetails,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H_CAMPAIGN_API_ERROR'})}).catch(()=>{});
    // #endregion
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create campaign',
        details: errorMessage,
        message: errorMessage // Include both error and message for compatibility
      },
      { status: 500 }
    )
  }
} 