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
              // CRITICAL: Database is KING ONLY for username and linked platforms
              // Modash is KING for ALL analytics (followers, engagement, posts, audience, etc.)
              setDetailData({
                // Start with Modash data (MODASH IS KING for analytics)
                ...modashData.data,
                // Preserve ONLY database fields: username and linked platforms + CRM fields
                id: influencer.id,
                rosterId: influencer.id,
                isRosterInfluencer: true,
                hasPreservedAnalytics: true,
                // Database is KING for: which platforms this influencer has accounts on
                platforms: influencer.platforms, // Database platforms array (INSTAGRAM, TIKTOK, YOUTUBE)
                platform_count: influencer.platform_count,
                // Database is KING for: CRM/workflow fields
                assigned_to: influencer.assigned_to,
                labels: influencer.labels || [],
                notes: influencer.notes,
                // Database is KING for: basic identity (display_name)
                display_name: influencer.display_name,
                // Modash is KING for: ALL analytics (already spread from modashData.data above)
                // - followers, engagement_rate, avgLikes, avgComments, avgViews
                // - recentPosts, popularPosts, audience, statsByContentType
                // - brand_partnerships, brand_mentions, brand_affinity
                // - audience_interests, audience_languages, content_performance
                // - picture, bio, url, etc. (all from Modash)
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
                // CRITICAL: Database is KING ONLY for username and linked platforms
                // Modash is KING for ALL analytics (followers, engagement, posts, audience, etc.)
                setDetailData({
                  // Start with Modash data (MODASH IS KING for analytics)
                  ...modashData.data,
                  // Preserve ONLY database fields: username and linked platforms + CRM fields
                  id: influencer.id,
                  rosterId: influencer.id,
                  isRosterInfluencer: true,
                  hasPreservedAnalytics: true,
                  // Database is KING for: which platforms this influencer has accounts on
                  platforms: influencer.platforms, // Database platforms array (INSTAGRAM, TIKTOK, YOUTUBE)
                  platform_count: influencer.platform_count,
                  // Database is KING for: CRM/workflow fields
                  assigned_to: influencer.assigned_to,
                  labels: influencer.labels || [],
                  notes: influencer.notes,
                  // Database is KING for: basic identity (display_name)
                  display_name: influencer.display_name,
                  // Modash is KING for: ALL analytics (already spread from modashData.data above)
                  // - followers, engagement_rate, avgLikes, avgComments, avgViews
                  // - recentPosts, popularPosts, audience, statsByContentType
                  // - brand_partnerships, brand_mentions, brand_affinity
                  // - audience_interests, audience_languages, content_performance
                  // - picture, bio, url, etc. (all from Modash)
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

