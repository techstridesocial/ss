import { Redis } from '@upstash/redis'

// Initialize Redis client (Upstash)
// Falls back to null if Redis is not configured (development)
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  })
} else {
  console.warn('⚠️  Redis not configured. Caching will be disabled.')
}

export { redis }

// Cache helper functions
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null
    
    try {
      const value = await redis.get<T>(key)
      return value
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  },

  /**
   * Set value in cache with TTL in seconds
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!redis) return false
    
    try {
      if (ttl) {
        await redis.set(key, value, { ex: ttl })
      } else {
        await redis.set(key, value)
      }
      return true
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (!redis) return false
    
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!redis) return 0
    
    try {
      const keys = await redis.keys(pattern)
      if (keys.length === 0) return 0
      
      await redis.del(...keys)
      return keys.length
    } catch (error) {
      console.error(`Cache pattern delete error for pattern ${pattern}:`, error)
      return 0
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!redis) return false
    
    try {
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Set expiration on existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!redis) return false
    
    try {
      await redis.expire(key, ttl)
      return true
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error)
      return false
    }
  },
}

