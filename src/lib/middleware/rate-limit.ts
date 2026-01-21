/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

export function rateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs
    })
    return true
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return false
  }

  // Increment count
  entry.count++
  return true
}

export function getRateLimitInfo(identifier: string): {
  remaining: number
  resetAt: number
  total: number
} | null {
  const entry = rateLimitStore.get(identifier)
  
  if (!entry) {
    return null
  }

  return {
    remaining: Math.max(0, 60 - entry.count),
    resetAt: entry.resetAt,
    total: 60
  }
}
