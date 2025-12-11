/**
 * Platform Validation Utility
 * Validates that the selected platform exists for the influencer
 * Auto-switches to first available platform if selected one doesn't exist
 * 
 * Note: This is a utility function, not a React hook
 */

import { StaffInfluencer } from '@/types/staff'

export type SupportedPlatform = 'instagram' | 'tiktok' | 'youtube'

export interface PlatformValidationResult {
  platformToUse: SupportedPlatform | null
  error: string | null
  availablePlatforms: SupportedPlatform[]
  hasSelectedPlatform: boolean
  wasAutoSwitched: boolean  // Makes intent clearer - indicates platform was auto-selected
}

/**
 * Validate platform selection for an influencer
 * Returns the effective platform to use and any error message
 */
export function validatePlatformSelection(
  influencer: StaffInfluencer | null,
  selectedPlatform: string
): PlatformValidationResult {
  // Early validation: No influencer provided
  if (!influencer) {
    return {
      platformToUse: null,
      error: 'No influencer provided',
      availablePlatforms: [],
      hasSelectedPlatform: false,
      wasAutoSwitched: false
    }
  }

  // Get available platforms with type-safe filtering
  // Convert uppercase Platform type ('INSTAGRAM') to lowercase SupportedPlatform ('instagram')
  const availablePlatforms: SupportedPlatform[] = Array.isArray(influencer.platforms)
    ? influencer.platforms
        .filter((p): p is NonNullable<typeof p> => p != null && typeof p === 'string' && p.length > 0)
        .map(p => p.toLowerCase() as string)
        .filter((p): p is SupportedPlatform => 
          (['instagram', 'tiktok', 'youtube'] as const).includes(p as SupportedPlatform)
        )
    : []

  // Normalize selected platform and validate it's supported
  const normalizedSelected = (selectedPlatform?.toLowerCase() || 'instagram') as SupportedPlatform
  
  // Validate selected platform is actually supported
  const supportedPlatforms: SupportedPlatform[] = ['instagram', 'tiktok', 'youtube']
  if (!supportedPlatforms.includes(normalizedSelected)) {
    // Unsupported platform requested
    if (availablePlatforms.length > 0) {
      // Influencer has platforms, but requested one is not supported
      const firstPlatform = availablePlatforms[0]
      if (!firstPlatform) {
        // This should never happen, but TypeScript needs this check
        return {
          platformToUse: null,
          error: `Unsupported platform: ${selectedPlatform}. Must be one of: ${supportedPlatforms.join(', ')}.`,
          availablePlatforms: [],
          hasSelectedPlatform: false,
          wasAutoSwitched: false
        }
      }
      return {
        platformToUse: firstPlatform,
        error: `Unsupported platform: ${selectedPlatform}. Must be one of: ${supportedPlatforms.join(', ')}. Showing ${firstPlatform} instead.`,
        availablePlatforms,
        hasSelectedPlatform: false,
        wasAutoSwitched: true
      }
    } else {
      // No platforms and unsupported platform requested
      return {
        platformToUse: null,
        error: `Unsupported platform: ${selectedPlatform}. Must be one of: ${supportedPlatforms.join(', ')}.`,
        availablePlatforms: [],
        hasSelectedPlatform: false,
        wasAutoSwitched: false
      }
    }
  }

  const hasSelectedPlatform = availablePlatforms.includes(normalizedSelected)

  // Case 1: Selected platform exists ✅
  if (hasSelectedPlatform) {
    return {
      platformToUse: normalizedSelected,
      error: null,
      availablePlatforms,
      hasSelectedPlatform: true,
      wasAutoSwitched: false
    }
  }

  // Case 2: Selected platform doesn't exist, but influencer has other platforms → Auto-switch
  if (availablePlatforms.length > 0) {
    const firstPlatform: SupportedPlatform | undefined = availablePlatforms[0]
    if (firstPlatform == null) {
      // This should never happen, but TypeScript needs this check
      return {
        platformToUse: null,
        error: 'No social media platforms connected. Please add platforms in settings.',
        availablePlatforms: [],
        hasSelectedPlatform: false,
        wasAutoSwitched: false
      }
    }
    return {
      platformToUse: firstPlatform,
      error: `Platform ${selectedPlatform} not connected. Showing ${firstPlatform} instead.`,
      availablePlatforms,
      hasSelectedPlatform: false,
      wasAutoSwitched: true
    }
  }

  // Case 3: No platforms at all ❌
  return {
    platformToUse: null,
    error: 'No social media platforms connected. Please add platforms in settings.',
    availablePlatforms: [],
    hasSelectedPlatform: false,
    wasAutoSwitched: false
  }
}
