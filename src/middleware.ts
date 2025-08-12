import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/brand(.*)',
  '/influencer(.*)', 
  '/staff(.*)',
  '/admin(.*)',
  '/api/protected(.*)',
  '/api/admin(.*)',
  '/api/users(.*)',
  '/api/brands(.*)',
  '/api/brand(.*)',
  '/api/influencers(.*)',
  '/api/campaigns(.*)',
  '/api/quotations(.*)',
  '/api/audit(.*)',
  '/api/gdpr(.*)'
])

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/health'
])

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    // Avoid unsafe-eval; keep inline for Clerk if necessary, prefer nonces in future
    "script-src 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://www.google-analytics.com",
    "script-src-elem 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://api.clerk.dev https://www.google-analytics.com https://va.vercel-scripts.com https://vercel.live https://analytics.google.com",
    "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
}

/**
 * Rate limiting middleware
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(ip, {
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
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') ||
         'unknown'
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Allow public routes
  if (isPublicRoute(request)) {
    return response
  }

  // Rate limiting for API routes (disabled in production without a shared store)
  if (process.env.NODE_ENV !== 'production') {
    if (pathname.startsWith('/api/')) {
      const clientIP = getClientIP(request)
      if (!checkRateLimit(clientIP)) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
              ...SECURITY_HEADERS
            }
          }
        )
      }
    }
  }

  // Protect all other routes
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  // CSRF protection for state-changing operations
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    
    // Check if request is from same origin or trusted origin
    if (origin && !origin.includes('localhost') && !origin.includes('vercel.app')) {
      // In production, you'd want to check against a whitelist of trusted origins
      console.log(`Cross-origin request detected: ${origin}`)
    }
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 