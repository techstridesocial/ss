import { Influencer } from '../types/discovery'
import { InfluencerData } from '@/components/influencer/detail-panel/types'

/**
 * Converts an Influencer (from discovery) to InfluencerData (for detail panel)
 * Ensures all required fields are present with fallbacks
 */
export function convertInfluencerToDetailData(influencer: Influencer | null): InfluencerData | null {
  if (!influencer) return null

  // Get required fields with fallbacks
  const id = influencer.id || influencer.userId || influencer.creatorId || influencer.discoveredId || 'unknown'
  const handle = influencer.handle || influencer.username || 'unknown'
  const followers = influencer.followers || influencer.totalFollowers || 0

  // Convert platforms data structure
  const platforms: InfluencerData['platforms'] = {}
  if (influencer.platforms) {
    Object.entries(influencer.platforms).forEach(([platform, data]) => {
      if (platform === 'instagram' || platform === 'tiktok' || platform === 'youtube') {
        platforms[platform] = {
          followers: data.followers,
          engagementRate: data.engagementRate || data.engagement_rate,
          avgLikes: data.avgLikes,
          avgComments: data.avgComments,
          avgShares: data.avgShares,
          fake_followers_percentage: data.fake_followers_percentage,
          credibility: data.credibility,
          audience: data.audience,
          audience_interests: data.audience_interests,
          audience_languages: data.audience_languages,
          relevant_hashtags: Array.isArray(data.relevant_hashtags) 
            ? data.relevant_hashtags 
            : undefined,
          brand_partnerships: data.brand_partnerships,
          content_topics: Array.isArray(data.content_topics) 
            ? data.content_topics 
            : undefined,
          statsByContentType: data.statsByContentType,
          topContent: data.topContent,
          content_performance: data.content_performance,
          profile_picture: data.profile_picture || data.profilePicture,
          profilePicture: data.profile_picture || data.profilePicture,
          recentPosts: data.recentPosts,
          popularPosts: data.popularPosts,
          sponsoredPosts: data.sponsoredPosts,
          statHistory: data.statHistory,
          paidPostPerformance: data.paidPostPerformance,
          ...data
        }
      }
    })
  }

  // Convert contacts
  const contacts = influencer.contacts?.map(contact => ({
    type: contact.type,
    value: contact.value
  })) || []

  return {
    id,
    handle,
    followers,
    name: influencer.name || influencer.displayName || influencer.display_name,
    displayName: influencer.displayName || influencer.display_name,
    display_name: influencer.display_name || influencer.displayName,
    username: influencer.username,
    profilePicture: influencer.profilePicture || influencer.profile_picture || influencer.picture,
    profile_picture: influencer.profile_picture || influencer.profilePicture || influencer.picture,
    picture: influencer.picture || influencer.profilePicture || influencer.profile_picture,
    bio: influencer.bio,
    url: influencer.url,
    description: influencer.bio,
    engagement_rate: influencer.engagement_rate,
    engagementRate: influencer.engagementRate || influencer.engagement_rate,
    isVerified: influencer.verified,
    platforms: Object.keys(platforms).length > 0 ? platforms : undefined,
    avgViews: influencer.avgViews,
    avgLikes: influencer.avgLikes,
    avgComments: influencer.avgComments,
    avgShares: influencer.avgShares,
    fake_followers_percentage: influencer.fake_followers_percentage,
    contacts,
    // Include all other fields that might be needed
    ...influencer
  } as InfluencerData
}
