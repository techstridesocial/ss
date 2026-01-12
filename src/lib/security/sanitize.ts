/**
 * Input Sanitization Utilities
 * 
 * Provides comprehensive input sanitization for user-submitted data
 * to prevent XSS, SQL injection, and other security vulnerabilities.
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char] || char)
}

/**
 * Remove HTML tags from a string
 */
export function stripHtml(str: string): string {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize a string by removing dangerous characters and trimming
 * Preserves basic punctuation and alphanumeric characters
 */
export function sanitizeString(str: string, options: {
  maxLength?: number
  allowNewlines?: boolean
  allowUnicode?: boolean
} = {}): string {
  if (!str || typeof str !== 'string') return ''
  
  const { maxLength = 10000, allowNewlines = true, allowUnicode = true } = options
  
  let sanitized = str.trim()
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters except newlines/tabs if allowed
  if (allowNewlines) {
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  } else {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, ' ')
  }
  
  // Strip HTML tags
  sanitized = stripHtml(sanitized)
  
  // Escape HTML entities
  sanitized = escapeHtml(sanitized)
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }
  
  return sanitized
}

/**
 * Sanitize a username/handle
 * Only allows alphanumeric, underscores, periods, and hyphens
 */
export function sanitizeUsername(str: string): string {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 64)
}

/**
 * Sanitize an email address
 * Basic validation and cleaning
 */
export function sanitizeEmail(str: string): string {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .trim()
    .toLowerCase()
    .slice(0, 254) // RFC 5321 max email length
}

/**
 * Validate and sanitize a URL
 * Returns empty string if URL is invalid or potentially dangerous
 */
export function sanitizeUrl(str: string, options: {
  allowedProtocols?: string[]
  allowedDomains?: string[]
} = {}): string {
  if (!str || typeof str !== 'string') return ''
  
  const { 
    allowedProtocols = ['https:', 'http:'],
    allowedDomains = []
  } = options
  
  const trimmed = str.trim()
  
  // Check for javascript: or data: URLs
  const lowerStr = trimmed.toLowerCase()
  if (
    lowerStr.startsWith('javascript:') ||
    lowerStr.startsWith('data:') ||
    lowerStr.startsWith('vbscript:')
  ) {
    return ''
  }
  
  try {
    const url = new URL(trimmed)
    
    // Check protocol
    if (!allowedProtocols.includes(url.protocol)) {
      return ''
    }
    
    // Check domain if restricted
    if (allowedDomains.length > 0) {
      const hostname = url.hostname.toLowerCase()
      if (!allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      )) {
        return ''
      }
    }
    
    return url.toString()
  } catch {
    // Invalid URL
    return ''
  }
}

/**
 * Sanitize social media URLs
 */
export function sanitizeSocialUrl(str: string, platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter'): string {
  const domainMap: Record<string, string[]> = {
    instagram: ['instagram.com', 'www.instagram.com'],
    tiktok: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
    youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
    twitter: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
  }
  
  return sanitizeUrl(str, {
    allowedProtocols: ['https:'],
    allowedDomains: domainMap[platform] || [],
  })
}

/**
 * Sanitize a number input
 * Returns the number or a default value if invalid
 */
export function sanitizeNumber(
  value: unknown,
  options: {
    min?: number
    max?: number
    defaultValue?: number
    integer?: boolean
  } = {}
): number {
  const { min, max, defaultValue = 0, integer = false } = options
  
  let num = typeof value === 'number' ? value : parseFloat(String(value))
  
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue
  }
  
  if (integer) {
    num = Math.floor(num)
  }
  
  if (min !== undefined && num < min) {
    num = min
  }
  
  if (max !== undefined && num > max) {
    num = max
  }
  
  return num
}

/**
 * Sanitize an array of strings
 */
export function sanitizeStringArray(arr: unknown, options: {
  maxItems?: number
  maxItemLength?: number
  unique?: boolean
} = {}): string[] {
  if (!Array.isArray(arr)) return []
  
  const { maxItems = 100, maxItemLength = 500, unique = true } = options
  
  let sanitized = arr
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => sanitizeString(String(item), { maxLength: maxItemLength }))
    .slice(0, maxItems)
  
  if (unique) {
    sanitized = [...new Set(sanitized)]
  }
  
  return sanitized
}

/**
 * Sanitize JSON input
 * Parses and re-stringifies to remove any prototype pollution attempts
 */
export function sanitizeJson<T = unknown>(str: string, maxDepth = 10): T | null {
  if (!str || typeof str !== 'string') return null
  
  try {
    const parsed = JSON.parse(str, (key, value) => {
      // Block prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined
      }
      return value
    })
    
    // Validate depth
    function checkDepth(obj: unknown, depth: number): boolean {
      if (depth > maxDepth) return false
      if (obj === null || typeof obj !== 'object') return true
      
      const values = Array.isArray(obj) ? obj : Object.values(obj)
      return values.every(val => checkDepth(val, depth + 1))
    }
    
    if (!checkDepth(parsed, 0)) {
      return null
    }
    
    return parsed as T
  } catch {
    return null
  }
}

/**
 * Sanitize search/filter input for database queries
 * Escapes special characters used in LIKE patterns
 */
export function sanitizeSearchQuery(str: string): string {
  if (!str || typeof str !== 'string') return ''
  
  return str
    .trim()
    .replace(/[%_\\]/g, char => '\\' + char)
    .slice(0, 200)
}

/**
 * Sanitize a UUID
 */
export function sanitizeUuid(str: string): string | null {
  if (!str || typeof str !== 'string') return null
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const trimmed = str.trim().toLowerCase()
  
  return uuidRegex.test(trimmed) ? trimmed : null
}

/**
 * Sanitize request body - applies sanitization to all string fields
 */
export function sanitizeRequestBody<T extends Record<string, unknown>>(
  body: T,
  fieldConfig: Partial<Record<keyof T, 'string' | 'email' | 'url' | 'username' | 'number' | 'skip'>> = {}
): T {
  const sanitized = { ...body }
  
  for (const [key, value] of Object.entries(sanitized)) {
    const config = fieldConfig[key as keyof T]
    
    if (config === 'skip') continue
    
    if (typeof value === 'string') {
      switch (config) {
        case 'email':
          sanitized[key as keyof T] = sanitizeEmail(value) as T[keyof T]
          break
        case 'url':
          sanitized[key as keyof T] = sanitizeUrl(value) as T[keyof T]
          break
        case 'username':
          sanitized[key as keyof T] = sanitizeUsername(value) as T[keyof T]
          break
        case 'number':
          sanitized[key as keyof T] = sanitizeNumber(value) as T[keyof T]
          break
        default:
          sanitized[key as keyof T] = sanitizeString(value) as T[keyof T]
      }
    }
  }
  
  return sanitized
}

/**
 * Create a sanitizer for specific fields
 */
export function createFieldSanitizer<T extends Record<string, unknown>>(
  config: Partial<Record<keyof T, 'string' | 'email' | 'url' | 'username' | 'number' | 'skip'>>
) {
  return (body: T): T => sanitizeRequestBody(body, config)
}
