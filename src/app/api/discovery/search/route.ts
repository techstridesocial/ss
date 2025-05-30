import { NextRequest, NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

interface DiscoverySearchBody {
  platform: 'instagram' | 'tiktok' | 'youtube'
  
  // Performance filters
  followersMin?: number
  followersMax?: number
  engagementRate?: number
  avgViewsMin?: number
  avgViewsMax?: number
  followersGrowth?: number
  followersGrowthPeriod?: string
  totalLikesGrowth?: number
  totalLikesGrowthPeriod?: string
  viewsGrowth?: number
  viewsGrowthPeriod?: string
  sharesMin?: number
  sharesMax?: number
  savesMin?: number
  savesMax?: number
  
  // Content filters
  bio?: string
  hashtags?: string
  mentions?: string
  captions?: string
  topics?: string
  transcript?: string
  collaborations?: string
  hasSponsoredPosts?: boolean
  selectedContentCategories?: string[]
  
  // Account filters
  accountType?: string
  selectedSocials?: string[]
  fakeFollowers?: string
  lastPosted?: string
  verifiedOnly?: boolean
  
  // Demographics
  selectedLocation?: string
  selectedGender?: string
  selectedAge?: string
  selectedLanguage?: string
  
  // Search options
  searchQuery?: string
  emailAvailable?: boolean
  hideProfilesInRoster?: boolean
  
  // Pagination
  page?: number
  limit?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscoverySearchBody = await request.json()
    
    console.log('🎯 Discovery Search API called with:', {
      platform: body.platform,
      hasFilters: !!body,
      filterKeys: Object.keys(body).filter(k => body[k as keyof DiscoverySearchBody] !== undefined)
    })
    
    // Validate required fields
    if (!body.platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    // Map UI filters to Modash format
    const modashFilters = mapToModashFilters(body)
    
    console.log('🔍 Discovery API called with filters:', JSON.stringify(modashFilters, null, 2))
    console.log('📦 Full request body:', JSON.stringify(body, null, 2))
    
    // Try real Modash API first
    try {
      console.log('🚀 Attempting real Modash API call...')
      console.log('🎯 Platform:', body.platform)
      console.log('📄 Page:', body.page || 0, 'Limit:', body.limit || 20)
      
      const results = await modashService.searchDiscovery(
        modashFilters,
        body.page || 0,
        body.limit || 20
      )
      
      console.log('✅ Modash API successful:', {
        totalResults: results.total,
        returnedResults: results.results?.length || 0,
        hasMore: results.hasMore,
        creditsUsed: results.creditsUsed
      })
      
      return NextResponse.json({
        success: true,
        data: results,
        filters: modashFilters,
        note: 'Real Modash API data'
      })
    } catch (modashError) {
      console.warn('⚠️ Modash API failed:', {
        error: modashError instanceof Error ? modashError.message : modashError,
        stack: modashError instanceof Error ? modashError.stack : undefined
      })
      
      // Fallback to mock data
      const mockResponse = generateMockResponse(body, modashFilters)
      
      return NextResponse.json({
        success: true,
        data: mockResponse,
        filters: modashFilters,
        note: 'Mock data - Modash API credentials pending activation',
        warning: 'Using mock data while Modash API access is being configured',
        apiError: modashError instanceof Error ? modashError.message : 'Unknown error'
      })
    }
    
  } catch (error) {
    console.error('❌ Discovery search API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Discovery search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

function mapToModashFilters(body: DiscoverySearchBody) {
  const filters: any = {
    platform: body.platform
  }
  
  // Performance filters
  if (body.followersMin || body.followersMax) {
    filters.followers = {}
    if (body.followersMin) filters.followers.min = body.followersMin
    if (body.followersMax) filters.followers.max = body.followersMax
  }
  
  if (body.engagementRate && body.engagementRate > 0) {
    filters.engagementRate = body.engagementRate
  }
  
  if (body.avgViewsMin || body.avgViewsMax) {
    filters.avgViews = {}
    if (body.avgViewsMin) filters.avgViews.min = body.avgViewsMin
    if (body.avgViewsMax) filters.avgViews.max = body.avgViewsMax
  }
  
  // Content filters
  const contentKeywords = []
  if (body.bio?.trim()) contentKeywords.push(body.bio.trim())
  if (body.captions?.trim()) contentKeywords.push(body.captions.trim())
  if (body.topics?.trim()) contentKeywords.push(body.topics.trim())
  if (body.transcript?.trim()) contentKeywords.push(body.transcript.trim())
  
  if (contentKeywords.length > 0) {
    filters.bio = contentKeywords.join(' ')
  }
  
  // Hashtags
  if (body.hashtags?.trim()) {
    const hashtags = body.hashtags.split(',').map(tag => tag.trim()).filter(Boolean)
    if (hashtags.length > 0) {
      filters.hashtags = hashtags
    }
  }
  
  // Mentions  
  if (body.mentions?.trim()) {
    const mentions = body.mentions.split(',').map(mention => mention.trim()).filter(Boolean)
    if (mentions.length > 0) {
      filters.mentions = mentions
    }
  }
  
  // Content categories as topics
  if (body.selectedContentCategories && body.selectedContentCategories.length > 0) {
    filters.topics = body.selectedContentCategories
  }
  
  // Account filters
  if (body.verifiedOnly) {
    filters.verified = true
  }
  
  // Location mapping (would need location ID mapping)
  if (body.selectedLocation && body.selectedLocation !== '') {
    // Map location names to Modash location IDs
    const locationMapping = {
      'united_kingdom': [826],
      'united_states': [840], 
      'canada': [124],
      'australia': [36],
      'germany': [276],
      'france': [250]
    }
    filters.location = locationMapping[body.selectedLocation as keyof typeof locationMapping] || []
  }
  
  // Search query as relevance
  if (body.searchQuery?.trim()) {
    filters.relevance = [body.searchQuery.trim()]
  }
  
  return filters
}

function generateMockResponse(body: DiscoverySearchBody, filters: any) {
  // Generate mock influencers based on filters
  const mockInfluencers = [
    {
      userId: 'mock_1',
      username: 'fashionista_uk',
      display_name: 'Fashion Influencer UK',
      platform: body.platform,
      followers: 75000,
      engagement_rate: 4.2,
      profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      bio: 'Fashion & Lifestyle | London based | Brand collaborations',
      location: 'United Kingdom',
      verified: true,
      score: 88,
      already_imported: false
    },
    {
      userId: 'mock_2',
      username: 'beautyguru_london',
      display_name: 'Beauty Guru London',
      platform: body.platform,
      followers: 125000,
      engagement_rate: 3.8,
      profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      bio: 'Beauty enthusiast | Makeup tutorials | Product reviews',
      location: 'United Kingdom',
      verified: true,
      score: 92,
      already_imported: false
    },
    {
      userId: 'mock_3',
      username: 'fitness_coach_uk',
      display_name: 'UK Fitness Coach',
      platform: body.platform,
      followers: 50000,
      engagement_rate: 5.1,
      profile_picture: 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=150&h=150&fit=crop&crop=face',
      bio: 'Personal trainer | Nutrition tips | Workout routines',
      location: 'United Kingdom',
      verified: false,
      score: 85,
      already_imported: true
    }
  ]
  
  // Filter based on follower range if specified
  let filteredResults = mockInfluencers
  if (filters.followers?.min) {
    filteredResults = filteredResults.filter(i => i.followers >= filters.followers.min)
  }
  if (filters.followers?.max) {
    filteredResults = filteredResults.filter(i => i.followers <= filters.followers.max)
  }
  
  const page = body.page || 0
  const limit = body.limit || 20
  const start = page * limit
  const paginatedResults = filteredResults.slice(start, start + limit)
  
  return {
    results: paginatedResults,
    total: filteredResults.length,
    page,
    limit,
    hasMore: (page + 1) * limit < filteredResults.length,
    creditsUsed: 0 // No credits used for mock data
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Discovery search API is running'
  })
} 