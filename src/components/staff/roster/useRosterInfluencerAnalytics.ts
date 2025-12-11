/**
 * useRosterInfluencerAnalytics Hook
 * SIMPLIFIED: Get platform username from database, then fetch Modash analytics directly
 */

import { useState, useEffect, useRef } from 'react'
import { StaffInfluencer } from '@/types/staff'
import { ANALYTICS_CACHE_TTL_MS } from '@/constants/analytics'
import { enrichWithRosterData, createRosterOnlyData } from './utils/enrichmentHelpers'

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
  const syncInProgressRef = useRef<Set<string>>(new Set())
  const { onNotesUpdate } = options || {}

  const syncAnalyticsToServer = async (payload: any, platform?: string) => {
    if (!influencer || !payload) return

    const normalizedPlatform = platform || selectedPlatform?.toLowerCase?.() || 'instagram'
    const syncId = `${influencer.id}:${normalizedPlatform}`

    // Check if already syncing (prevent race conditions)
    if (syncInProgressRef.current.has(syncId)) {
      console.log('⏳ Sync already in progress, skipping duplicate request')
      return
    }

    // Mark as in-progress
    syncInProgressRef.current.add(syncId)

    try {
      // Use metrics normalizer to ensure consistent format
      const { normalizeModashMetrics } = await import('@/lib/utils/metrics-normalizer')
      
      // Normalize the payload metrics to ensure consistent format
      const normalizedMetrics = normalizeModashMetrics({
        username: payload.username,
        followers: payload.followers,
        engagementRate: payload.engagementRate,
        avgViews: payload.averageViews ?? payload.avgViews,
        avgLikes: payload.avgLikes,
        avgComments: payload.avgComments,
        url: payload.url || payload.channelUrl,
        picture: payload.picture
      })

      const response = await fetch(`/api/roster/${influencer.id}/refresh-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: normalizedPlatform,
          modashUserId: payload.userId,
          metrics: normalizedMetrics,
          profile: payload
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Sync failed with status ${response.status}`)
      }

      const result = await response.json().catch(() => null)
      
      // New service structure doesn't return notes in response
      // The notes are updated in the database, but we don't need to sync them back
      // The next fetch will get the updated data from cache
      if (result?.success) {
        console.log('✅ Analytics synced successfully', {
          platform: result.data?.platform,
          lastRefreshed: result.data?.last_refreshed
        })
      }

    } catch (syncError) {
      console.error('⚠️ Failed to sync roster analytics to server:', syncError)
      // Don't throw - sync is non-critical
    } finally {
      // Always remove from in-progress Set (allows retry on error)
      syncInProgressRef.current.delete(syncId)
    }
  }

  useEffect(() => {
    if (!isOpen || !influencer) {
      setDetailData(null)
      setError(null)
      setIsLoading(false)
      return
    }

    // Create AbortController for cleanup
    const abortController = new AbortController()

    const fetchCompleteData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log(`🔍 Roster Analytics: Fetching for influencer ${influencer.id}, platform ${selectedPlatform}`)

        // CRITICAL: Validate that the influencer actually has this platform
        // If not, use the first available platform or show error
        const availablePlatforms = Array.isArray(influencer.platforms) 
          ? influencer.platforms.map(p => p?.toLowerCase()).filter(Boolean)
          : []
        
        const normalizedSelectedPlatform = selectedPlatform?.toLowerCase() || 'instagram'
        const hasSelectedPlatform = availablePlatforms.includes(normalizedSelectedPlatform)
        
        // Determine which platform to actually use
        let platformToUse: string
        
        if (!hasSelectedPlatform) {
          if (availablePlatforms.length > 0) {
            // Platform doesn't exist for this influencer, but they have other platforms
            // Auto-select the first available platform
            const firstPlatform = availablePlatforms[0]
            if (!firstPlatform) {
              setError('Unable to determine platform for this influencer.')
              setDetailData(createRosterOnlyData(influencer))
              return
            }
            platformToUse = firstPlatform
            console.warn(`⚠️ Roster Analytics: Requested platform "${selectedPlatform}" not available. Influencer has: ${availablePlatforms.join(', ')}. Auto-switching to: ${platformToUse}`)
            setError(`This influencer doesn't have ${selectedPlatform} connected. Showing analytics for ${platformToUse} instead.`)
          } else {
            // No platforms at all
            setError('This influencer has no social media platforms connected. Please add a platform in influencer settings.')
            setDetailData(createRosterOnlyData(influencer))
            return
          }
        } else {
          // Requested platform exists, use it
          platformToUse = normalizedSelectedPlatform
        }

        const notesObject = parseNotes(influencer.notes)
        const cachedEntry = getCachedAnalyticsEntry(notesObject, platformToUse)
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

          setDetailData(enrichWithRosterData(enrichedPayload, influencer))

          return
        }
        
        // Step 1: Check if we have stored Modash userId in notes (FAST PATH - like discovery)
        // CRITICAL: Use shared resolver utility (same logic as refresh-analytics route)
        const { resolveModashUserId } = await import('@/lib/utils/modash-userid-validator')
        
        let modashUserId: string | null = null
        if (notesObject) {
          const storedPlatforms = notesObject.modash_data?.platforms
          const storedUserId = storedPlatforms?.[platformToUse]?.userId
          const legacyUserId = notesObject.modash_data?.userId || notesObject.modash_data?.modash_user_id
          const storedPlatform = notesObject.modash_data?.platform

          // Use shared resolver (DRY - same as refresh-analytics route)
          const resolution = resolveModashUserId([
            { 
              value: storedUserId, 
              name: 'platform-specific' 
            },
            { 
              value: legacyUserId, 
              name: 'legacy',
              platformCheck: () => {
                const legacyPlatform = (storedPlatform || '').toLowerCase()
                return !legacyPlatform || legacyPlatform === platformToUse
              }
            }
          ])

          if (resolution) {
            modashUserId = resolution.userId
            console.log(`✅ Roster Analytics: Found valid userId from ${resolution.source}: ${modashUserId}`)
          } else {
            console.log(`📭 Roster Analytics: No valid stored userId found, will try username search`)
          }
        }

        // Step 2: If we have userId, use it directly (skip username search - FASTEST)
        if (modashUserId) {
          console.log(`🔍 Roster Analytics: Using stored userId ${modashUserId} (skipping username search)`)
          const modashResponse = await fetch('/api/discovery/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortController.signal,
            body: JSON.stringify({
              userId: modashUserId,
              platform: platformToUse
            })
          })

          if (modashResponse.ok) {
            const modashData = await modashResponse.json()
            
            if (modashData.success && modashData.data) {
              console.log(`✅ Roster Analytics: Successfully fetched Modash data using userId`)
              // CRITICAL: Database is KING ONLY for username and linked platforms
              // Modash is KING for ALL analytics (followers, engagement, posts, audience, etc.)
              setDetailData(enrichWithRosterData(modashData.data, influencer))
              await syncAnalyticsToServer(modashData.data, platformToUse)
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
              setDetailData(createRosterOnlyData(influencer))
              return // Exit early - don't cascade more API calls
            }
            
            // For 400 errors with UUID, skip username search if no username exists (will fail anyway)
            // For 404 errors or other 400 errors, try username search as fallback
            if (statusCode === 400) {
              // Check if this is a UUID error
              if (errorData.errorCode === 'INVALID_UUID_AS_USERID') {
                console.warn(`⚠️ Roster Analytics: UUID detected as userId, will try username search as fallback`)
                modashUserId = null // Clear to trigger username search
              } else {
                console.log(`🔄 Roster Analytics: Falling back to username search (userId lookup failed with 400: ${errorData.error || 'unknown error'})`)
                modashUserId = null // Clear to trigger username search
              }
            } else if (statusCode === 404) {
              console.log(`🔄 Roster Analytics: Falling back to username search (userId not found - 404)`)
              modashUserId = null // Clear to trigger username search
            } else {
              // For other errors (500, etc.), don't retry - use roster data only
              console.warn(`⚠️ Roster Analytics: Unexpected error (${statusCode}), using roster data only`)
              setError(errorData.error || `Failed to fetch analytics (${statusCode})`)
              setDetailData(createRosterOnlyData(influencer))
              return
            }
          }
        }

        // Step 3: Fallback to username search if no userId or userId failed
        if (!modashUserId) {
          console.log(`🔍 Roster Analytics: No stored userId, trying username search...`)
          
          // Get platform username from database
          const platformResponse = await fetch(`/api/influencers/${influencer.id}/platform-username?platform=${platformToUse}`, {
            signal: abortController.signal
          })
          
          let username: string | null = null
          if (platformResponse.ok) {
            const platformData = await platformResponse.json()
            username = platformData.success ? platformData.username : null
            console.log(`✅ Roster Analytics: Found username "${username}" for platform ${platformToUse}`)
          } else {
            const errorData = await platformResponse.json().catch(() => ({}))
            console.error(`❌ Roster Analytics: Failed to get username:`, errorData)
          }

          // If we have username, try username search (SLOW PATH)
          if (username) {
            // Clean username: remove @ symbol and trim whitespace
            const cleanUsername = username.replace('@', '').trim()
            console.log(`🔍 Roster Analytics: Fetching Modash data for username "${cleanUsername}" (original: "${username}") on ${platformToUse}`)
            const modashResponse = await fetch('/api/discovery/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: abortController.signal,
              body: JSON.stringify({
                username: cleanUsername,
                platform: platformToUse
              })
            })

            if (modashResponse.ok) {
              const modashData = await modashResponse.json()

              if (modashData.success && modashData.data) {
                console.log(`✅ Roster Analytics: Successfully fetched Modash data using username`)
                // CRITICAL: Database is KING ONLY for username and linked platforms
                // Modash is KING for ALL analytics (followers, engagement, posts, audience, etc.)
              setDetailData(enrichWithRosterData(modashData.data, influencer))
                await syncAnalyticsToServer(modashData.data, platformToUse)
                setIsLoading(false)
                return
              } else {
                console.warn(`⚠️ Roster Analytics: Modash returned no data with username:`, modashData)
                // Modash failed, use roster data as fallback
                setDetailData(createRosterOnlyData(influencer))
              }
            } else {
              const errorData = await modashResponse.json().catch(() => ({}))
              const statusCode = modashResponse.status
              console.error(`❌ Roster Analytics: Modash API error with username (${statusCode}):`, errorData)

              // CRITICAL: If rate limited (429), stop immediately
              if (statusCode === 429) {
                setError('Rate limit exceeded. Please wait a few minutes before trying again.')
                setDetailData(createRosterOnlyData(influencer))
                return
              }

              // For other errors, use roster data as fallback
              setDetailData(createRosterOnlyData(influencer))
            }
          } else {
            // No username found for the requested platform
            // Check if influencer has the platform at all
            const hasPlatform = availablePlatforms.includes(platformToUse)
            
            if (!hasPlatform) {
              console.warn(`⚠️ Roster Analytics: Influencer doesn't have platform ${platformToUse}. Available: ${availablePlatforms.join(', ') || 'none'}`)
              setError(`This influencer doesn't have ${platformToUse} connected. Available platforms: ${availablePlatforms.join(', ') || 'none'}. Please add ${platformToUse} in influencer settings.`)
            } else {
              console.warn(`⚠️ Roster Analytics: No username found for platform ${platformToUse} - cannot fetch Modash analytics`)
              setError(`No username found for ${platformToUse}. Please add the platform username in the influencer settings to fetch analytics.`)
            }
            
            setDetailData(createRosterOnlyData(influencer))
            return // Stop here - cannot proceed without username
          }
        }

      } catch (err) {
        // Check if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('📭 Analytics fetch cancelled (component unmounted or dependencies changed)')
          return
        }
        
        console.error('Error loading analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load influencer analytics')
        setDetailData(createRosterOnlyData(influencer))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompleteData()

    // Cleanup: abort in-flight requests on unmount or dependency change
    return () => {
      abortController.abort()
    }
  }, [influencer?.id, isOpen, selectedPlatform, influencer])

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

