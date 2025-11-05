/**
 * useRosterInfluencerAnalytics Hook
 * SIMPLIFIED: Get platform username from database, then fetch Modash analytics directly
 */

import { useState, useEffect } from 'react'
import { StaffInfluencer } from '@/types/staff'

export function useRosterInfluencerAnalytics(influencer: StaffInfluencer | null, isOpen: boolean, selectedPlatform: string) {
  const [detailData, setDetailData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !influencer) {
      setDetailData(null)
      setError(null)
      return
    }

    const fetchCompleteData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log(`🔍 Roster Analytics: Fetching for influencer ${influencer.id}, platform ${selectedPlatform}`)
        
        // Step 1: Check if we have stored Modash userId in notes (FAST PATH - like discovery)
        let modashUserId: string | null = null
        if (influencer.notes) {
          try {
            const notes = typeof influencer.notes === 'string' ? JSON.parse(influencer.notes) : influencer.notes
            modashUserId = notes.modash_data?.userId || notes.modash_data?.modash_user_id || null
            if (modashUserId) {
              console.log(`✅ Roster Analytics: Found stored Modash userId: ${modashUserId}`)
            }
          } catch (e) {
            console.warn('⚠️ Could not parse notes for userId:', e)
          }
        }

        // Step 2: If we have userId, use it directly (skip username search - FASTEST)
        if (modashUserId) {
          console.log(`🔍 Roster Analytics: Using stored userId ${modashUserId} (skipping username search)`)
          const modashResponse = await fetch('/api/discovery/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: modashUserId,
              platform: selectedPlatform
            })
          })

          if (modashResponse.ok) {
            const modashData = await modashResponse.json()
            
            if (modashData.success && modashData.data) {
              console.log(`✅ Roster Analytics: Successfully fetched Modash data using userId`)
              // CRITICAL: Database is KING - start with roster influencer data
              // Modash data only ENRICHES analytics fields, doesn't override database fields
              setDetailData({
                // Start with roster influencer (DATABASE IS KING)
                ...influencer,
                // Mark as roster influencer
                isRosterInfluencer: true,
                rosterId: influencer.id,
                hasPreservedAnalytics: true,
                // ENRICH with Modash analytics (only analytics fields, not core data)
                // Analytics fields from Modash (enrichment):
                engagementRate: modashData.data.engagementRate || modashData.data.engagement_rate,
                engagement_rate: modashData.data.engagement_rate || modashData.data.engagementRate,
                avgLikes: modashData.data.avgLikes,
                avgComments: modashData.data.avgComments,
                avgViews: modashData.data.avgViews,
                recentPosts: modashData.data.recentPosts,
                popularPosts: modashData.data.popularPosts,
                audience: modashData.data.audience,
                statsByContentType: modashData.data.statsByContentType,
                brand_partnerships: modashData.data.brand_partnerships,
                brand_mentions: modashData.data.brand_mentions,
                brand_affinity: modashData.data.brand_affinity,
                audience_interests: modashData.data.audience_interests,
                audience_languages: modashData.data.audience_languages,
                content_performance: modashData.data.content_performance,
                // Profile picture from Modash (can be fresher)
                picture: modashData.data.picture || influencer.avatar_url,
                // Keep database fields as KING (these should NOT be overridden):
                // - id: influencer.id (already from spread)
                // - display_name: influencer.display_name (already from spread)
                // - platforms: influencer.platforms (already from spread - database platforms)
                // - total_followers: influencer.total_followers (already from spread - database)
                // - assigned_to: influencer.assigned_to (already from spread)
                // - labels: influencer.labels (already from spread)
                // - notes: influencer.notes (already from spread)
              })
            } else {
              console.warn(`⚠️ Roster Analytics: Modash returned no data with userId:`, modashData)
              // Fallback to username search
              modashUserId = null // Clear to trigger username search
            }
          } else {
            const errorData = await modashResponse.json().catch(() => ({}))
            console.error(`❌ Roster Analytics: Modash API error with userId:`, errorData)
            // Fallback to username search
            modashUserId = null // Clear to trigger username search
          }
        }

        // Step 3: Fallback to username search if no userId or userId failed
        if (!modashUserId) {
          console.log(`🔍 Roster Analytics: No stored userId, trying username search...`)
          
          // Get platform username from database
          const platformResponse = await fetch(`/api/influencers/${influencer.id}/platform-username?platform=${selectedPlatform}`)
          
          let username: string | null = null
          if (platformResponse.ok) {
            const platformData = await platformResponse.json()
            username = platformData.success ? platformData.username : null
            console.log(`✅ Roster Analytics: Found username "${username}" for platform ${selectedPlatform}`)
          } else {
            const errorData = await platformResponse.json().catch(() => ({}))
            console.error(`❌ Roster Analytics: Failed to get username:`, errorData)
          }

          // If we have username, try username search (SLOW PATH)
          if (username) {
            // Clean username: remove @ symbol and trim whitespace
            const cleanUsername = username.replace('@', '').trim()
            console.log(`🔍 Roster Analytics: Fetching Modash data for username "${cleanUsername}" (original: "${username}") on ${selectedPlatform}`)
            const modashResponse = await fetch('/api/discovery/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: cleanUsername,
                platform: selectedPlatform
              })
            })

            if (modashResponse.ok) {
              const modashData = await modashResponse.json()
              
              if (modashData.success && modashData.data) {
                console.log(`✅ Roster Analytics: Successfully fetched Modash data using username`)
                // CRITICAL: Database is KING - start with roster influencer data
                // Modash data only ENRICHES analytics fields, doesn't override database fields
                setDetailData({
                  // Start with roster influencer (DATABASE IS KING)
                  ...influencer,
                  // Mark as roster influencer
                  isRosterInfluencer: true,
                  rosterId: influencer.id,
                  hasPreservedAnalytics: true,
                  // ENRICH with Modash analytics (only analytics fields, not core data)
                  // Analytics fields from Modash (enrichment):
                  engagementRate: modashData.data.engagementRate || modashData.data.engagement_rate,
                  engagement_rate: modashData.data.engagement_rate || modashData.data.engagementRate,
                  avgLikes: modashData.data.avgLikes,
                  avgComments: modashData.data.avgComments,
                  avgViews: modashData.data.avgViews,
                  recentPosts: modashData.data.recentPosts,
                  popularPosts: modashData.data.popularPosts,
                  audience: modashData.data.audience,
                  statsByContentType: modashData.data.statsByContentType,
                  brand_partnerships: modashData.data.brand_partnerships,
                  brand_mentions: modashData.data.brand_mentions,
                  brand_affinity: modashData.data.brand_affinity,
                  audience_interests: modashData.data.audience_interests,
                  audience_languages: modashData.data.audience_languages,
                  content_performance: modashData.data.content_performance,
                  // Profile picture from Modash (can be fresher)
                  picture: modashData.data.picture || influencer.avatar_url,
                  // Keep database fields as KING (these should NOT be overridden):
                  // - id: influencer.id (already from spread)
                  // - display_name: influencer.display_name (already from spread)
                  // - platforms: influencer.platforms (already from spread - database platforms)
                  // - total_followers: influencer.total_followers (already from spread - database)
                  // - assigned_to: influencer.assigned_to (already from spread)
                  // - labels: influencer.labels (already from spread)
                  // - notes: influencer.notes (already from spread)
                })
              } else {
                console.warn(`⚠️ Roster Analytics: Modash returned no data with username:`, modashData)
              // Modash failed, use roster data as fallback
              setDetailData({
                ...influencer,
                isRosterInfluencer: true,
                rosterId: influencer.id
              })
            }
          } else {
              const errorData = await modashResponse.json().catch(() => ({}))
              console.error(`❌ Roster Analytics: Modash API error with username:`, errorData)
            // Modash API error, use roster data as fallback
            setDetailData({
              ...influencer,
              isRosterInfluencer: true,
              rosterId: influencer.id
            })
          }
        } else {
            console.warn(`⚠️ Roster Analytics: No username found for platform ${selectedPlatform} - using roster data only`)
          // No username found, use roster data only
          setDetailData({
            ...influencer,
            isRosterInfluencer: true,
            rosterId: influencer.id
          })
          }
        }

      } catch (err) {
        console.error('Error loading analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load influencer analytics')
        setDetailData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompleteData()
  }, [influencer?.id, isOpen, selectedPlatform])

  const retry = () => {
    if (influencer && isOpen) {
      setError(null)
      setDetailData(null)
      // Trigger refetch by clearing and letting useEffect run
    }
  }

  return {
    data: detailData,
    isLoading,
    error,
    retry
  }
}

