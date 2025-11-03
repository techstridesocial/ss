import { NextResponse } from 'next/server'
import { cache } from './redis'

/**
 * Cache wrapper for API routes
 * Usage: return withCache('key', ttl, async () => { ... })
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  handler: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute handler and cache result
  const result = await handler()
  await cache.set(key, result, ttl)
  
  return result
}

/**
 * Cache middleware for Next.js API routes
 * Automatically caches GET requests
 */
export function cacheMiddleware(ttl: number = 300) {
  return async (
    request: Request,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> => {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return handler()
    }

    const url = new URL(request.url)
    const cacheKey = `api:${url.pathname}:${url.searchParams.toString()}`

    // Try to get from cache
    const cached = await cache.get<any>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}`,
        },
      })
    }

    // Execute handler
    const response = await handler()
    
    // Cache successful responses
    if (response.ok) {
      const data = await response.json()
      await cache.set(cacheKey, data, ttl)
      
      return NextResponse.json(data, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}`,
        },
      })
    }

    return response
  }
}

/**
 * TTL constants for different types of data
 */
export const TTL = {
  // Short-lived cache (1 minute)
  SHORT: 60,
  
  // Medium cache (5 minutes)
  MEDIUM: 300,
  
  // Long cache (1 hour)
  LONG: 3600,
  
  // Very long cache (24 hours)
  VERY_LONG: 86400,
  
  // Modash profile cache (1 hour)
  MODASH_PROFILE: 3600,
  
  // Modash search cache (10 minutes)
  MODASH_SEARCH: 600,
  
  // Influencer list (5 minutes)
  INFLUENCER_LIST: 300,
  
  // Campaign list (2 minutes)
  CAMPAIGN_LIST: 120,
  
  // Stats (5 minutes)
  STATS: 300,
}

