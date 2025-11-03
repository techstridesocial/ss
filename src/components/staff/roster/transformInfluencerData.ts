/**
 * Transform Staff Influencer to InfluencerDetailPanel format
 * Centralizes the data transformation logic
 */

import { StaffInfluencer } from '@/types/staff'

export function transformInfluencerForDetailPanel(influencer: StaffInfluencer) {
  return {
    id: influencer.id,
    displayName: influencer.display_name,
    name: influencer.display_name,
    handle: (influencer.display_name || 'creator').toLowerCase().replace(/\s+/g, ''),
    picture: influencer.avatar_url || undefined,
    profilePicture: influencer.avatar_url || undefined,
    followers: influencer.total_followers || 0,
    engagement_rate: influencer.total_engagement_rate || 0,
    engagementRate: influencer.total_engagement_rate || 0,
    avgViews: influencer.total_avg_views || 0,
    bio: influencer.bio || undefined,
    isRosterInfluencer: true,
    rosterId: influencer.id,
    hasPreservedAnalytics: false
  }
}

