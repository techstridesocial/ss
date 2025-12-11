import { Contact } from '../types/discovery'

/**
 * Validates and sanitizes a contact URL, generating fallback URLs based on platform
 */
export const validateAndSanitizeUrl = (contact: Contact | null | undefined): string | null => {
  if (!contact?.value || typeof contact.value !== 'string') return null
  
  const url = contact.value.trim()
  
  // If it's already a full URL, validate it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url)
      return url
    } catch {
      return null
    }
  }
  
  // Generate fallback URLs based on platform
  const platform = contact.type?.toLowerCase()
  const username = url.replace(/^@/, '') // Remove @ if present
  
  switch (platform) {
    case 'instagram':
      return `https://www.instagram.com/${username}`
    case 'youtube':
      return url.includes('channel/') ? `https://www.youtube.com/${url}` : `https://www.youtube.com/@${username}`
    case 'tiktok':
      return `https://www.tiktok.com/@${username}`
    case 'linktree':
      return `https://linktr.ee/${username}`
    case 'twitter':
    case 'x':
      return `https://twitter.com/${username}`
    case 'facebook':
      return `https://www.facebook.com/${username}`
    default:
      // If platform type is unknown but URL looks valid, return it as-is
      if (url.includes('.')) {
        return url.startsWith('http') ? url : `https://${url}`
      }
      return null
  }
}

/**
 * Parses follower/view values like "1k", "1m", etc. to numbers
 */
export const parseFollowerValue = (value: string | undefined): number | undefined => {
  if (!value || value.trim() === '') return undefined
  
  const cleanValue = value.toLowerCase().replace(/[^0-9kmb.]/g, '')
  if (!cleanValue) return undefined
  
  let result: number
  if (cleanValue.includes('k')) {
    result = parseFloat(cleanValue.replace('k', '')) * 1000
  } else if (cleanValue.includes('m')) {
    result = parseFloat(cleanValue.replace('m', '')) * 1000000
  } else if (cleanValue.includes('b')) {
    result = parseFloat(cleanValue.replace('b', '')) * 1000000000
  } else {
    result = parseFloat(cleanValue)
  }
  
  return result
}
