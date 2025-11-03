/**
 * Roster Helper Functions
 * Utility functions for roster page
 */

import { Platform } from '@/types/database'

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number | null | undefined): string {
  if (!num || num === 0) return '0'
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Get badge color for platform
 */
export function getPlatformBadgeColor(platform: Platform): string {
  const colors: Record<string, string> = {
    INSTAGRAM: 'bg-pink-100 text-pink-800',
    TIKTOK: 'bg-black text-white',
    YOUTUBE: 'bg-red-100 text-red-800'
  }
  return colors[platform] || 'bg-gray-100 text-gray-800'
}

/**
 * Check if follower count is in range
 */
export function checkFollowerRange(followers: number, range: string): boolean {
  switch (range) {
    case 'under-10k': return followers < 10000
    case '10k-50k': return followers >= 10000 && followers <= 50000
    case '50k-100k': return followers >= 50000 && followers <= 100000
    case '100k-500k': return followers >= 100000 && followers <= 500000
    case '500k-1m': return followers >= 500000 && followers <= 1000000
    case 'over-1m': return followers > 1000000
    default: return true
  }
}

/**
 * Check if engagement rate is in range
 */
export function checkEngagementRange(engagement: number, range: string): boolean {
  switch (range) {
    case 'under-2': return engagement < 2.0
    case '2-4': return engagement >= 2.0 && engagement <= 4.0
    case '4-6': return engagement >= 4.0 && engagement <= 6.0
    case 'over-6': return engagement > 6.0
    default: return true
  }
}

/**
 * Determine influencer tier based on followers and engagement
 */
export function getInfluencerTier(
  totalFollowers: number, 
  engagementRate: number, 
  influencerType?: string, 
  manualTier?: string
): string | null {
  // Agency Partners don't have tiers
  if (influencerType === 'AGENCY_PARTNER') {
    return null
  }
  
  // Use manual tier if set
  if (manualTier) {
    return manualTier
  }
  
  // Gold: High followers (>500k) OR high engagement (>6%)
  if (totalFollowers > 500000 || engagementRate > 6) {
    return 'GOLD'
  }
  // Silver: Medium followers (100k-500k) OR good engagement (3-6%)
  if (totalFollowers > 100000 || (engagementRate >= 3 && engagementRate <= 6)) {
    return 'SILVER'
  }
  // Default for SIGNED/PARTNERED
  return 'SILVER'
}

/**
 * Check if influencer needs assignment
 */
export function needsAssignment(influencer: { content_type?: string | null; influencer_type?: string | null }): boolean {
  // Pending if content_type is null OR influencer_type is null
  return !influencer.content_type || !influencer.influencer_type
}

