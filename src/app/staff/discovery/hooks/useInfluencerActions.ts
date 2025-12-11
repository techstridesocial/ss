import { useState } from 'react'
import { Platform, Influencer } from '../types/discovery'
import { fetchInfluencerProfile, fetchExtendedAnalytics } from '../services/discoveryService'
import { useToast } from '@/components/ui/use-toast'

export function useInfluencerActions(
  selectedPlatform: Platform,
  saveInfluencer: (data: any) => Promise<any>,
  isInfluencerSaved: (username: string, platform: Platform) => boolean
) {
  const { toast } = useToast()
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [detailInfluencer, setDetailInfluencer] = useState<Influencer | null>(null)
  const [detailCity, setDetailCity] = useState<string | undefined>()
  const [detailCountry, setDetailCountry] = useState<string | undefined>()
  const [detailLoading, setDetailLoading] = useState(false)

  const handleHeartToggle = async (influencer: Influencer) => {
    const username = influencer.username ||
      influencer.instagram_handle?.replace('@', '') ||
      influencer.tiktok_handle?.replace('@', '') ||
      influencer.youtube_handle?.replace('@', '') ||
      'unknown'

    if (!username || username === 'unknown') {
      toast({
        title: "Unable to save influencer",
        description: "No valid username found for this influencer.",
        variant: "destructive"
      })
      return
    }

    if (isInfluencerSaved(username, selectedPlatform)) {
      toast({
        title: "Already saved",
        description: "This influencer is already in your saved list. Use the Saved tab to manage saved influencers.",
        variant: "default"
      })
      return
    }

    try {
      const modashUserId = influencer.userId || influencer.creatorId
      if (!modashUserId) {
        throw new Error('No Modash user ID available for this influencer')
      }

      const profileData = await fetchInfluencerProfile(modashUserId, selectedPlatform, {
        includePerformanceData: true
      })

      const extendedData = await fetchExtendedAnalytics(modashUserId, selectedPlatform, [
        'hashtags', 'partnerships', 'mentions', 'topics', 'interests', 'languages'
      ])

      const enrichedInfluencerData = {
        ...influencer,
        ...profileData,
        extended_analytics: extendedData
      }

      const savedInfluencerData = {
        username,
        display_name: profileData?.fullname || influencer.displayName || influencer.display_name || influencer.username,
        platform: selectedPlatform,
        followers: profileData?.followers || influencer.platforms?.[selectedPlatform]?.followers || influencer.followers || 0,
        engagement_rate: profileData?.engagementRate || influencer.platforms?.[selectedPlatform]?.engagement_rate || influencer.engagement_rate || 0,
        avg_likes: profileData?.avgLikes || influencer.avgLikes,
        avg_views: profileData?.avgViews || influencer.avgViews,
        avg_comments: profileData?.avgComments || influencer.avgComments,
        profile_picture: profileData?.picture || influencer.profilePicture || influencer.profile_picture || influencer.picture,
        bio: profileData?.bio || influencer.bio,
        location: profileData?.location || influencer.location,
        niches: influencer.niches || [influencer.niche].filter(Boolean) || [],
        profile_url: profileData?.url || influencer.url || `https://${selectedPlatform}.com/${username}`,
        modash_user_id: modashUserId,
        modash_data: enrichedInfluencerData,
        discovered_influencer_id: influencer.discoveredId
      }

      await saveInfluencer(savedInfluencerData)

      toast({
        title: "✅ Influencer saved!",
        description: `${savedInfluencerData.display_name || username} has been saved to your favorites with complete analytics.`,
        variant: "default"
      })
    } catch (error) {
      try {
        const basicSavedData = {
          username,
          display_name: influencer.displayName || influencer.display_name || influencer.username,
          platform: selectedPlatform,
          followers: influencer.platforms?.[selectedPlatform]?.followers || influencer.followers || 0,
          engagement_rate: influencer.platforms?.[selectedPlatform]?.engagement_rate || influencer.engagement_rate || 0,
          avg_likes: influencer.avgLikes,
          avg_views: influencer.avgViews,
          avg_comments: influencer.avgComments,
          profile_picture: influencer.profilePicture || influencer.profile_picture || influencer.picture,
          bio: influencer.bio,
          location: influencer.location,
          niches: influencer.niches || [influencer.niche].filter(Boolean) || [],
          profile_url: influencer.url || `https://${selectedPlatform}.com/${username}`,
          modash_user_id: influencer.userId || influencer.creatorId,
          modash_data: influencer,
          discovered_influencer_id: influencer.discoveredId
        }

        await saveInfluencer(basicSavedData)
        toast({
          title: "⚠️ Partially saved",
          description: `${basicSavedData.display_name || username} has been saved with basic data only. Full analytics could not be retrieved.`,
          variant: "default"
        })
      } catch (fallbackError) {
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        toast({
          title: "❌ Failed to save influencer",
          description: `${errorMessage}. Please check your connection and try again.`,
          variant: "destructive"
        })
      }
    }
  }

  const handleViewProfile = async (influencer: Influencer) => {
    setDetailPanelOpen(true)
    setDetailInfluencer(influencer)
    setDetailLoading(true)

    const fallbackLocation = influencer.location || 'Unknown'
    const [fallbackCity, fallbackCountry] = fallbackLocation.includes(',')
      ? fallbackLocation.split(',').map((s: string) => s.trim())
      : [fallbackLocation, 'Unknown']

    setDetailCity(fallbackCity)
    setDetailCountry(fallbackCountry)

    try {
      const platformData = influencer.platforms?.[selectedPlatform]
      const actualPlatform = selectedPlatform

      if (!platformData) {
        setDetailLoading(false)
        return
      }

      const userId = platformData?.userId || influencer.userId

      if (!userId) {
        setDetailLoading(false)
        return
      }

      try {
        const coreData = await fetchInfluencerProfile(userId, actualPlatform, {
          includeReport: true,
          includePerformanceData: true,
          searchResultData: {
            username: influencer.username,
            handle: influencer.handle,
            followers: influencer.followers,
            engagement_rate: influencer.engagement_rate,
            platform: actualPlatform,
            profile_picture: influencer.profile_picture || influencer.profilePicture || influencer.picture || influencer.avatar_url || platformData?.profile_picture,
            location: influencer.location,
            verified: influencer.verified
          }
        })

        const coreInfluencer: Influencer = {
          ...influencer,
          followers: coreData.followers || influencer.followers,
          engagement_rate: coreData.engagementRate || influencer.engagement_rate,
          avgLikes: coreData.avgLikes || 0,
          avgComments: coreData.avgComments || 0,
          avgShares: coreData.avgShares || 0,
          fake_followers_percentage: coreData.fake_followers_percentage,
          credibility: coreData.credibility,
          audience: coreData.audience,
          audience_interests: coreData.audience_interests,
          audience_languages: coreData.audience_languages,
          relevant_hashtags: coreData.relevant_hashtags,
          brand_partnerships: coreData.brand_partnerships,
          content_topics: coreData.content_topics,
          contacts: coreData.contacts || [],
          platforms: {
            ...influencer.platforms,
            [actualPlatform]: {
              ...coreData,
              followers: coreData.followers,
              engagementRate: coreData.engagementRate,
              avgLikes: coreData.avgLikes,
              avgComments: coreData.avgComments,
              avgShares: coreData.avgShares,
              fake_followers_percentage: coreData.fake_followers_percentage,
              credibility: coreData.credibility,
              audience: coreData.audience,
              audience_interests: coreData.audience_interests,
              audience_languages: coreData.audience_languages,
              relevant_hashtags: coreData.relevant_hashtags,
              brand_partnerships: coreData.brand_partnerships,
              content_topics: coreData.content_topics,
              statsByContentType: coreData.statsByContentType,
              topContent: coreData.topContent,
              profile_picture: coreData.profile_picture || coreData.profilePicture,
              profilePicture: coreData.profile_picture || coreData.profilePicture,
              ...coreData
            }
          },
          recentPosts: coreData.recentPosts,
          popularPosts: coreData.popularPosts,
          sponsoredPosts: coreData.sponsoredPosts,
          statHistory: coreData.statHistory,
          paidPostPerformance: coreData.paidPostPerformance,
          ...coreData
        }

        setDetailInfluencer(coreInfluencer)
        setDetailLoading(false)

        try {
          const extendedData = await fetchExtendedAnalytics(userId, actualPlatform, [
            'hashtags', 'partnerships', 'topics', 'interests', 'languages', 'overlap'
          ])

          if (extendedData) {
            const fullInfluencer: Influencer = {
              ...coreInfluencer,
              relevant_hashtags: extendedData.hashtags?.value || [],
              content_topics: extendedData.topics?.value || [],
              audience_interests: extendedData.interests?.value || [],
              audience_languages: extendedData.languages?.value || [],
              sponsoredPosts: extendedData.partnerships?.value || coreInfluencer.sponsoredPosts,
              partnerships_aggregate_metrics: extendedData.partnerships?.aggregate_metrics || {},
            }

            setDetailInfluencer(fullInfluencer)
          }
        } catch (extendedError) {
          // Core profile still works without extended data
        }
      } catch (error) {
        setDetailLoading(false)
      }
    } catch (error) {
      setDetailLoading(false)
    }
  }

  return {
    detailPanelOpen,
    setDetailPanelOpen,
    detailInfluencer,
    setDetailInfluencer,
    detailCity,
    detailCountry,
    detailLoading,
    handleHeartToggle,
    handleViewProfile
  }
}
