/**
 * useRosterInfluencerAnalytics Hook
 * SIMPLIFIED: Get platform username from database, then fetch Modash analytics directly
 */

import { useState, useEffect, useRef } from 'react'
import { StaffInfluencer } from '@/types/staff'
import { ANALYTICS_CACHE_TTL_MS } from '@/constants/analytics'
import { validateModashUserId, isUUID } from '@/lib/utils/modash-userid-validator'

interface UseRosterAnalyticsOptions {
  onNotesUpdate?: (influencerId: string, notes: string) => void
}

function parseNotes(rawNotes: unknown): any {
  if (!rawNotes) return null
  if (typeof rawNotes === 'string') {
    try {
      return JSON.parse(rawNotes)
    } catch (error) {
      console.warn('⚠️ Failed to parse influencer notes JSON:', error)
      return null
    }
  }
  if (typeof rawNotes === 'object') {
    return rawNotes
  }
  return null
}

function getCachedAnalyticsEntry(notes: any, platform: string) {
  if (!notes) return null
  const platformKey = platform?.toLowerCase?.() || 'instagram'
  const modashData = notes?.modash_data
  const platformsData = modashData?.platforms
  if (!platformsData) return null
  const record = platformsData[platformKey]
  if (!record) return null
  const lastRefreshed = record.last_refreshed || record.lastRefreshed
  if (!lastRefreshed) return null
  const lastRefreshedTime = new Date(lastRefreshed).getTime()
  if (Number.isNaN(lastRefreshedTime)) return null
  if (Date.now() - lastRefreshedTime > ANALYTICS_CACHE_TTL_MS) return null
  return {
    record,
    payload: record.cached_payload || record.cachedPayload || null,
    lastRefreshed,
    lastRefreshedTime
  }
}

export function useRosterInfluencerAnalytics(
  influencer: StaffInfluencer | null,
  isOpen: boolean,
  selectedPlatform: string,
  options?: UseRosterAnalyticsOptions
) {
  const [detailData, setDetailData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const syncKeyRef = useRef<string | null>(null)
  const { onNotesUpdate } = options || {}

  const syncAnalyticsToServer = async (payload: any) => {
    if (!influencer || !payload) return

    const normalizedPlatform = selectedPlatform?.toLowerCase?.() || 'instagram'
    const keyParts = [
      influencer.id,
      normalizedPlatform,
      payload.userId || payload.username || '',
      String(payload.followers ?? ''),
      String(payload.engagementRate ?? ''),
      String(payload.averageViews ?? payload.avgViews ?? '')
    ]
    const syncKey = keyParts.join('|')

    if (syncKeyRef.current === syncKey) return
    syncKeyRef.current = syncKey

    try {
      const response = await fetch(`/api/roster/${influencer.id}/refresh-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: normalizedPlatform,
          modashUserId: payload.userId,
          metrics: {
            username: payload.username,
            followers: payload.followers,
            engagementRate: payload.engagementRate,
            avgViews: payload.averageViews ?? payload.avgViews,
            avgLikes: payload.avgLikes,
            avgComments: payload.avgComments,
            url: payload.url || payload.channelUrl,
            picture: payload.picture
          },
          profile: payload
        })
      })

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`)
      }

      const result = await response.json().catch(() => null)
      const updatedNotes = result?.data?.notes
      const lastRefreshed = result?.data?.last_refreshed
      if (updatedNotes && onNotesUpdate) {
        onNotesUpdate(influencer.id, updatedNotes)
      }
      if (lastRefreshed) {
        syncKeyRef.current = ['server', influencer.id, normalizedPlatform, lastRefreshed].join('|')
      }
    } catch (syncError) {
      console.error('⚠️ Failed to sync roster analytics to server:', syncError)
    }
  }

  useEffect(() => {
    if (!isOpen || !influencer) {
      setDetailData(null)
      setError(null)
      syncKeyRef.current = null
      return
    }

    const fetchCompleteData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log(`🔍 Roster Analytics: Fetching for influencer ${influencer.id}, platform ${selectedPlatform}`)

        const notesObject = parseNotes(influencer.notes)
        const cachedEntry = getCachedAnalyticsEntry(notesObject, selectedPlatform)
        if (cachedEntry && cachedEntry.payload) {
          const cachedPayload = cachedEntry.payload
          const enrichedPayload = {
            ...(cachedPayload || {}),
            followers: cachedPayload?.followers ?? cachedEntry.record.followers ?? 0,
            engagementRate: cachedPayload?.engagementRate ?? cachedEntry.record.engagementRate ?? 0,
            avgLikes: cachedPayload?.avgLikes ?? cachedEntry.record.avgLikes ?? 0,
            avgComments: cachedPayload?.avgComments ?? cachedEntry.record.avgComments ?? 0,
            avgViews: cachedPayload?.averageViews ?? cachedPayload?.avgViews ?? cachedEntry.record.avgViews ?? 0,
            averageViews: cachedPayload?.averageViews ?? cachedPayload?.avgViews ?? cachedEntry.record.avgViews ?? 0,
            url: cachedPayload?.url ?? cachedEntry.record.url ?? null,
            picture: cachedPayload?.picture ?? cachedEntry.record.picture ?? null,
            last_refreshed: cachedEntry.record.last_refreshed ?? cachedEntry.lastRefreshed
          }

          setDetailData({
            ...enrichedPayload,
            id: influencer.id,
            rosterId: influencer.id,
            isRosterInfluencer: true,
            hasPreservedAnalytics: true,
            platforms: influencer.platforms,
            platform_count: influencer.platform_count,
            assigned_to: influencer.assigned_to,
            labels: influencer.labels || [],
            notes: influencer.notes,
            display_name: influencer.display_name
          })

          syncKeyRef.current = ['cache', influencer.id, selectedPlatform.toLowerCase(), cachedEntry.lastRefreshed].join('|')
          setIsLoading(false)
          return
        }
        
        // Step 1: Check if we have stored Modash userId in notes (FAST PATH - like discovery)
        // CRITICAL: userId must be platform-specific - check if it matches the requested platform
        let modashUserId: string | null = null
        if (notesObject) {
          const storedPlatforms = notesObject.modash_data?.platforms
          const storedUserId = storedPlatforms?.[selectedPlatform?.toLowerCase?.() || 'instagram']?.userId
          const storedPlatform = storedPlatforms?.[selectedPlatform?.toLowerCase?.() || 'instagram'] ? selectedPlatform : notesObject.modash_data?.platform
          // Backwards compatibility: fall back to legacy top-level fields
          const legacyUserId = notesObject.modash_data?.userId || notesObject.modash_data?.modash_user_id

          const normalizedSelectedPlatform = selectedPlatform?.toLowerCase() || 'instagram'
          
          // Validate and use platform-specific userId
          if (storedUserId) {
            const validatedUserId = validateModashUserId(storedUserId)
            if (validatedUserId) {
              modashUserId = validatedUserId
              console.log(`✅ Roster Analytics: Found valid stored Modash userId ${modashUserId} for platform ${normalizedSelectedPlatform}`)
            } else {
              console.warn(`⚠️ Roster Analytics: Invalid stored userId format (looks like internal UUID or invalid): ${storedUserId}. Will fallback to username search.`)
              // Clear invalid userId from notes? (Could add cleanup logic here)
            }
          }
          
          // Validate and use legacy userId if platform-specific not available
          if (!modashUserId && legacyUserId) {
            const validatedLegacyUserId = validateModashUserId(legacyUserId)
            if (validatedLegacyUserId) {
              const normalizedStoredPlatform = (storedPlatform || notesObject.modash_data?.platform || '').toLowerCase()
              if (!normalizedStoredPlatform || normalizedStoredPlatform === normalizedSelectedPlatform) {
                modashUserId = validatedLegacyUserId
                console.log(`✅ Roster Analytics: Using validated legacy stored userId ${modashUserId}`)
              } else {
                console.warn(`⚠️ Roster Analytics: Legacy userId exists but platform mismatch (${normalizedStoredPlatform} vs ${normalizedSelectedPlatform}). Will fallback to username search.`)
              }
            } else {
              if (isUUID(legacyUserId)) {
                console.warn(`⚠️ Roster Analytics: Legacy userId is an internal UUID (${legacyUserId}), not a Modash userId. Will fallback to username search.`)
              } else {
                console.warn(`⚠️ Roster Analytics: Invalid legacy userId format: ${legacyUserId}. Will fallback to username search.`)
              }
            }
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
              await syncAnalyticsToServer(modashData.data)
              setIsLoading(false)
              return
            } else {
              console.warn(`⚠️ Roster Analytics: Modash returned no data with userId:`, modashData)
              // Fallback to username search
              modashUserId = null // Clear to trigger username search
            }
          } else {
            const errorData = await modashResponse.json().catch(() => ({}))
            const statusCode = modashResponse.status
            console.error(`❌ Roster Analytics: Modash API error with userId (${statusCode}):`, errorData)
            
            // CRITICAL: If rate limited (429), DO NOT retry or fallback - stop immediately
            if (statusCode === 429) {
              setError('Rate limit exceeded. Please wait a few minutes before trying again.')
              setDetailData({
                ...influencer,
                isRosterInfluencer: true,
                rosterId: influencer.id
              })
              return // Exit early - don't cascade more API calls
            }
            
            // For 400/404 errors, fallback to username search (userId might be wrong platform)
            if (statusCode === 400 || statusCode === 404) {
              console.log(`🔄 Roster Analytics: Falling back to username search (userId lookup failed with ${statusCode})`)
              modashUserId = null // Clear to trigger username search
            } else {
              // For other errors (500, etc.), don't retry - use roster data only
              console.warn(`⚠️ Roster Analytics: Unexpected error (${statusCode}), using roster data only`)
              setDetailData({
                ...influencer,
                isRosterInfluencer: true,
                rosterId: influencer.id
              })
              return
            }
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
                  ...modashData.data,
                  id: influencer.id,
                  rosterId: influencer.id,
                  isRosterInfluencer: true,
                  hasPreservedAnalytics: true,
                  platforms: influencer.platforms,
                  platform_count: influencer.platform_count,
                  assigned_to: influencer.assigned_to,
                  labels: influencer.labels || [],
                  notes: influencer.notes,
                  display_name: influencer.display_name
                })
                await syncAnalyticsToServer(modashData.data)
                setIsLoading(false)
                return
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
              const statusCode = modashResponse.status
              console.error(`❌ Roster Analytics: Modash API error with username (${statusCode}):`, errorData)

              // CRITICAL: If rate limited (429), stop immediately
              if (statusCode === 429) {
                setError('Rate limit exceeded. Please wait a few minutes before trying again.')
                setDetailData({
                  ...influencer,
                  isRosterInfluencer: true,
                  rosterId: influencer.id
                })
                return
              }

              // For other errors, use roster data as fallback
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

