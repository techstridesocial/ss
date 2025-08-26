// Force load environment variables for Next.js
if (typeof window === 'undefined') {
  // Server-side only
  require('dotenv').config({ path: '.env.local' })
}

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
} as const

// Validate critical environment variables
if (!ENV.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined. Check your .env.local file.')
}

console.log('🌐 Environment loaded:', {
  DATABASE_URL: ENV.DATABASE_URL ? '✅ Present' : '❌ Missing',
  NODE_ENV: ENV.NODE_ENV || 'development'
})
