import { redis } from './cache/redis'

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

/**
 * In-memory rate limit store for development/fallback
 */
const memoryStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check rate limit using Redis (production) or in-memory store (development/fallback)
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  // Use Redis if available (production)
  if (redis) {
    try {
      // Get current count
      const count = await redis.get<number>(key) || 0
      
      if (count >= RATE_LIMIT_MAX_REQUESTS) {
        console.warn(`⚠️ Rate limit exceeded for IP ${ip}: ${count}/${RATE_LIMIT_MAX_REQUESTS} requests`)
        return false
      }
      
      // Increment count
      await redis.incr(key)
      
      // Set expiration if this is the first request
      if (count === 0) {
        await redis.expire(key, Math.ceil(RATE_LIMIT_WINDOW / 1000))
      }
      
      return true
    } catch (error) {
      console.error('Redis rate limit error, falling back to memory:', error)
      // If Redis fails, DON'T block requests - allow them through
      // This prevents Redis issues from breaking the entire app
      return true
    }
  }
  
  // Fallback to in-memory store (development or Redis unavailable)
  const record = memoryStore.get(ip)
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    memoryStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  record.count++
  return true
}

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig() {
  return {
    window: RATE_LIMIT_WINDOW,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
  }
}

