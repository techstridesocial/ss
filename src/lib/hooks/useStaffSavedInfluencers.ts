'use client'

import { useState, useEffect } from 'react'

export interface StaffSavedInfluencer {
  id: string
  username: string
  display_name: string
  platform: 'instagram' | 'tiktok' | 'youtube'
  followers: number
  engagement_rate: number
  avg_likes?: number
  avg_views?: number
  avg_comments?: number
  profile_picture?: string
  bio?: string
  location?: string
  niches?: string[]
  profile_url?: string
  modash_user_id?: string
  modash_data?: any
  saved_by: string
  saved_by_email: string
  saved_at: string
  added_to_roster: boolean
  added_to_roster_by?: string
  added_to_roster_by_email?: string
  added_to_roster_at?: string
}

export function useStaffSavedInfluencers(platform?: string) {
  const [savedInfluencers, setSavedInfluencers] = useState<StaffSavedInfluencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load saved influencers
  const loadSavedInfluencers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (platform) {
        params.append('platform', platform)
      }
      
      const response = await fetch(`/api/staff/saved-influencers?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved influencers')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setSavedInfluencers(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch saved influencers')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error loading saved influencers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Save an influencer
  const saveInfluencer = async (influencerData: Partial<StaffSavedInfluencer>) => {
    try {
      console.log('🔄 useStaffSavedInfluencers: Saving influencer data:', {
        username: influencerData.username,
        platform: influencerData.platform,
        followers: influencerData.followers,
        engagement_rate: influencerData.engagement_rate
      })

      const response = await fetch('/api/staff/saved-influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(influencerData)
      })
      
      console.log('📡 API Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        console.error('❌ API Error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save influencer`)
      }
      
      const result = await response.json()
      console.log('✅ API Success response:', result)
      
      if (result.success) {
        // Reload the list to get the updated data
        await loadSavedInfluencers()
        return result.data.id
      } else {
        throw new Error(result.error || 'Failed to save influencer')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ useStaffSavedInfluencers: Save failed:', errorMessage)
      setError(errorMessage)
      throw err
    }
  }

  // Remove a saved influencer
  const removeSavedInfluencer = async (username: string, platform: string) => {
    try {
      const params = new URLSearchParams({ username, platform })
      const response = await fetch(`/api/staff/saved-influencers?${params}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove influencer')
      }
      
      // Update local state immediately
      setSavedInfluencers(prev => 
        prev.filter(inf => !(inf.username === username && inf.platform === platform))
      )
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }

  // Add saved influencer to roster
  const addToRoster = async (
    savedInfluencerId: string, 
    influencerType: 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER' = 'PARTNERED',
    agencyName?: string
  ) => {
    try {
      const response = await fetch('/api/staff/saved-influencers/add-to-roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          saved_influencer_id: savedInfluencerId,
          influencer_type: influencerType,
          agency_name: agencyName
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add to roster')
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state to mark as added to roster
        setSavedInfluencers(prev => 
          prev.map(inf => 
            inf.id === savedInfluencerId 
              ? { ...inf, added_to_roster: true, added_to_roster_at: new Date().toISOString() }
              : inf
          )
        )
        return result.data.influencer_id
      } else {
        throw new Error(result.error || 'Failed to add to roster')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }

  // Check if influencer is saved
  const isInfluencerSaved = (username: string, platform: string) => {
    return savedInfluencers.some(inf => 
      inf.username === username && inf.platform === platform
    )
  }

  // Get saved influencer by username and platform
  const getSavedInfluencer = (username: string, platform: string) => {
    return savedInfluencers.find(inf => 
      inf.username === username && inf.platform === platform
    )
  }

  // Load data on mount and when platform changes
  useEffect(() => {
    loadSavedInfluencers()
  }, [platform])

  return {
    savedInfluencers,
    isLoading,
    error,
    loadSavedInfluencers,
    saveInfluencer,
    removeSavedInfluencer,
    addToRoster,
    isInfluencerSaved,
    getSavedInfluencer
  }
}
