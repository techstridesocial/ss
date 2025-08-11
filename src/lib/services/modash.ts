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

// Profile report (main entry)
export async function getProfileReport(userId: string, platform: string) {
  return modashApiRequest(`/${platform}/profile/${userId}/report`)
}

// Performance data (if confirmed valid)
export async function getPerformanceData(url: string, postLimit = 5) {
  return modashApiRequest(`/instagram/performance-data`, { url, post_count: postLimit })
}

// Hashtags based on content
export async function listHashtags(query: string, limit = 10) {
  return modashApiRequest(`/instagram/hashtags`, { query, limit })
}

// Brand partnerships
export async function listPartnerships(query: string, limit = 5) {
  return modashApiRequest(`/instagram/partnerships`, { query, limit })
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

// Types can be added here or imported from a types module
// Example:
// interface ProfileReportResponse {
//   audience: { gender: Record<string, number> }
//   ...etc
// }

// Optional: Retry logic or timeout wrapper can be added if needed for production scaling