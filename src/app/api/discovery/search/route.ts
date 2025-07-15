import { NextRequest, NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

interface DiscoverySearchBody {
  platform: 'instagram' | 'tiktok' | 'youtube' // This will now be ignored, we'll search all platforms
  
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

interface MergedCreator {
  creatorId: string
  displayName: string
  platforms: {
    instagram?: any
    tiktok?: any
    youtube?: any
  }
  totalFollowers: number
  averageEngagement: number
  verified: boolean
  location: string
  bio: string
  profilePicture: string
  score: number
}

export async function POST(request: NextRequest) {
  try {
    const body: DiscoverySearchBody = await request.json()
    
    console.log('🔍 Discovery search:', {
      platform: body.platform,
      hasQuery: !!body.searchQuery,
      filtersCount: Object.keys(body).filter(k => body[k as keyof DiscoverySearchBody] !== undefined && k !== 'platform').length
    })
    
    // Search all three platforms in parallel
    const platforms = ['instagram', 'tiktok', 'youtube'] as const
    
    try {
      const searchPromises = platforms.map(async (platform) => {
        try {
          const filters = mapToModashFilters({ ...body, platform })
          
          console.log(`Searching ${platform}...`)
          const result = await modashService.searchDiscovery(filters)
          
          return {
            platform,
            success: true,
            data: result.results || [],
            total: result.total || 0,
            creditsUsed: result.creditsUsed || 0
          }
        } catch (error) {
          console.error(`${platform} search failed:`, error)
          return {
            platform,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: [],
            total: 0,
            creditsUsed: 0
          }
        }
      })
      
      const platformResults = await Promise.all(searchPromises)
      
      // Merge results by creator
      const mergedCreators = mergeCreatorResults(platformResults)
      
      // Calculate totals
      const totalResults = mergedCreators.length
      const successfulPlatforms = platformResults.filter(r => r.success).length
      
      console.log('✅ Search completed:', {
        totalCreators: totalResults,
        successfulPlatforms,
        platformResults: platformResults.map(r => ({ platform: r.platform, success: r.success, count: r.data?.length || 0 }))
      })
      
      return NextResponse.json({
        success: true,
        data: {
          results: mergedCreators,
          total: totalResults,
          page: body.page || 0,
          limit: body.limit || 20,
          hasMore: false, // We'll implement pagination later if needed
          creditsUsed: platformResults.reduce((sum, r) => sum + (r.creditsUsed || 0), 0)
        },
        platformResults: platformResults.map(r => ({
          platform: r.platform,
          success: r.success,
          count: r.data?.length || 0,
          error: r.error
        })),
        note: 'Multi-platform search results merged by creator',
        searchMode: body.searchQuery ? 'exact_match' : 'general_discovery'
      })
      
    } catch (error) {
      console.warn('⚠️ Multi-platform search failed, using mock data:', error)
      
      // Fallback to mock data with multiple platforms
      const mockResponse = generateMultiPlatformMockResponse(body)
      
      return NextResponse.json({
        success: true,
        data: mockResponse,
        note: 'Mock multi-platform data - Modash API credentials pending activation',
        warning: 'Using mock data while Modash API access is being configured',
        searchMode: body.searchQuery ? 'exact_match' : 'general_discovery'
      })
    }
    
  } catch (error) {
    console.error('❌ Discovery search API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Discovery search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function mergeCreatorResults(platformResults: any[]): MergedCreator[] {
  const creatorMap = new Map<string, MergedCreator>()
  
  platformResults.forEach(({ platform, data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return
    
    data.forEach((influencer: any) => {
      // Handle Modash's nested profile structure
      const profile = influencer.profile || influencer
      
      const creatorKey = normalizeCreatorName(profile.fullname || profile.display_name || profile.username || influencer.username)
      
      if (!creatorMap.has(creatorKey)) {
        // Create new merged creator
        creatorMap.set(creatorKey, {
          creatorId: creatorKey,
          displayName: profile.fullname || profile.display_name || profile.username || influencer.username,
          platforms: {},
          totalFollowers: 0,
          averageEngagement: 0,
          verified: false,
          location: profile.location || influencer.location || 'Unknown',
          bio: profile.bio || influencer.bio || '',
          profilePicture: profile.picture || profile.profile_picture || '',
          score: influencer.score || 0
        })
      }
      
      const creator = creatorMap.get(creatorKey)!
      
      // Add platform-specific data
      creator.platforms[platform as keyof typeof creator.platforms] = {
        userId: influencer.userId,
        username: profile.username || influencer.username,
        followers: profile.followers || influencer.followers,
        engagement_rate: profile.engagementRate || influencer.engagement_rate,
        profile_picture: profile.picture || profile.profile_picture,
        url: profile.url || influencer.url,
        verified: profile.isVerified || profile.verified || influencer.verified,
        bio: profile.bio || influencer.bio
      }
      
      // Update aggregated data
      creator.totalFollowers += profile.followers || influencer.followers || 0
      creator.verified = creator.verified || profile.isVerified || profile.verified || influencer.verified
      
      // Use the best profile picture and bio
      const influencerPicture = profile.picture || profile.profile_picture
      if (influencerPicture && !creator.profilePicture) {
        creator.profilePicture = influencerPicture
      }
      if ((profile.bio || influencer.bio) && !creator.bio) {
        creator.bio = profile.bio || influencer.bio
      }
      
      // Calculate average engagement
      const platformCount = Object.keys(creator.platforms).length
      const totalEngagement = Object.values(creator.platforms).reduce((sum: number, p: any) => sum + (p.engagement_rate || 0), 0)
      creator.averageEngagement = totalEngagement / platformCount
      
      // Use highest score
      creator.score = Math.max(creator.score, influencer.score || 0)
    })
  })
  
  // Generate fallback avatars for creators without profile pictures
  const creators = Array.from(creatorMap.values())
  creators.forEach(creator => {
    if (!creator.profilePicture) {
      creator.profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.displayName)}&background=random&size=150&color=fff`
    }
  })
  
  return creators.sort((a, b) => b.totalFollowers - a.totalFollowers)
}

function normalizeCreatorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim()
}

function generateMultiPlatformMockResponse(body: DiscoverySearchBody) {
  const mockCreators: MergedCreator[] = [
    {
      creatorId: 'cristiano_ronaldo',
      displayName: 'Cristiano Ronaldo',
      platforms: {
        instagram: {
          userId: '173560420',
          username: 'cristiano',
          followers: 635000000,
          engagement_rate: 0.028,
          profile_picture: 'https://ui-avatars.com/api/?name=Cristiano+Ronaldo&background=random&size=150&color=fff',
          url: 'https://www.instagram.com/cristiano/',
          verified: true,
          bio: 'Manchester United, Portugal National Team'
        },
        tiktok: {
          userId: 'cristiano_tiktok',
          username: 'cristiano7official',
          followers: 48500000,
          engagement_rate: 0.045,
          profile_picture: 'https://ui-avatars.com/api/?name=Cristiano+Ronaldo&background=random&size=150&color=fff',
          url: 'https://www.tiktok.com/@cristiano7official',
          verified: true,
          bio: 'Official Cristiano Ronaldo TikTok'
        },
        youtube: {
          userId: 'cristiano_youtube',
          username: 'cr7',
          followers: 3200000,
          engagement_rate: 0.032,
          profile_picture: 'https://ui-avatars.com/api/?name=Cristiano+Ronaldo&background=random&size=150&color=fff',
          url: 'https://www.youtube.com/@cr7',
          verified: true,
          bio: 'CR7 Official YouTube Channel'
        }
      },
      totalFollowers: 686700000,
      averageEngagement: 0.035,
      verified: true,
      location: 'Portugal',
      bio: 'Manchester United, Portugal National Team',
      profilePicture: 'https://ui-avatars.com/api/?name=Cristiano+Ronaldo&background=random&size=150&color=fff',
      score: 98
    }
  ]
  
  return {
    results: mockCreators,
    total: mockCreators.length,
    page: body.page || 0,
    limit: body.limit || 20,
    hasMore: false,
    creditsUsed: 0.03
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
    console.log('⚠️ Location filter temporarily disabled for debugging')
    console.log('🔍 Received location:', body.selectedLocation)
    // Map location names to Modash location IDs
    const locationMapping = {
      'united_kingdom': [826],
      'united_states': [840], 
      'canada': [124],
      'australia': [36],
      'germany': [276],
      'france': [250]
    }
    // Temporarily disable location filtering
    // filters.location = locationMapping[body.selectedLocation as keyof typeof locationMapping] || []
    console.log('🔍 Location mapping would be:', locationMapping[body.selectedLocation as keyof typeof locationMapping])
  }
  
  // Search query as relevance
  if (body.searchQuery?.trim()) {
    filters.relevance = [body.searchQuery.trim()]
  }
  
  return filters
}

export async function GET() {
  return NextResponse.json({
    message: 'Multi-platform discovery search API. Use POST method with search parameters.',
    platforms: ['instagram', 'tiktok', 'youtube'],
    note: 'Searches all platforms simultaneously and merges results by creator'
  })
} 