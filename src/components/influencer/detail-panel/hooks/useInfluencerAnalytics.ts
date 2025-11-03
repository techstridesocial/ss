/**
 * useInfluencerAnalytics Hook
 * Fetches influencer analytics with React Query caching
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/queryClient'
import { InfluencerData } from '../types'

interface UseInfluencerAnalyticsProps {
  influencerId: string | undefined
  platform: string
  enabled: boolean
}

export function useInfluencerAnalytics({ 
  influencerId, 
  platform, 
  enabled 
}: UseInfluencerAnalyticsProps) {
  return useQuery({
    queryKey: queryKeys.influencers.analytics(influencerId || '', platform),
    queryFn: async () => {
      if (!influencerId) {
        throw new Error('No influencer ID provided')
      }

      const response = await fetch('/api/modash/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: influencerId,
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
    enabled: enabled && !!influencerId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
  })
}

