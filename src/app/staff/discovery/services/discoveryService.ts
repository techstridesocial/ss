import { Platform, DiscoveryFilters, SearchResult, AddToRosterResult, Influencer } from '../types/discovery'

const CREDITS_PER_RESULT = 0.01

/**
 * Search influencers using the discovery API
 */
export const searchInfluencers = async (
  filters: DiscoveryFilters
): Promise<{ results: Influencer[]; creditsUsed: number; warning?: string }> => {
  const activeFilters = Object.keys(filters).filter(k => {
    const value = filters[k as keyof DiscoveryFilters]
    return value !== undefined && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0)
  })
  const hasComplexFilters = activeFilters.length > 1 // More than just platform

  let apiEndpoint = '/api/discovery/search'
  let requestBody: any

  // Simple text searches use basic search endpoint
  if (filters.searchQuery?.trim()) {
    apiEndpoint = '/api/discovery/search'
    requestBody = {
      platform: filters.platform,
      searchQuery: filters.searchQuery.trim(),
      preferFreeAPI: true
    }
  } else if (hasComplexFilters) {
    // Transform filters to API format
    const searchFilters: any = {
      influencer: {},
      audience: {}
    }

    // Map follower filters
    if (filters.followersMin || filters.followersMax) {
      searchFilters.influencer.followers = {}
      if (filters.followersMin) searchFilters.influencer.followers.min = filters.followersMin
      if (filters.followersMax) searchFilters.influencer.followers.max = filters.followersMax
    }

    // Map engagement rate
    if (filters.engagementRate) {
      searchFilters.influencer.engagementRate = filters.engagementRate / 100
    }

    // Map verification
    if (filters.verifiedOnly === true) {
      searchFilters.influencer.isVerified = true
    }

    // Map bio search
    if (filters.bio) {
      searchFilters.influencer.bio = filters.bio
    }

    // Map hashtags and mentions as textTags
    const textTags: Array<{ type: 'hashtag' | 'mention'; value: string }> = []
    if (filters.hashtags) {
      filters.hashtags.split(',').forEach((tag: string) => {
        const cleanTag = tag.trim().replace('#', '')
        if (cleanTag) textTags.push({ type: 'hashtag', value: cleanTag })
      })
    }
    if (filters.mentions) {
      filters.mentions.split(',').forEach((mention: string) => {
        const cleanMention = mention.trim().replace('@', '')
        if (cleanMention) textTags.push({ type: 'mention', value: cleanMention })
      })
    }
    if (textTags.length > 0) {
      searchFilters.influencer.textTags = textTags
    }

    // Map captions as keywords
    if (filters.captions) {
      searchFilters.influencer.keywords = filters.captions
    }

    // Map locations
    if (filters.selectedLocations && filters.selectedLocations.length > 0) {
      searchFilters.influencer.location = filters.selectedLocations
        .map((id: string) => parseInt(id))
        .filter((id: number) => !isNaN(id))
    }

    // Map language
    if (filters.selectedLanguage) {
      searchFilters.influencer.language = filters.selectedLanguage
    }

    // Map gender
    if (filters.selectedGender) {
      searchFilters.influencer.gender = filters.selectedGender.toUpperCase()
    }

    // Map account type
    if (filters.accountType) {
      const accountTypeMap: Record<string, number[]> = {
        'regular': [1],
        'business': [2],
        'creator': [3]
      }
      if (accountTypeMap[filters.accountType.toLowerCase()]) {
        searchFilters.influencer.accountTypes = accountTypeMap[filters.accountType.toLowerCase()]
      }
    }

    // Map last posted
    if (filters.lastPosted) {
      const daysMap: Record<string, number> = {
        '30': 30,
        '60': 60,
        '90': 90
      }
      if (daysMap[filters.lastPosted]) {
        searchFilters.influencer.lastposted = daysMap[filters.lastPosted]
      }
    }

    // Add audience credibility
    searchFilters.audience.credibility = 0.8

    apiEndpoint = '/api/discovery/search-v2'
    requestBody = {
      platform: filters.platform,
      page: 0,
      sort: { field: 'followers', direction: 'desc' },
      filter: searchFilters
    }
  } else {
    requestBody = {
      platform: filters.platform
    }
  }

  const response = await fetch(`${window.location.origin}${apiEndpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Search failed: ${response.status} ${response.statusText}`

    try {
      const errorData = JSON.parse(errorText)
      if (errorData.code === 'AUTH_REQUIRED') {
        errorMessage = `Authentication required: ${errorData.message}`
      } else if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch {
      // If error text is not JSON, use the original error
    }

    throw new Error(errorMessage)
  }

  const result: SearchResult = await response.json()
  let searchResults: Influencer[] = []
  let creditsUsed = 0
  let warning: string | undefined

  if (apiEndpoint === '/api/discovery/search-v2') {
    if (result.success && result.influencers) {
      searchResults = result.influencers
      creditsUsed = result.influencers.length * CREDITS_PER_RESULT
    } else {
      throw new Error(result.error || 'Advanced search failed')
    }
  } else {
    if (result.success && result.data) {
      if (Array.isArray(result.data)) {
        searchResults = result.data
        creditsUsed = result.creditsUsed || 0
      } else {
        searchResults = result.data.results || []
        creditsUsed = result.data.creditsUsed || 0
      }

      if (result.warning) {
        warning = result.warning
      }
    } else {
      throw new Error(result.details || 'Search failed')
    }
  }

  return { results: searchResults, creditsUsed, warning }
}

/**
 * Add influencer to roster
 */
export const addToRoster = async (
  discoveredId: string,
  modashUserId?: string,
  platform?: Platform
): Promise<AddToRosterResult> => {
  try {
    const response = await fetch('/api/discovery/add-to-roster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        discoveredId,
        modashUserId,
        platform
      }),
    })

    const data = await response.json()

    if (data.success) {
      return {
        success: true,
        newInfluencerId: data.data.newInfluencerId,
        hasCompleteData: data.data.hasCompleteData
      }
    } else {
      throw new Error(data.error || 'Failed to add to roster')
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Fetch influencer profile data
 */
export const fetchInfluencerProfile = async (
  userId: string,
  platform: Platform,
  options: {
    includeReport?: boolean
    includePerformanceData?: boolean
    searchResultData?: Partial<Influencer>
  } = {}
) => {
  const response = await fetch(`${window.location.origin}/api/discovery/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      platform,
      includeReport: options.includeReport ?? false,
      includePerformanceData: options.includePerformanceData ?? false,
      searchResultData: options.searchResultData
    })
  })

  if (!response.ok) {
    throw new Error(`Profile fetch failed: ${response.statusText}`)
  }

  const result = await response.json()
  if (!result.success || !result.data) {
    throw new Error('Profile API returned no data')
  }

  return result.data
}

/**
 * Fetch extended influencer analytics
 */
export const fetchExtendedAnalytics = async (
  userId: string,
  platform: Platform,
  sections: string[] = ['hashtags', 'partnerships', 'topics', 'interests', 'languages']
) => {
  const response = await fetch(`${window.location.origin}/api/discovery/profile-extended`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      platform,
      sections
    })
  })

  if (!response.ok) {
    return null
  }

  const result = await response.json()
  return result.success ? result.data : null
}

