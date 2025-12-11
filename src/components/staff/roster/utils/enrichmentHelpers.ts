/**
 * Enrichment Helpers for Roster Analytics
 * Transforms Modash data by adding roster-specific metadata
 */

import { StaffInfluencer } from '@/types/staff'

/**
 * Enrich Modash analytics data with roster influencer metadata
 * This creates a unified data structure combining Modash analytics and roster data
 */
export function enrichWithRosterData(
  modashData: any,
  influencer: StaffInfluencer
): any {
  return {
    ...modashData,
    // Roster metadata
    id: influencer.id,
    rosterId: influencer.id,
    isRosterInfluencer: true,
    hasPreservedAnalytics: true,
    // Platform information
    platforms: influencer.platforms,
    platform_count: influencer.platform_count,
    // Assignment and labels
    assigned_to: influencer.assigned_to,
    labels: influencer.labels || [],
    // Preserve notes for caching
    notes: influencer.notes,
    // Display name
    display_name: influencer.display_name
  }
}

/**
 * Create minimal roster data structure when analytics fetch fails
 * This ensures the panel can still show basic influencer info
 */
export function createRosterOnlyData(influencer: StaffInfluencer): any {
  return {
    ...influencer,
    isRosterInfluencer: true,
    rosterId: influencer.id
  }
}
