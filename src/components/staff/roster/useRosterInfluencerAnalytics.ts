/**
 * useRosterInfluencerAnalytics Hook
 * SIMPLIFIED: Get platform username from database, then fetch Modash analytics directly
 */

import { useState, useEffect, useRef } from 'react'
import { StaffInfluencer } from '@/types/staff'
import { ANALYTICS_CACHE_TTL_MS } from '@/constants/analytics'
import { enrichWithRosterData, createRosterOnlyData } from './utils/enrichmentHelpers'
import { validatePlatformSelection } from './utils/platformValidator'
import { resolveModashUserId, isUUID } from '@/lib/utils/modash-userid-validator'

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
        const platformValidation = validatePlatformSelection(influencer, selectedPlatform)
        
        // Early exit if no valid platform found (blocking error)
        if (!platformValidation.platformToUse) {
          setError(platformValidation.error || 'Unable to determine platform')
          setDetailData(createRosterOnlyData(influencer))
          return
        }

        const platformToUse = platformValidation.platformToUse
        
        // Show non-blocking warning if platform was auto-switched
        // This allows analytics to proceed but informs user of the switch
        if (platformValidation.wasAutoSwitched) {
          console.warn(`⚠️ Roster Analytics: Platform auto-switched: ${platformValidation.error}`)
          // Note: We don't set error here - this is informational only
          // Analytics will proceed with the auto-selected platform
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
        
        // Step 1: Check if we have stored Modash userId
        // CRITICAL: TWO SOURCES:
        // 1. Flow 1 (Discovery): userId in notes.modash_data
        // 2. Flow 2 (Sign-up): modash_user_id in influencer_platforms table
        // CRITICAL: If we detect ANY UUID, skip userId lookup entirely and use username search
        let modashUserId: string | null = null
        let platformDataCache: { username: string | null; modash_user_id: string | null } | null = null
        
        // Fetch platform data first (we need username anyway, and it includes modash_user_id)
        try {
          const platformDataResponse = await fetch(`/api/influencers/${influencer.id}/platform-username?platform=${platformToUse}`, {
            signal: abortController.signal
          })
          
          if (platformDataResponse.ok) {
            const platformData = await platformDataResponse.json()
            platformDataCache = {
              username: platformData.username || null,
              modash_user_id: platformData.modash_user_id || null
            }
          }
        } catch (err) {
          console.warn(`⚠️ Roster Analytics: Failed to fetch platform data:`, err)
        }
        
        // Source 1: Check notes.modash_data (Flow 1 - Discovery)
        if (notesObject) {
          const storedPlatforms = notesObject.modash_data?.platforms
          const storedUserId = storedPlatforms?.[platformToUse]?.userId
          const legacyUserId = notesObject.modash_data?.userId || notesObject.modash_data?.modash_user_id
          const storedPlatform = notesObject.modash_data?.platform

          // CRITICAL: Skip UUIDs immediately - don't even try to use them
          if (storedUserId && isUUID(storedUserId)) {
            console.warn(`⚠️ Roster Analytics: Detected UUID in notes.modash_data (${storedUserId}), skipping - will use username lookup`)
          } else if (legacyUserId && isUUID(legacyUserId)) {
            console.warn(`⚠️ Roster Analytics: Detected UUID in notes.modash_data.legacy (${legacyUserId}), skipping - will use username lookup`)
          } else {
            // Only try to resolve if it's not a UUID
            const resolution = resolveModashUserId([
              { 
                value: storedUserId, 
                name: 'platform-specific (notes)' 
              },
              { 
                value: legacyUserId, 
                name: 'legacy (notes)',
                platformCheck: () => {
                  const legacyPlatform = (storedPlatform || '').toLowerCase()
                  return !legacyPlatform || legacyPlatform === platformToUse
                }
              }
            ])

            if (resolution) {
              modashUserId = resolution.userId
              console.log(`✅ Roster Analytics: Found valid userId from ${resolution.source}: ${modashUserId}`)
            }
          }
        }
        
        // Source 2: Check influencer_platforms.modash_user_id (Flow 2 - Sign-up)
        // Only check if we didn't find userId in notes
        if (!modashUserId && platformDataCache?.modash_user_id) {
          const platformModashUserId = platformDataCache.modash_user_id
          
          // CRITICAL: Skip UUIDs immediately
          if (isUUID(platformModashUserId)) {
            console.warn(`⚠️ Roster Analytics: Detected UUID in influencer_platforms.modash_user_id (${platformModashUserId}), skipping - will use username lookup`)
          } else {
            // Validate this userId before using it
            const validation = resolveModashUserId([
              { value: platformModashUserId, name: 'influencer_platforms.modash_user_id (Flow 2)' }
            ])
            
            if (validation) {
              modashUserId = validation.userId
              console.log(`✅ Roster Analytics: Found valid userId from influencer_platforms.modash_user_id (Flow 2 - Sign-up): ${modashUserId}`)
            } else {
              console.warn(`⚠️ Roster Analytics: Invalid modash_user_id in influencer_platforms: ${platformModashUserId}`)
            }
          }
        }
        
        // CRITICAL FINAL CHECK: If we still have a userId but it's a UUID, clear it NOW
        // This prevents ANY UUID from reaching the API
        if (modashUserId && isUUID(modashUserId)) {
          console.warn(`⚠️ Roster Analytics: FINAL CHECK - Detected UUID (${modashUserId}), clearing immediately - will use username lookup`)
          modashUserId = null
        }
        
        if (!modashUserId) {
          console.log(`📭 Roster Analytics: No valid stored userId found (or UUID detected), will use username lookup`)
        }

        // Step 2: If we have userId, use it directly (skip username search - FASTEST)
        if (modashUserId) {
          // CRITICAL: One more UUID check right before API call (paranoid safety check)
          if (isUUID(modashUserId)) {
            console.error(`❌ Roster Analytics: UUID detected RIGHT BEFORE API CALL (${modashUserId}) - THIS SHOULD NEVER HAPPEN! Using username lookup instead.`)
            modashUserId = null
          } else {
            // YouTube-specific check: if userId doesn't look like a channel ID, treat as username
            if (platformToUse === 'youtube' && !modashUserId.startsWith('UC')) {
              console.warn(`⚠️ Roster Analytics: YouTube userId "${modashUserId}" doesn't start with 'UC', treating as username`)
              // Clear userId to trigger username search instead
              modashUserId = null
            } else {
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
                  console.log(`✅ Roster Analytics: Successfully fetched Modash data using userId ${modashUserId}`)
                  // CRITICAL: Clear any previous errors before setting success data
                  setError(null)
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
                const errorMessage = errorData?.error || errorData?.message || 'Unknown error'
                const errorCode = errorData?.errorCode
                
                // CRITICAL: If rate limited (429), DO NOT retry or fallback - stop immediately
                if (statusCode === 429) {
                  setError('Rate limit exceeded. Please wait a few minutes before trying again.')
                  setDetailData(createRosterOnlyData(influencer))
                  return // Exit early - don't cascade more API calls
                }
                
                // For 400/404 errors, ALWAYS try username search as fallback
                // This handles: invalid userId, UUID detected, account not found, etc.
                // Even if errorData is empty {}, we should still try username search
                if (statusCode === 400 || statusCode === 404) {
                  // Log warning (not error) since we're handling it with fallback
                  console.warn(`⚠️ Roster Analytics: userId lookup returned ${statusCode}, will fallback to username search:`, { 
                    errorData, 
                    errorMessage, 
                    errorCode,
                    userId: modashUserId 
                  })
                  const isInvalidUserId = errorCode === 'INVALID_UUID_AS_USERID' ||
                                         errorCode === 'INVALID_USERID_FORMAT' ||
                                         (errorMessage && (
                                           errorMessage.includes('Invalid userId') ||
                                           errorMessage.includes('UUID') ||
                                           errorMessage.includes('internal database ID') ||
                                           errorMessage.includes('Modash userId')
                                         ))
                  const isAccountNotFound = errorCode === 'ACCOUNT_NOT_FOUND' ||
                                           errorCode === 'account_not_found' ||
                                           (errorMessage && (
                                             errorMessage.includes('account_not_found') || 
                                             errorMessage.includes('not found')
                                           ))
                  
                  if (isInvalidUserId) {
                    console.warn(`⚠️ Roster Analytics: Invalid userId "${modashUserId}" detected, falling back to username search`)
                  } else if (isAccountNotFound || statusCode === 404) {
                    // 404 always means account not found - fallback silently
                    console.log(`ℹ️ Roster Analytics: Account not found with userId "${modashUserId}" (404), falling back to username search`)
                  } else {
                    // Even with empty error data, fallback to username search for 400/404
                    console.warn(`⚠️ Roster Analytics: userId lookup failed (${statusCode}), falling back to username search`)
                  }
                  
                  // CRITICAL: Clear error state before fallback to ensure clean state
                  setError(null)
                  
                  // CRITICAL: Clear userId to trigger username search fallback
                  modashUserId = null
                  // Continue to username search below - don't return here
                } else {
                  // For other errors (500, etc.), don't retry - use roster data only
                  console.error(`⚠️ Roster Analytics: Unexpected error (${statusCode}), using roster data only`)
                  setError(errorMessage || `Failed to fetch analytics (${statusCode})`)
                  setDetailData(createRosterOnlyData(influencer))
                  return
                }
              }
            }
          }
        }

        // Step 3: Fallback to username search if no userId or userId failed
        if (!modashUserId) {
          console.log(`🔍 Roster Analytics: No stored userId or userId lookup failed, trying username search...`)
          
          // CRITICAL: Ensure error state is cleared when starting username fallback
          // This prevents stale error messages from previous failed userId attempts
          setError(null)
          
          // Get platform username from database (ALWAYS use database username, never trust notes)
          // Reuse cached platform data if we already fetched it in Step 2
          let username: string | null = null
          
          if (platformDataCache && platformDataCache.username) {
            // Use cached data (saves 1 API call!)
            username = platformDataCache.username
            console.log(`✅ Roster Analytics: Using cached username "${username}" for platform ${platformToUse}`)
          } else {
            // Fetch if not already cached
            const platformResponse = await fetch(`/api/influencers/${influencer.id}/platform-username?platform=${platformToUse}`, {
              signal: abortController.signal
            })
            
            if (platformResponse.ok) {
              const platformData = await platformResponse.json()
              username = platformData.success ? platformData.username : null
              if (username) {
                console.log(`✅ Roster Analytics: Found username "${username}" for platform ${platformToUse} from database`)
              } else {
                console.warn(`⚠️ Roster Analytics: Username endpoint returned success but no username`)
              }
            } else {
              const errorData = await platformResponse.json().catch(() => ({}))
              const statusCode = platformResponse.status
              console.error(`❌ Roster Analytics: Failed to get username (${statusCode}):`, errorData)
              
              // If username lookup fails, show error and use roster data only
              if (statusCode === 404) {
                setError(`No username found for ${platformToUse}. Please add the platform username in influencer settings.`)
              } else {
                setError(`Failed to retrieve username for ${platformToUse}. Please try again.`)
              }
              setDetailData(createRosterOnlyData(influencer))
              setIsLoading(false)
              return
            }
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
                console.log(`✅ Roster Analytics: Successfully fetched Modash data using username "${cleanUsername}"`)
                // CRITICAL: Database is KING ONLY for username and linked platforms
                // Modash is KING for ALL analytics (followers, engagement, posts, audience, etc.)
                setDetailData(enrichWithRosterData(modashData.data, influencer))
                await syncAnalyticsToServer(modashData.data, platformToUse)
                return
              } else {
                console.warn(`⚠️ Roster Analytics: Modash returned no data with username:`, modashData)
                setError(`Failed to load analytics. Modash returned no data for username "${username}".`)
                // Use roster data as fallback
                setDetailData(createRosterOnlyData(influencer))
              }
            } else {
              // Parse error response - handle both JSON and text responses
              let errorData: any = {}
              let errorText = ''
              try {
                const contentType = modashResponse.headers.get('content-type')
                if (contentType?.includes('application/json')) {
                  errorData = await modashResponse.json()
                } else {
                  errorText = await modashResponse.text()
                  try {
                    errorData = JSON.parse(errorText)
                  } catch {
                    errorData = { error: errorText || 'Unknown error' }
                  }
                }
              } catch (parseError) {
                console.warn('⚠️ Failed to parse error response:', parseError)
                errorData = { error: 'Unknown error' }
              }
              
              const statusCode = modashResponse.status
              const errorMessage = errorData?.error || errorData?.message || errorText || 'Unknown error'
              const errorCode = errorData?.errorCode || errorData?.code
              
              console.error(`❌ Roster Analytics: Modash API error with username (${statusCode}):`, { 
                errorData, 
                errorMessage, 
                errorCode,
                username: cleanUsername,
                platform: platformToUse,
                rawResponse: errorText || 'N/A'
              })

              // CRITICAL: If rate limited (429), stop immediately
              if (statusCode === 429) {
                setError('Rate limit exceeded. Please wait a few minutes before trying again.')
                setDetailData(createRosterOnlyData(influencer))
                return
              }

              // For 404 or account not found, show helpful error but still show roster data
              const isAccountNotFound = statusCode === 404 ||
                                       errorCode === 'account_not_found' ||
                                       errorCode === 'ACCOUNT_NOT_FOUND' ||
                                       (errorMessage && (
                                         errorMessage.toLowerCase().includes('account_not_found') || 
                                         errorMessage.toLowerCase().includes('not found') ||
                                         errorMessage.toLowerCase().includes('could not find')
                                       ))
              
              if (isAccountNotFound) {
                setError(`Account "${cleanUsername}" not found on ${platformToUse}. The username may be incorrect or the account doesn't exist in Modash. Showing roster data only.`)
              } else if (statusCode === 400) {
                setError(`Invalid request for username "${cleanUsername}" on ${platformToUse}. ${errorMessage || 'Please check the username and try again.'}`)
              } else {
                setError(errorMessage || `Failed to fetch analytics for "${cleanUsername}" (${statusCode}). Showing roster data only.`)
              }
              
              // Always show roster data as fallback - better than showing nothing
              setDetailData(createRosterOnlyData(influencer))
            }
          } else {
            // No username found for the platform
            // Note: We already validated the platform exists (platformValidation passed)
            // So this is purely a missing username issue
            console.warn(`⚠️ Roster Analytics: No username found for platform ${platformToUse} - cannot fetch Modash analytics`)
            setError(`No username found for ${platformToUse}. Please add the platform username in the influencer settings to fetch analytics.`)
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
  }, [influencer ? influencer.id : null, isOpen, selectedPlatform])

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

