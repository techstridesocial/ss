import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { checkRateLimit, getRateLimitConfig } from './lib/rate-limit'

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

// Rate limiting configuration
const RATE_LIMIT_CONFIG = getRateLimitConfig()

// CSRF protection - allowed origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : []

// Always allow same-origin, localhost, and all Vercel domains for development/preview
// This includes: *.vercel.app, *.vercel.app/*, and custom domains
const TRUSTED_ORIGINS = [
  'localhost',
  '127.0.0.1',
  'vercel.app',  // Covers all *.vercel.app preview deployments
  ...ALLOWED_ORIGINS
]

/**
 * Check if origin is trusted
 * Allows all Vercel deployments and custom domains from ALLOWED_ORIGINS
 */
function isTrustedOrigin(origin: string): boolean {
  // Same-origin requests (no origin header) are always allowed
  if (!origin) return true
  
  // Check if it's a Vercel deployment
  if (origin.includes('vercel.app')) {
    return true
  }
  
  // Check if it's localhost
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return true
  }
  
  // Check custom domains from ALLOWED_ORIGINS
  return TRUSTED_ORIGINS.some(trusted => origin.includes(trusted))
}

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    // Include unsafe-eval for React development mode
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://clerk.stride-suite.com https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://www.google-analytics.com https://challenges.cloudflare.com https://*.cloudflare.com https://static.cloudflareinsights.com",
    "script-src-elem 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://clerk.stride-suite.com https://www.googletagmanager.com https://va.vercel-scripts.com https://vercel.live https://www.google-analytics.com https://challenges.cloudflare.com https://*.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://clerk.stride-suite.com https://api.clerk.dev https://clerk-telemetry.com https://api.modash.io https://www.google-analytics.com https://va.vercel-scripts.com https://vercel.live https://analytics.google.com https://challenges.cloudflare.com https://*.cloudflare.com",
    "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.services https://*.clerk.accounts.dev https://clerk.stride-suite.com https://challenges.cloudflare.com https://*.cloudflare.com",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
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

  // Rate limiting for API routes (enabled in production with Redis)
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request)
    const allowed = await checkRateLimit(clientIP)
    
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(RATE_LIMIT_CONFIG.window / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(RATE_LIMIT_CONFIG.window / 1000).toString(),
            ...SECURITY_HEADERS
          }
        }
      )
    }
  }

  // Protect all other routes
  if (isProtectedRoute(request)) {
    await auth.protect()
  }

  // CSRF protection for state-changing operations
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    // Allow requests without origin (same-origin) - these are always safe
    if (!origin) {
      return response
    }
    
    // Allow same-origin requests (origin matches host)
    // Extract domain from origin (remove protocol)
    const originDomain = origin.replace(/^https?:\/\//, '').split('/')[0]
    const hostDomain = host?.split(':')[0] // Remove port if present
    
    // Normalize domains by removing 'www.' prefix for comparison
    const normalizeDomain = (domain: string) => domain.replace(/^www\./, '')
    const normalizedOrigin = normalizeDomain(originDomain)
    const normalizedHost = normalizeDomain(hostDomain || '')
    
    if (normalizedOrigin === normalizedHost) {
      return response
    }
    
    // Check if origin is trusted
    if (!isTrustedOrigin(origin)) {
      // Block unauthorized cross-origin requests
      return new NextResponse(
        JSON.stringify({ 
          error: 'Forbidden',
          message: 'Cross-origin request not allowed'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...SECURITY_HEADERS
          }
        }
      )
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