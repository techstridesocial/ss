/**
 * useInfluencerAnalytics Hook
 * Fetches influencer analytics with React Query caching
 * CRITICAL: For roster influencers, should NOT use this hook - data comes from useRosterInfluencerAnalytics
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/queryClient'
import { InfluencerData } from '../types'
import { isUUID } from '@/lib/utils/modash-userid-validator'

interface UseInfluencerAnalyticsProps {
  influencerId: string | undefined
  platform: string
  enabled: boolean
  username?: string // Optional username for fallback when influencerId is UUID
}

export function useInfluencerAnalytics({ 
  influencerId, 
  platform, 
  enabled,
  username
}: UseInfluencerAnalyticsProps) {
  return useQuery({
    queryKey: queryKeys.influencers.analytics(influencerId || '', platform, username || ''),
    queryFn: async () => {
      if (!influencerId) {
        throw new Error('No influencer ID provided')
      }

      // CRITICAL: If influencerId is a UUID (internal database ID), use username instead
      // This prevents sending UUIDs to Modash API
      let identifier = influencerId
      let useUsername = false
      
      if (isUUID(influencerId)) {
        if (username) {
          console.warn(`⚠️ useInfluencerAnalytics: influencerId is UUID, using username "${username}" instead`)
          identifier = username
          useUsername = true
        } else {
          // Don't throw error - let React Query retry when username becomes available
          // This allows automatic retry without manual "Try Again" button
          throw new Error('Waiting for username: UUID detected but username not yet available')
        }
      }

      const response = await fetch('/api/discovery/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(useUsername ? { username: identifier } : { userId: identifier }),
          platform: platform || 'instagram',
          includePerformanceData: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `Error ${response.status}: Failed to fetch analytics`)
      }

      const data = await response.json()
      
      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to load analytics data')
      }

      return data.data as InfluencerData
    },
    enabled: enabled && !!influencerId && (!isUUID(influencerId) || !!username), // Don't enable if UUID without username
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: (failureCount, error) => {
      // Retry if username becomes available (error message indicates waiting for username)
      if (error instanceof Error && error.message.includes('Waiting for username')) {
        // Keep retrying when username becomes available
        return true
      }
      // Standard retry for other errors (up to 2 times)
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(500 * (attemptIndex + 1), 2000) // Faster retries when waiting for username
  })
}

