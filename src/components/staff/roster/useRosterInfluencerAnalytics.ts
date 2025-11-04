/**
 * useRosterInfluencerAnalytics Hook
 * Fetches complete influencer data from database including platforms
 * Then fetches Modash analytics
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
        // Step 1: Fetch complete influencer data from our database including platforms
        const dbResponse = await fetch(`/api/influencers/${influencer.id}/complete`)
        
        if (!dbResponse.ok) {
          throw new Error('Failed to fetch influencer details')
        }

        const dbData = await dbResponse.json()
        
        if (!dbData.success || !dbData.data) {
          throw new Error(dbData.error || 'No influencer data returned')
        }

        const completeInfluencer = dbData.data

        // Step 2: Find the platform to fetch Modash data for
        const platformData = completeInfluencer.platforms?.find((p: any) => 
          p.platform?.toLowerCase() === selectedPlatform.toLowerCase() && p.username
        )

        if (!platformData || !platformData.username) {
          // No platform data, just use database data
          setDetailData({
            ...completeInfluencer,
            isRosterInfluencer: true,
            rosterId: influencer.id
          })
          setIsLoading(false)
          return
        }

        // Step 3: Fetch Modash analytics using the platform username
        const modashResponse = await fetch('/api/discovery/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: platformData.username,
            platform: selectedPlatform
          })
        })

        if (modashResponse.ok) {
          const modashData = await modashResponse.json()
          
          if (modashData.success && modashData.data) {
            // Merge database data with Modash data
            setDetailData({
              ...completeInfluencer,
              ...modashData.data,
              // Preserve database fields
              id: completeInfluencer.id,
              display_name: completeInfluencer.display_name,
              assigned_to: completeInfluencer.assigned_to,
              labels: completeInfluencer.labels,
              notes: completeInfluencer.notes,
              // Mark as roster influencer
              isRosterInfluencer: true,
              rosterId: influencer.id,
              hasPreservedAnalytics: true
            })
          } else {
            // Modash failed, use DB data only
            setDetailData({
              ...completeInfluencer,
              isRosterInfluencer: true,
              rosterId: influencer.id
            })
          }
        } else {
          // Modash API error, use DB data
          setDetailData({
            ...completeInfluencer,
            isRosterInfluencer: true,
            rosterId: influencer.id
          })
        }

      } catch (err) {
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

