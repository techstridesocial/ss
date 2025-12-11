/**
 * Simple Rate Limiter
 * 
 * In-memory rate limiter for API calls.
 * For production use, consider using Redis-based rate limiting.
 */

interface RateLimitConfig {
  tokensPerInterval: number
  interval: number // milliseconds
}

class RateLimiter {
  private tokens: number
  private lastRefill: number
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    this.tokens = config.tokensPerInterval
    this.lastRefill = Date.now()
  }

  /**
   * Remove tokens and wait if necessary
   * @param count - Number of tokens to remove (default: 1)
   * @returns Promise that resolves when tokens are available
   */
  async removeTokens(count: number = 1): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRefill

    // Refill tokens based on elapsed time
    if (elapsed >= this.config.interval) {
      this.tokens = this.config.tokensPerInterval
      this.lastRefill = now
    } else {
      // Calculate how many tokens to add based on elapsed time
      const tokensToAdd = Math.floor(
        (elapsed / this.config.interval) * this.config.tokensPerInterval
      )
      this.tokens = Math.min(
        this.config.tokensPerInterval,
        this.tokens + tokensToAdd
      )
      this.lastRefill = now
    }

    // If we don't have enough tokens, wait
    if (this.tokens < count) {
      const waitTime = this.config.interval - elapsed
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
        // After waiting, refill and try again
        this.tokens = this.config.tokensPerInterval
        this.lastRefill = Date.now()
      }
    }

    this.tokens -= count
  }

  /**
   * Get remaining tokens without consuming them
   */
  getRemainingTokens(): number {
    const now = Date.now()
    const elapsed = now - this.lastRefill

    if (elapsed >= this.config.interval) {
      return this.config.tokensPerInterval
    }

    const tokensToAdd = Math.floor(
      (elapsed / this.config.interval) * this.config.tokensPerInterval
    )
    return Math.min(
      this.config.tokensPerInterval,
      this.tokens + tokensToAdd
    )
  }
}

// Modash API rate limiter: 10 requests per second
export const modashRateLimiter = new RateLimiter({
  tokensPerInterval: 10,
  interval: 1000 // 1 second
})
