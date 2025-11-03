/**
 * Centralized cache key generation for consistency
 * Pattern: {entity}:{id}:{subresource}
 */

export const cacheKeys = {
  // Influencer cache keys
  influencer: {
    list: () => 'influencers:list',
    light: () => 'influencers:light',
    detail: (id: string) => `influencer:${id}`,
    platforms: (id: string) => `influencer:${id}:platforms`,
    stats: (id: string) => `influencer:${id}:stats`,
  },

  // Campaign cache keys
  campaign: {
    list: () => 'campaigns:list',
    detail: (id: string) => `campaign:${id}`,
    influencers: (id: string) => `campaign:${id}:influencers`,
    content: (id: string) => `campaign:${id}:content`,
  },

  // Modash API cache keys
  modash: {
    profile: (platform: string, userId: string) => `modash:${platform}:${userId}`,
    search: (platform: string, query: string) => `modash:search:${platform}:${query}`,
    performance: (platform: string, url: string) => `modash:perf:${platform}:${url}`,
    credits: () => 'modash:credits',
  },

  // Discovery cache keys
  discovery: {
    search: (hash: string) => `discovery:search:${hash}`,
    profile: (platform: string, username: string) => `discovery:profile:${platform}:${username}`,
  },

  // User stats cache keys
  stats: {
    influencer: (id: string) => `stats:influencer:${id}`,
    campaign: (id: string) => `stats:campaign:${id}`,
  },

  // Shortlist cache keys
  shortlist: {
    list: (brandId: string) => `shortlists:${brandId}`,
    detail: (id: string) => `shortlist:${id}`,
    influencers: (id: string) => `shortlist:${id}:influencers`,
  },

  // Quotation cache keys
  quotation: {
    list: (brandId: string) => `quotations:${brandId}`,
    detail: (id: string) => `quotation:${id}`,
  },
}

/**
 * Generate cache key hash from object
 * Useful for caching complex query parameters
 */
export function generateCacheHash(obj: Record<string, any>): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

