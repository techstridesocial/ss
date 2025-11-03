/**
 * useRosterData Hook
 * Manages roster data loading and state
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { StaffInfluencer } from '@/types/staff'

export function useRosterData() {
  const { getToken } = useAuth()
  const [influencers, setInfluencers] = useState<StaffInfluencer[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadInfluencers = async () => {
    try {
      setLoadError(null)
      const token = await getToken()
      if (!token) {
        setLoadError('Authentication required. Please sign in.')
        setInfluencers([])
        setIsInitialLoading(false)
        return
      }

      const response = await fetch('/api/influencers/light', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setInfluencers(result.data)
          setLoadError(null)
          setIsInitialLoading(false)
          return result.data
        } else {
          setLoadError(result.error || 'Failed to load influencers')
          setInfluencers([])
          setIsInitialLoading(false)
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load influencers' }))
        setLoadError(errorData.error || `Error ${response.status}: ${response.statusText}`)
        setInfluencers([])
        setIsInitialLoading(false)
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Network error. Please check your connection.')
      setInfluencers([])
      setIsInitialLoading(false)
    }
  }

  // Load on mount
  useEffect(() => {
    loadInfluencers()
  }, [])

  const refreshInfluencers = () => loadInfluencers()

  return {
    influencers,
    setInfluencers,
    isInitialLoading,
    loadError,
    loadInfluencers,
    refreshInfluencers
  }
}

