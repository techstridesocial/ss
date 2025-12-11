/**
 * Modash UserId Validator
 * Detects invalid userId formats (like our internal UUIDs) and prevents API calls with them
 */

/**
 * Check if a string is a UUID (our internal ID format)
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * Check if a string looks like a valid Modash userId
 * Modash userIds are typically:
 * - Numeric strings (Instagram: "12345678")
 * - Short alphanumeric strings (TikTok/YouTube)
 * - NOT UUIDs (which are our internal IDs)
 * - Usually 8-20 characters
 */
export function isValidModashUserId(userId: string | null | undefined): boolean {
  if (!userId || typeof userId !== 'string') {
    return false
  }

  const trimmed = userId.trim()

  // Reject empty strings
  if (trimmed.length === 0) {
    return false
  }

  // Reject UUIDs (our internal IDs)
  if (isUUID(trimmed)) {
    return false
  }

  // Modash userIds are typically 8-20 characters
  // Can be numeric (Instagram) or alphanumeric (TikTok/YouTube)
  if (trimmed.length < 5 || trimmed.length > 50) {
    return false
  }

  // Should not contain spaces or special characters (except hyphens/underscores in some cases)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return false
  }

  return true
}

/**
 * Validate and clean a userId
 * Returns null if invalid, otherwise returns cleaned userId
 */
export function validateModashUserId(userId: string | null | undefined): string | null {
  if (!userId) {
    return null
  }

  const trimmed = userId.trim()

  if (!isValidModashUserId(trimmed)) {
    return null
  }

  return trimmed
}
