// modashService.ts — Cleaned Production Grade

import qs from 'query-string'

const BASE_URL = 'https://api.modash.io/v1'
const API_KEY = process.env.MODASH_API_KEY

if (!API_KEY) throw new Error('❌ Missing MODASH_API_KEY in env')

// Reusable fetcher
async function modashApiRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}?${qs.stringify(params)}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Modash API error (${res.status}): ${err}`)
  }

  return await res.json()
}

// POST fetcher
async function modashApiPost<T>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Modash API error (${res.status}): ${err}`)
  }

  return await res.json()
}

// Profile report (main entry)
export async function getProfileReport(userId: string, platform: string) {
  return modashApiRequest(`/${platform}/profile/${userId}/report`)
}

// Performance data (if confirmed valid)
export async function getPerformanceData(url: string, postLimit = 5) {
  // Note: postLimit parameter is not supported by the API, but kept for compatibility
  return modashApiRequest(`/instagram/performance-data`, { url })
}

// Hashtags based on content
export async function listHashtags(query: string, limit = 10) {
  return modashApiRequest(`/instagram/hashtags`, { query, limit })
}

// Brand partnerships
export async function listPartnerships(query: string, limit = 5) {
  // Per documentation, brands endpoint lists brand partnerships
  return modashApiRequest(`/instagram/brands`, { query, limit })
}

// Content topics based on creator
export async function listTopics(query: string, limit = 8) {
  return modashApiRequest(`/instagram/topics`, { query, limit })
}

// User info for credit usage
export async function getUserInfo() {
  return modashApiRequest('/user/info')
}

// Search influencers
export async function searchInfluencers(params: Record<string, any>) {
  return modashApiRequest('/instagram/users', params)
}

// Platform-aware simple user list (handle search)
export async function listUsers(
  platform: 'instagram' | 'tiktok' | 'youtube',
  params: { query: string; limit?: number }
) {
  return modashApiRequest(`/${platform}/users`, params)
}

// Platform-aware complex discovery search (POST)
export async function searchDiscovery(
  platform: 'instagram' | 'tiktok' | 'youtube',
  filterBody: Record<string, any>
) {
  return modashApiPost(`/${platform}/search`, filterBody)
}

// Audience overlap analysis between multiple influencers (experimental)
export async function getAudienceOverlap(
  platform: 'instagram' | 'tiktok' | 'youtube',
  userIds: string[],
  options?: { segments?: string[]; metrics?: string[] }
) {
  // Try platform-specific path first, then a potential discovery path as fallback
  const payload = {
    userIds,
    segments: options?.segments,
    metrics: options?.metrics
  }
  try {
    return await modashApiPost(`/${platform}/audience/overlap`, payload)
  } catch (e) {
    // Fallback path if platform endpoint differs in Modash account plan
    return await modashApiPost(`/discovery/audience-overlap`, { platform, ...payload })
  }
}

// List locations
export async function listLocations(query: string, limit = 10) {
  return modashApiRequest('/instagram/locations', { query, limit })
}

// List languages
export async function listLanguages(query: string, limit = 10) {
  return modashApiRequest('/instagram/languages', { query, limit })
}

// List interests
export async function listInterests(query: string, limit = 10) {
  return modashApiRequest('/instagram/interests', { query, limit })
}

// Helper: credit usage derived from user info
export async function getCreditUsage(): Promise<{
  used: number
  limit: number
  remaining: number
  resetDate: string | Date
}> {
  const info = await getUserInfo()
  const billing = (info as any)?.billing || {}

  // Try multiple known shapes for credit limit
  const limitCandidates = [
    billing.credits,
    billing.creditLimit,
    billing?.discoveryCredits?.limit,
    billing?.plan?.credits
  ].filter((v: any) => typeof v === 'number')
  const limit = (limitCandidates[0] as number) ?? 3000

  // Try multiple known shapes for used requests/credits
  const usedCandidates = [
    billing.rawRequests,
    billing.requestsUsed,
    billing?.discoveryCredits?.used,
    billing?.usage?.requests
  ].filter((v: any) => typeof v === 'number')
  const used = Math.max(0, (usedCandidates[0] as number) ?? 0)

  // Reset date candidates
  const resetDate = billing.resetAt || billing?.period?.resetAt || billing.nextReset || new Date()

  const remaining = Math.max(0, (limit as number) - (used as number))

  return { used, limit, remaining, resetDate }
}

// Get brand collaborations for a specific creator
export async function getCreatorCollaborations(
  userId: string, 
  platform: string = 'instagram',
  limit: number = 10
): Promise<any> {
  const apiKey = process.env.MODASH_API_KEY
  if (!apiKey) {
    throw new Error('Modash API key not configured')
  }
  
  console.log(`🤝 Getting collaborations for ${platform} user: ${userId}`)
  
  try {
    const response = await fetch(`https://api.modash.io/v1/collaborations/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId,
        platform: platform,
        limit: limit
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Collaborations API error: ${response.status} - ${errorText}`)
      return { collaborations: [], error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    console.log(`✅ Retrieved ${data.brand?.posts?.length || 0} collaboration posts`)
    
    return {
      collaborations: data.brand?.posts || [],
      influencer: data.influencer || null,
      brand: data.brand || null,
      error: null
    }
    
  } catch (error) {
    console.error('❌ Error fetching collaborations:', error)
    return { collaborations: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Convenience object export for routes importing modashService
export const modashService = {
  getProfileReport,
  getPerformanceData,
  listHashtags,
  listPartnerships,
  listTopics,
  getUserInfo,
  getCreditUsage,
  searchInfluencers,
  listUsers,
  searchDiscovery,
  getAudienceOverlap,
  listLocations,
  listLanguages,
  listInterests,
  getCreatorCollaborations
}

// Types can be added here or imported from a types module
// Example:
// interface ProfileReportResponse {
//   audience: { gender: Record<string, number> }
//   ...etc
// }

// Optional: Retry logic or timeout wrapper can be added if needed for production scaling