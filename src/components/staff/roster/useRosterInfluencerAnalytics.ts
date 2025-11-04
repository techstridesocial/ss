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
        // Step 1: Get platform username from database (simple query)
        const platformResponse = await fetch(`/api/influencers/${influencer.id}/platform-username?platform=${selectedPlatform}`)
        
        let username: string | null = null
        if (platformResponse.ok) {
          const platformData = await platformResponse.json()
          username = platformData.success ? platformData.username : null
        }

        // Step 2: If we have username, fetch Modash analytics
        if (username) {
          const modashResponse = await fetch('/api/discovery/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: username,
              platform: selectedPlatform
            })
          })

          if (modashResponse.ok) {
            const modashData = await modashResponse.json()
            
            if (modashData.success && modashData.data) {
              // Merge Modash data with roster influencer data we already have
              setDetailData({
                ...modashData.data,
                // Preserve roster-specific fields
                id: influencer.id,
                display_name: influencer.display_name,
                assigned_to: influencer.assigned_to,
                labels: influencer.labels || [],
                notes: influencer.notes,
                // Mark as roster influencer
                isRosterInfluencer: true,
                rosterId: influencer.id,
                hasPreservedAnalytics: true
              })
            } else {
              // Modash failed, use roster data as fallback
              setDetailData({
                ...influencer,
                isRosterInfluencer: true,
                rosterId: influencer.id
              })
            }
          } else {
            // Modash API error, use roster data as fallback
            setDetailData({
              ...influencer,
              isRosterInfluencer: true,
              rosterId: influencer.id
            })
          }
        } else {
          // No username found, use roster data only
          setDetailData({
            ...influencer,
            isRosterInfluencer: true,
            rosterId: influencer.id
          })
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

