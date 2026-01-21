/**
 * useRosterData Hook
 * Manages roster data loading and state with React Query caching
 */

import { useState } from 'react'
import { useStaffRoster, staffQueryKeys } from '@/hooks/useStaffData'
import { useQueryClient } from '@tanstack/react-query'
import { StaffInfluencer } from '@/types/staff'

export function useRosterData() {
  // Use cached React Query hook for instant page loads
  const { data: rosterData, isLoading: isInitialLoading, error: queryError } = useStaffRoster()
  const queryClient = useQueryClient()
  
  // Local state for optimistic updates
  const [influencers, setInfluencers] = useState<StaffInfluencer[]>([])
  
  // Use server data as source of truth, fall back to local state
  const serverInfluencers = rosterData?.data || []
  const displayInfluencers = serverInfluencers.length > 0 ? serverInfluencers : influencers
  
  const loadError = queryError ? (queryError as Error).message : null

  const loadInfluencers = () => {
    queryClient.invalidateQueries({ queryKey: staffQueryKeys.roster })
  }

  const refreshInfluencers = () => loadInfluencers()

  return {
    influencers: displayInfluencers,
    setInfluencers,
    isInitialLoading,
    loadError,
    loadInfluencers,
    refreshInfluencers
  }
}

