/**
 * Validation utilities for form inputs
 */

/**
 * Validates email address format
 * More robust than simple regex - checks for proper domain structure
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // More comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  
  return emailRegex.test(email.trim())
}

/**
 * Validates phone number format
 * Accepts international format with + prefix
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  const trimmed = phone.trim()
  if (trimmed.length === 0) return false
  
  // Basic validation - must have digits and optionally start with +
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  const digitsOnly = trimmed.replace(/[\s\-\(\)]/g, '')
  
  return phoneRegex.test(digitsOnly) && digitsOnly.length >= 10
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Normalizes URL by adding https:// if missing
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return url
  
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  
  return `https://${trimmed}`
}

/**
 * Validates file type for uploads
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validates file size (in bytes)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Checks for duplicate emails in an array
 */
export function hasDuplicateEmails(emails: string[]): boolean {
  const normalized = emails
    .filter(email => email && email.trim())
    .map(email => email.toLowerCase().trim())
  
  return new Set(normalized).size !== normalized.length
}

/**
 * Gets validation error message for a field
 */
export function getValidationError(field: string, value: any, isRequired: boolean = true): string | null {
  if (isRequired && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    return `${field} is required`
  }
  
  if (value) {
    if (field.toLowerCase().includes('email') && typeof value === 'string') {
      if (!isValidEmail(value)) {
        return 'Please enter a valid email address'
      }
    }
    
    if (field.toLowerCase().includes('phone') && typeof value === 'string') {
      if (!isValidPhone(value)) {
        return 'Please enter a valid phone number'
      }
    }
    
    if (field.toLowerCase().includes('website') || field.toLowerCase().includes('url')) {
      if (typeof value === 'string' && !isValidUrl(value)) {
        return 'Please enter a valid URL'
      }
    }
  }
  
  return null
}

