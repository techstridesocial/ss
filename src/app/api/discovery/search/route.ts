import { NextRequest, NextResponse } from 'next/server'
import { searchInfluencers, getProfileReport, getPerformanceData } from '../../../../lib/services/modash'
import { getRosterInfluencerUsernames } from '../../../../lib/db/queries/influencers'
import { 
  storeDiscoveredInfluencer, 
  storeDiscoverySearch, 
  checkInfluencerInRoster,
  getDiscoveryStats 
} from '../../../../lib/db/queries/discovery'
import { auth } from '@clerk/nextjs/server'

// Helper function to check if the search has complex filters that require the old API
function hasComplexFilters(body: DiscoverySearchBody): boolean {
  const complexFilters = [
    'followersMin', 'followersMax', 'engagementRate', 'avgViewsMin', 'avgViewsMax',
    'followersGrowth', 'totalLikesGrowth', 'viewsGrowth', 'sharesMin', 'sharesMax',
    'bio', 'hashtags', 'mentions', 'captions', 'topics', 'transcript', 'collaborations',
    'hasSponsoredPosts', 'selectedContentCategories', 'accountType', 'selectedSocials',
    'fakeFollowers', 'lastPosted', 'verifiedOnly', 'locationCountries', 'locationCities',
    'audienceGender', 'audienceAge', 'audienceLanguages', 'audienceInterests',
    'genderPercentage', 'agePercentage', 'languagePercentage', 'interestPercentage'
  ]
  
  return complexFilters.some(filter => 
    body[filter as keyof DiscoverySearchBody] !== undefined && 
    body[filter as keyof DiscoverySearchBody] !== null &&
    body[filter as keyof DiscoverySearchBody] !== ''
  )
}

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
  demographics?: any
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: DiscoverySearchBody = await request.json()
    
    console.log('🔍 Discovery search request body:', {
      platform: body.platform,
      searchQuery: body.searchQuery,
      hasSearchQuery: !!body.searchQuery,
      searchQueryTrimmed: body.searchQuery?.trim(),
      hasComplexFiltersResult: hasComplexFilters(body),
      requestBodyKeys: Object.keys(body),
      fullBody: body
    })
    
    // For simple text searches, use the new List Users API (more efficient)
    const shouldUseListUsers = body.searchQuery?.trim() && !hasComplexFilters(body)
    console.log('🤔 Should use List Users API?', {
      hasSearchQuery: !!body.searchQuery?.trim(),
      hasComplexFilters: hasComplexFilters(body),
      decision: shouldUseListUsers
    })
    
    if (shouldUseListUsers) {
      console.log('🆕 Using new List Users API for simple search:', body.searchQuery)
      
      try {
        const result = await searchInfluencers({ query: body.searchQuery.trim(), limit: 50 })
        
        if (result.error || !result.users || result.users.length === 0) {
          console.error('❌ List Users API failed or returned no results, falling back to Search Influencers API:', {
            error: result.error,
            message: result.message,
            userCount: result.users?.length || 0,
            searchQuery: body.searchQuery
          })
          // Fall through to complex search which should find "cristiano"
        } else {
          // Transform List Users API response and enrich with profile report data
          console.log('📊 Enriching search results with full profile reports...')
          
          let transformedResults = await Promise.all(result.users.map(async (user) => {
            try {
              // Fetch full profile report for each user to get engagement rate and complete data
              const profileReport = await getProfileReport(user.userId, 'instagram')
              
              if (profileReport && !profileReport.error && profileReport.profile?.profile) {
                const profileData = profileReport.profile.profile
                console.log(`✅ Got profile data for @${user.username}: ${profileData.engagementRate} engagement`)
                
                return {
                  userId: user.userId,
                  username: user.username,
                  display_name: profileData.fullname || user.username,
                  handle: user.username,
                  platform: 'instagram',
                  followers: profileData.followers || user.followers,
                  engagement_rate: profileData.engagementRate || 0,
                  profile_picture: profileData.picture || user.picture || '',
                  verified: profileData.isVerified || user.isVerified || false,
                  location: 'Unknown', // Could be enhanced with location data from profile
                  score: 0,
                  already_imported: false,
                  // Additional rich data available for the table
                  avgLikes: profileData.avgLikes,
                  avgComments: profileData.avgComments,
                  fullname: profileData.fullname
                }
              } else {
                console.log(`⚠️ Profile report failed for @${user.username}, using basic data`)
                return {
                  userId: user.userId,
                  username: user.username,
                  display_name: user.username,
                  handle: user.username,
                  platform: 'instagram',
                  followers: user.followers,
                  engagement_rate: 0, // Fallback when profile report fails
                  profile_picture: user.picture || '',
                  verified: user.isVerified || false,
                  location: 'Unknown',
                  score: 0,
                  already_imported: false
                }
              }
            } catch (error) {
              console.log(`❌ Error enriching @${user.username}:`, error.message)
              return {
                userId: user.userId,
                username: user.username,
                display_name: user.username,
                handle: user.username,
                platform: 'instagram',
                followers: user.followers,
                engagement_rate: 0,
                profile_picture: user.picture || '',
                verified: user.isVerified || false,
                location: 'Unknown',
                score: 0,
                already_imported: false
              }
            }
          }))
          
          // For exact search mode, filter to show only exact username match
          const searchTerm = body.searchQuery.trim().toLowerCase()
          console.log('🔍 Looking for exact match:', {
            searchTerm,
            availableUsernames: transformedResults.map(u => u.username.toLowerCase()),
            totalResults: transformedResults.length
          })
          
          const exactMatch = transformedResults.find(user => {
            const match = user.username.toLowerCase() === searchTerm
            console.log('🎯 Checking user:', { username: user.username, searchTerm, isExactMatch: match })
            return match
          })
          
          if (exactMatch) {
            console.log('🎯 Exact match found, filtering to show only exact result:', exactMatch.username)
            
            // Profile data already enriched above, no need to fetch again
            console.log('✅ Using enriched profile data:', {
              username: exactMatch.username,
              engagementRate: exactMatch.engagement_rate,
              followers: exactMatch.followers,
              avgLikes: exactMatch.avgLikes,
              fullname: exactMatch.fullname
            })
            
            transformedResults = [exactMatch] // Only show the exact match
          } else {
            console.log('⚠️ No exact match found for:', searchTerm)
            console.log('📝 Available usernames:', transformedResults.map(u => u.username))
            // Keep all results if no exact match found
          }
          
          console.log('✅ List Users API success:', {
            query: body.searchQuery,
            resultsCount: transformedResults.length,
            firstResult: transformedResults[0]?.username,
            firstResultFollowers: transformedResults[0]?.followers,
            firstResultProfilePicture: transformedResults[0]?.profile_picture,
            rawFirstUser: result.users[0]
          })
          
          return NextResponse.json({
            success: true,
            data: {
              results: transformedResults,
              total: transformedResults.length,
              creditsUsed: 0,
              searchMode: 'list_users_api'
            }
          })
        }
      } catch (error) {
        console.error('❌ List Users API error, falling back to old search:', error)
      }
    }

    // Fall back to complex search for advanced filtering or if List Users API fails
    console.log('🔍 Using complex discovery search with filters')
    const platforms = ['instagram', 'tiktok', 'youtube'] as const
    
    try {
      const searchPromises = platforms.map(async (platform) => {
        try {
          const filters = mapToModashFilters({ ...body, platform })
          
          console.log(`Searching ${platform}...`)
          const result = await searchInfluencers(filters)
          
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
      
      // Check if any platform searches succeeded
      const successfulSearches = platformResults.filter(r => r.success)
      const failedSearches = platformResults.filter(r => !r.success)
      
      console.log('Search results:', {
        successful: successfulSearches.length,
        failed: failedSearches.length,
        totalCreditsUsed: platformResults.reduce((sum, r) => sum + (r.creditsUsed || 0), 0)
      })
      
      // If all searches failed, fall back to mock data
      if (successfulSearches.length === 0) {
        console.warn('⚠️ All platform searches failed, using mock data')
        throw new Error('All platform searches failed')
      }
      
      // Merge results by creator
      let mergedCreators = mergeCreatorResults(platformResults)
      
      // Apply roster filtering if requested
      if (body.hideProfilesInRoster) {
        try {
          const rosterUsernames = await getRosterInfluencerUsernames()
          const beforeCount = mergedCreators.length
          
          mergedCreators = mergedCreators.filter(creator => {
            // Check if any of the creator's platform usernames match roster usernames
            const creatorUsernames: string[] = []
            
            // Extract usernames from all platforms
            Object.entries(creator.platforms).forEach(([platform, data]) => {
              if (data && data.username) {
                creatorUsernames.push(data.username)
                creatorUsernames.push(`@${data.username}`)
              }
            })
            
            // Also check display name variations
            const displayUsername = creator.displayName.toLowerCase().replace(/\s+/g, '_')
            creatorUsernames.push(displayUsername)
            creatorUsernames.push(`@${displayUsername}`)
            
            // Return false if any username matches roster (exclude from results)
            const isInRoster = rosterUsernames.some(rosterUsername => 
              creatorUsernames.some(creatorUsername => 
                creatorUsername.toLowerCase() === rosterUsername.toLowerCase()
              )
            )
            
            return !isInRoster
          })
          
          const afterCount = mergedCreators.length
          console.log(`🔍 Roster filtering: ${beforeCount} → ${afterCount} (excluded ${beforeCount - afterCount} roster influencers)`)
          
        } catch (error) {
          console.error('❌ Roster filtering failed:', error)
          // Continue without filtering if there's an error
        }
      }
      
      // Calculate totals
      const totalResults = mergedCreators.length
      const successfulPlatforms = platformResults.filter(r => r.success).length
      const totalCreditsUsed = platformResults.reduce((sum, r) => sum + (r.creditsUsed || 0), 0)
      
      console.log('✅ Search completed:', {
        totalCreators: totalResults,
        successfulPlatforms,
        totalCreditsUsed,
        platformResults: platformResults.map(r => ({ 
          platform: r.platform, 
          success: r.success, 
          count: r.data?.length || 0,
          creditsUsed: r.creditsUsed || 0
        }))
      })

      // Store discovery search in history
      try {
        await storeDiscoverySearch(
          body.searchQuery || '',
          body,
          totalResults,
          totalCreditsUsed,
          userId
        )
        console.log('📊 Discovery search stored in history')
      } catch (error) {
        console.error('❌ Failed to store discovery search:', error)
        // Continue without failing the entire request
      }

      // Store discovered influencers in database for enrichment
      try {
        const storedInfluencers = []
        for (const creator of mergedCreators) {
          for (const [platform, platformData] of Object.entries(creator.platforms)) {
            if (platformData && platformData.username) {
              // Check if already in roster
              const inRoster = await checkInfluencerInRoster(platformData.username, platform)
              
              // Store discovered influencer
              const discoveredId = await storeDiscoveredInfluencer(
                platformData.username,
                platform,
                platformData.followers || 0,
                platformData.engagement_rate || 0,
                creator.demographics || {},
                {
                  ...platformData,
                  displayName: creator.displayName,
                  totalFollowers: creator.totalFollowers,
                  averageEngagement: creator.averageEngagement,
                  verified: creator.verified,
                  location: creator.location,
                  bio: creator.bio,
                  profilePicture: creator.profilePicture,
                  score: creator.score,
                  inRoster
                }
              )
              storedInfluencers.push(discoveredId)
            }
          }
        }
        console.log(`💾 Stored ${storedInfluencers.length} discovered influencers`)
      } catch (error) {
        console.error('❌ Failed to store discovered influencers:', error)
        // Continue without failing the entire request
      }

      // Get discovery statistics
      let discoveryStats = null
      try {
        discoveryStats = await getDiscoveryStats()
        console.log('📈 Discovery stats retrieved')
      } catch (error) {
        console.error('❌ Failed to get discovery stats:', error)
      }
      
      return NextResponse.json({
        success: true,
        data: {
          results: mergedCreators,
          total: totalResults,
          page: body.page || 0,
          limit: body.limit || 20,
          hasMore: false, // We'll implement pagination later if needed
          creditsUsed: totalCreditsUsed
        },
        platformResults: platformResults.map(r => ({
          platform: r.platform,
          success: r.success,
          count: r.data?.length || 0,
          creditsUsed: r.creditsUsed || 0,
          error: r.error
        })),
        note: 'Multi-platform search results merged by creator',
        searchMode: body.searchQuery ? 'exact_match' : 'general_discovery',
        apiStatus: {
          successfulPlatforms,
          failedPlatforms: failedSearches.length,
          totalCreditsUsed
        },
        discoveryStats,
        enrichment: {
          storedInfluencers: true,
          historyTracked: true,
          duplicateDetection: true
        }
      })
      
    } catch (error) {
      console.warn('⚠️ Multi-platform search failed, using mock data:', error)
      
      // Fallback to mock data with multiple platforms
      let mockResponse = generateMultiPlatformMockResponse(body)
      
      // Apply roster filtering to mock data if requested
      if (body.hideProfilesInRoster) {
        try {
          const rosterUsernames = await getRosterInfluencerUsernames()
          const beforeCount = mockResponse.results.length
          
          mockResponse.results = mockResponse.results.filter(creator => {
            // Check if any of the creator's platform usernames match roster usernames
            const creatorUsernames: string[] = []
            
            // Extract usernames from all platforms
            Object.entries(creator.platforms).forEach(([platform, data]) => {
              if (data && data.username) {
                creatorUsernames.push(data.username)
                creatorUsernames.push(`@${data.username}`)
              }
            })
            
            // Also check display name variations
            const displayUsername = creator.displayName.toLowerCase().replace(/\s+/g, '_')
            creatorUsernames.push(displayUsername)
            creatorUsernames.push(`@${displayUsername}`)
            
            // Return false if any username matches roster (exclude from results)
            const isInRoster = rosterUsernames.some(rosterUsername => 
              creatorUsernames.some(creatorUsername => 
                creatorUsername.toLowerCase() === rosterUsername.toLowerCase()
              )
            )
            
            return !isInRoster
          })
          
          // Update total count
          mockResponse.total = mockResponse.results.length
          const afterCount = mockResponse.results.length
          console.log(`🔍 Mock roster filtering: ${beforeCount} → ${afterCount} (excluded ${beforeCount - afterCount} roster influencers)`)
          
        } catch (error) {
          console.error('❌ Mock roster filtering failed:', error)
          // Continue without filtering if there's an error
        }
      }
      
      return NextResponse.json({
        success: true,
        data: mockResponse,
        note: 'Mock multi-platform data - Modash API connection issues detected',
        warning: 'Using mock data due to API connection problems',
        searchMode: body.searchQuery ? 'exact_match' : 'general_discovery',
        apiStatus: {
          successfulPlatforms: 0,
          failedPlatforms: 3,
          totalCreditsUsed: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
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